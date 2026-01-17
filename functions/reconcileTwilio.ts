import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const run = await base44.entities.ReconcileRun.create({
      integration_id: 'twilio',
      started_at: new Date().toISOString(),
      status: 'in_progress'
    });

    // Check SmsLog against Outbox for drift
    const smsLogs = await base44.entities.SmsLog.filter({}, null, 1000);
    const outboxItems = await base44.entities.IntegrationOutbox.filter({
      integration_id: 'twilio'
    }, null, 1000);

    let drift_fixed = 0;
    for (const log of smsLogs) {
      const hasOutbox = outboxItems.some(item => 
        item.stable_resource_id === log.stable_resource_id && 
        item.status === 'sent'
      );
      if (!hasOutbox && log.status === 'pending') {
        await base44.functions.invoke('enqueueOutbox', {
          integration_id: 'twilio',
          operation: 'send_sms',
          stable_resource_id: log.id,
          payload_json: JSON.parse(log.payload_json)
        });
        drift_fixed += 1;
      }
    }

    await base44.entities.ReconcileRun.update(run.id, {
      finished_at: new Date().toISOString(),
      status: 'success',
      checked: smsLogs.length,
      drift_fixed,
      notes_json: JSON.stringify({ checked_sms_logs: smsLogs.length })
    });

    return Response.json({ success: true, run_id: run.id, drift_fixed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});