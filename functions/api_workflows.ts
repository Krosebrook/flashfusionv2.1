import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * API endpoint for workflows
 * GET /api/workflows - List workflows
 * GET /api/workflows?id=:id - Get workflow by ID
 * POST /api/workflows/execute?id=:id - Execute workflow
 */

async function validateAPIKey(req, base44) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return { valid: false, error: 'API key required' };
  }

  const keys = await base44.asServiceRole.entities.APIKey.filter({ key: apiKey, is_active: true });
  if (keys.length === 0) {
    return { valid: false, error: 'Invalid API key' };
  }

  const key = keys[0];
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return { valid: false, error: 'API key expired' };
  }

  return { valid: true, key };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const method = req.method;

    const auth = await validateAPIKey(req, base44);
    if (!auth.valid) {
      return Response.json({ error: auth.error }, { status: 401 });
    }

    const permissions = auth.key.permissions?.workflows || {};

    await base44.asServiceRole.entities.APIKey.update(auth.key.id, {
      last_used_at: new Date().toISOString()
    });

    if (method === 'GET' && !url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const limit = parseInt(url.searchParams.get('limit') || '50');
      const status = url.searchParams.get('status');
      
      let workflows;
      if (status) {
        workflows = await base44.asServiceRole.entities.AdvancedWorkflow.filter({ status });
      } else {
        workflows = await base44.asServiceRole.entities.AdvancedWorkflow.list('-created_date', limit);
      }

      return Response.json({ data: workflows, count: workflows.length });
    }

    if (method === 'GET' && url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      const workflows = await base44.asServiceRole.entities.AdvancedWorkflow.filter({ id });
      
      if (workflows.length === 0) {
        return Response.json({ error: 'Workflow not found' }, { status: 404 });
      }

      return Response.json({ data: workflows[0] });
    }

    if (method === 'POST' && url.pathname.includes('/execute')) {
      if (!permissions.execute) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      const body = await req.json();
      
      const workflows = await base44.asServiceRole.entities.AdvancedWorkflow.filter({ id });
      if (workflows.length === 0) {
        return Response.json({ error: 'Workflow not found' }, { status: 404 });
      }

      const workflow = workflows[0];
      if (workflow.status !== 'active') {
        return Response.json({ error: 'Workflow is not active' }, { status: 400 });
      }

      const executionId = `exec_${Date.now()}`;
      const startTime = Date.now();

      await base44.functions.invoke('triggerWebhook', {
        event_type: 'workflow.started',
        data: { workflow_id: id, execution_id: executionId }
      });

      try {
        // Simulate workflow execution (in real app, this would run the actual workflow steps)
        const result = { success: true, execution_id: executionId, input: body };

        const execution = {
          execution_id: executionId,
          executed_at: new Date().toISOString(),
          status: 'success',
          duration_ms: Date.now() - startTime,
          result
        };

        await base44.asServiceRole.entities.AdvancedWorkflow.update(id, {
          execution_history: [...(workflow.execution_history || []), execution]
        });

        await base44.functions.invoke('triggerWebhook', {
          event_type: 'workflow.completed',
          data: { workflow_id: id, execution_id: executionId, result }
        });

        return Response.json({ data: result });

      } catch (error) {
        await base44.functions.invoke('triggerWebhook', {
          event_type: 'workflow.failed',
          data: { workflow_id: id, execution_id: executionId, error: error.message }
        });

        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});