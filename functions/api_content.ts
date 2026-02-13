import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * API endpoint for content
 * GET /api/content - List content pieces
 * GET /api/content?id=:id - Get content by ID
 * POST /api/content - Create content
 * PUT /api/content?id=:id - Update content
 * DELETE /api/content?id=:id - Delete content
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

    const permissions = auth.key.permissions?.content || {};

    await base44.asServiceRole.entities.APIKey.update(auth.key.id, {
      last_used_at: new Date().toISOString()
    });

    if (method === 'GET' && !url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const limit = parseInt(url.searchParams.get('limit') || '50');
      const type = url.searchParams.get('type');
      
      let content;
      if (type) {
        content = await base44.asServiceRole.entities.ContentPiece.filter({ type });
      } else {
        content = await base44.asServiceRole.entities.ContentPiece.list('-created_date', limit);
      }

      return Response.json({ data: content, count: content.length });
    }

    if (method === 'GET' && url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      const content = await base44.asServiceRole.entities.ContentPiece.filter({ id });
      
      if (content.length === 0) {
        return Response.json({ error: 'Content not found' }, { status: 404 });
      }

      return Response.json({ data: content[0] });
    }

    if (method === 'POST') {
      if (!permissions.write) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const body = await req.json();
      const content = await base44.asServiceRole.entities.ContentPiece.create(body);

      await base44.functions.invoke('triggerWebhook', {
        event_type: 'content.created',
        data: content
      });

      return Response.json({ data: content }, { status: 201 });
    }

    if (method === 'PUT') {
      if (!permissions.write) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const body = await req.json();
      const id = url.searchParams.get('id');
      
      const content = await base44.asServiceRole.entities.ContentPiece.update(id, body);

      await base44.functions.invoke('triggerWebhook', {
        event_type: 'content.updated',
        data: content
      });

      return Response.json({ data: content });
    }

    if (method === 'DELETE') {
      if (!permissions.delete) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      await base44.asServiceRole.entities.ContentPiece.delete(id);

      await base44.functions.invoke('triggerWebhook', {
        event_type: 'content.deleted',
        data: { id }
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});