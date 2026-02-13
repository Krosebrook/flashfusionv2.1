import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * API endpoint for products
 * GET /api/products - List products
 * GET /api/products?id=:id - Get product by ID
 * POST /api/products - Create product
 * PUT /api/products?id=:id - Update product
 * DELETE /api/products?id=:id - Delete product
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

    const permissions = auth.key.permissions?.products || {};

    await base44.asServiceRole.entities.APIKey.update(auth.key.id, {
      last_used_at: new Date().toISOString()
    });

    if (method === 'GET' && !url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const limit = parseInt(url.searchParams.get('limit') || '50');
      const status = url.searchParams.get('status');
      
      let products;
      if (status) {
        products = await base44.asServiceRole.entities.EcommerceProduct.filter({ status });
      } else {
        products = await base44.asServiceRole.entities.EcommerceProduct.list('-created_date', limit);
      }

      return Response.json({ data: products, count: products.length });
    }

    if (method === 'GET' && url.searchParams.get('id')) {
      if (!permissions.read) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      const products = await base44.asServiceRole.entities.EcommerceProduct.filter({ id });
      
      if (products.length === 0) {
        return Response.json({ error: 'Product not found' }, { status: 404 });
      }

      return Response.json({ data: products[0] });
    }

    if (method === 'POST') {
      if (!permissions.write) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const body = await req.json();
      const product = await base44.asServiceRole.entities.EcommerceProduct.create(body);

      await base44.functions.invoke('triggerWebhook', {
        event_type: 'product.created',
        data: product
      });

      return Response.json({ data: product }, { status: 201 });
    }

    if (method === 'PUT') {
      if (!permissions.write) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const body = await req.json();
      const id = url.searchParams.get('id');
      
      const product = await base44.asServiceRole.entities.EcommerceProduct.update(id, body);

      await base44.functions.invoke('triggerWebhook', {
        event_type: 'product.updated',
        data: product
      });

      return Response.json({ data: product });
    }

    if (method === 'DELETE') {
      if (!permissions.delete) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const id = url.searchParams.get('id');
      await base44.asServiceRole.entities.EcommerceProduct.delete(id);

      await base44.functions.invoke('triggerWebhook', {
        event_type: 'product.deleted',
        data: { id }
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});