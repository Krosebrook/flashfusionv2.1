import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const runStartTime = Date.now();
  let runId = null;

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const run = await base44.entities.ReconcileRun.create({
      integration_id: 'resend',
      started_at: new Date().toISOString(),
      status: 'in_progress'
    });
    runId = run.id;

    const emailLogs = await base44.entities.EmailLog.filter({}, null, 1000);
    const outboxItems = await base44.entities.IntegrationOutbox.filter({
      integration_id: 'resend'
    }, null, 1000);

    let drift_fixed = 0;
    let failures = 0;

    for (const log of emailLogs) {
      try {
        const hasOutbox = outboxItems.some(item => 
          item.stable_resource_id === log.stable_resource_id && 
          item.status === 'sent'
        );
        if (!hasOutbox && log.status === 'pending') {
          await base44.functions.invoke('enqueueOutbox', {
            integration_id: 'resend',
            operation: 'send_email',
            stable_resource_id: log.id,
            payload_json: JSON.parse(log.payload_json)
          });
          drift_fixed += 1;
        }
      } catch (logErr) {
        failures += 1;
        console.error(`Failed to reconcile email log ${log.id}:`, logErr);
      }
    }

    const duration = Date.now() - runStartTime;
    await base44.entities.ReconcileRun.update(runId, {
      finished_at: new Date().toISOString(),
      status: failures === 0 ? 'success' : 'partial',
      checked: emailLogs.length,
      drift_fixed,
      failures,
      api_calls: emailLogs.length,
      notes_json: JSON.stringify({
        checked_email_logs: emailLogs.length,
        duration_ms: duration
      })
    });

    return Response.json({
      success: true,
      run_id: runId,
      drift_fixed,
      failures,
      duration_ms: duration
    });
  } catch (error) {
    console.error('reconcileResend error:', error);
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