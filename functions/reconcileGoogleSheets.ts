import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const runId = await createReconcileRun(base44, 'google_sheets');

  try {
    const config = await getIntegrationConfig(base44, 'google_sheets');
    if (!config?.enabled) {
      await finishRun(base44, runId, 'success', { message: 'Integration disabled' });
      return Response.json({ success: true, message: 'Disabled' });
    }

    // Re-enqueue stuck items (queued > 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const stuck = await base44.asServiceRole.entities.IntegrationOutbox.filter({
      integration_id: 'google_sheets',
      status: 'queued'
    });

    let fixed = 0;
    for (const item of stuck) {
      if (new Date(item.created_date) < sixHoursAgo) {
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

async function createReconcileRun(base44, integration_id) {
  const run = await base44.asServiceRole.entities.ReconcileRun.create({
    integration_id,
    started_at: new Date().toISOString(),
    status: 'in_progress'
  });
  return run.id;
}

async function finishRun(base44, runId, status, notes) {
  await base44.asServiceRole.entities.ReconcileRun.update(runId, {
    finished_at: new Date().toISOString(),
    status,
    notes_json: JSON.stringify(notes),
    ...notes
  });
}

async function getIntegrationConfig(base44, integration_id) {
  const configs = await base44.asServiceRole.entities.IntegrationConfig.filter({ integration_id });
  return configs[0] || null;
}