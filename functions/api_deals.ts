import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * API endpoint for deals
 * GET /api/deals - List deals
 * GET /api/deals/:id - Get deal by ID
 * POST /api/deals - Create deal
 * PUT /api/deals/:id - Update deal
 * DELETE /api/deals/:id - Delete deal
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

    // Validate API key
    const auth = await validateAPIKey(req, base44);
    if (!auth.valid) {
      return Response.json({ error: auth.error }, { status: 401 });
    }

    const permissions = auth.key.permissions?.deals || {};

    // Update last used
    await base44.asServiceRole.entities.APIKey.update(auth.key.id, {
      last_used_at: new Date().toISOString()
    });

    // GET /api/deals
    if (method === 'GET' && !url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const limit = parseInt(url.searchParams.get('limit') || '50');
      const status = url.searchParams.get('status');
      
      let deals;
      if (status) {
        deals = await base44.asServiceRole.entities.DealData.filter({ status });
      } else {
        deals = await base44.asServiceRole.entities.DealData.list('-created_date', limit);
      }

      return Response.json({ data: deals, count: deals.length });
    }

    // GET /api/deals/:id
    if (method === 'GET' && url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      const deals = await base44.asServiceRole.entities.DealData.filter({ id });
      
      if (deals.length === 0) {
        return Response.json({ error: 'Deal not found' }, { status: 404 });
      }

      return Response.json({ data: deals[0] });
    }

    // POST /api/deals
    if (method === 'POST') {
      if (!permissions.write) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const body = await req.json();
      const deal = await base44.asServiceRole.entities.DealData.create(body);

      // Trigger webhook
      await base44.functions.invoke('triggerWebhook', {
        event_type: 'deal.created',
        data: deal
      });

      return Response.json({ data: deal }, { status: 201 });
    }

    // PUT /api/deals/:id
    if (method === 'PUT') {
      if (!permissions.write) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const body = await req.json();
      const id = url.searchParams.get('id');
      
      const deal = await base44.asServiceRole.entities.DealData.update(id, body);

      // Trigger webhook
      await base44.functions.invoke('triggerWebhook', {
        event_type: 'deal.updated',
        data: deal
      });

      return Response.json({ data: deal });
    }

    // DELETE /api/deals/:id
    if (method === 'DELETE') {
      if (!permissions.delete) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      await base44.asServiceRole.entities.DealData.delete(id);

      // Trigger webhook
      await base44.functions.invoke('triggerWebhook', {
        event_type: 'deal.deleted',
        data: { id }
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});