import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const runId = await createReconcileRun(base44, 'hubspot');
  try {
    const config = await getIntegrationConfig(base44, 'hubspot');
    if (!config?.enabled) {
      await finishRun(base44, runId, 'success', { message: 'Disabled' });
      return Response.json({ success: true });
    }
    const stuck = await base44.asServiceRole.entities.IntegrationOutbox.filter({
      integration_id: 'hubspot', status: 'queued'
    });
    let fixed = 0;
    for (const item of stuck) {
      if (new Date(item.created_date) < new Date(Date.now() - 6 * 60 * 60 * 1000)) {
        await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
          next_attempt_at: new Date().toISOString()
        });
        fixed++;
      }
    }
    await finishRun(base44, runId, 'success', { checked: stuck.length, drift_fixed: fixed });
    return Response.json({ success: true, fixed });
  } catch (error) {
    await finishRun(base44, runId, 'failed', { error: error.message });
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function createReconcileRun(base44, id) {
  return (await base44.asServiceRole.entities.ReconcileRun.create({
    integration_id: id, started_at: new Date().toISOString(), status: 'in_progress'
  })).id;
}

async function finishRun(base44, runId, status, notes) {
  await base44.asServiceRole.entities.ReconcileRun.update(runId, {
    finished_at: new Date().toISOString(), status, notes_json: JSON.stringify(notes), ...notes
  });
}

async function getIntegrationConfig(base44, id) {
  return (await base44.asServiceRole.entities.IntegrationConfig.filter({ integration_id: id }))[0] || null;
}