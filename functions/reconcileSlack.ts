import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const runStartTime = Date.now();
  let runId = null;

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const run = await base44.entities.ReconcileRun.create({
      integration_id: 'slack',
      started_at: new Date().toISOString(),
      status: 'in_progress'
    });
    runId = run.id;

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const stuck = await base44.entities.IntegrationOutbox.filter({
      integration_id: 'slack',
      status: 'queued',
      created_at: { $lt: sixHoursAgo }
    }, null, 500); // Conservative limit for Slack

    let driftFixed = 0;
    let failures = 0;

    for (const item of stuck) {
      try {
        await base44.entities.IntegrationOutbox.update(item.id, {
          next_attempt_at: new Date().toISOString()
        });
        driftFixed += 1;
      } catch (itemErr) {
        failures += 1;
        console.error(`Failed to re-enqueue item ${item.id}:`, itemErr);
      }
    }

    const duration = Date.now() - runStartTime;
    await base44.entities.ReconcileRun.update(runId, {
      finished_at: new Date().toISOString(),
      status: failures === 0 ? 'success' : 'partial',
      checked: stuck.length,
      drift_fixed: driftFixed,
      failures,
      api_calls: stuck.length,
      notes_json: JSON.stringify({
        reconciled_stuck_items: true,
        conservative_batch: true,
        duration_ms: duration
      })
    });

    return Response.json({
      success: true,
      run_id: runId,
      drift_fixed: driftFixed,
      failures,
      duration_ms: duration
    });
  } catch (error) {
    console.error('reconcileSlack error:', error);
    if (runId) {
      try {
        await base44.entities.ReconcileRun.update(runId, {
          finished_at: new Date().toISOString(),
          status: 'failed',
          failures: 1,
          notes_json: JSON.stringify({
            error: error.message,
            duration_ms: Date.now() - runStartTime
          })
        });
      } catch (updateErr) {
        console.error('Failed to update run status:', updateErr);
      }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});