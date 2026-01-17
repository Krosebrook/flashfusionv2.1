import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const run = await base44.entities.ReconcileRun.create({
      integration_id: 'slack',
      started_at: new Date().toISOString(),
      status: 'in_progress'
    });

    // Re-enqueue stuck items > 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const stuck = await base44.entities.IntegrationOutbox.filter({
      integration_id: 'slack',
      status: 'queued',
      created_at: { $lt: sixHoursAgo }
    }, null, 500); // Conservative limit for Slack

    let driftFixed = 0;
    for (const item of stuck) {
      await base44.entities.IntegrationOutbox.update(item.id, {
        next_attempt_at: new Date().toISOString()
      });
      driftFixed += 1;
    }

    await base44.entities.ReconcileRun.update(run.id, {
      finished_at: new Date().toISOString(),
      status: 'success',
      checked: stuck.length,
      drift_fixed: driftFixed,
      notes_json: JSON.stringify({ reconciled_stuck_items: true, conservative_batch: true })
    });

    return Response.json({ success: true, run_id: run.id, drift_fixed: driftFixed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});