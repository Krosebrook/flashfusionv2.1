import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Webhook handler for real-time platform updates
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    const body = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const platform = req.headers.get('x-platform-name');

    // Get sync config to verify signature
    const syncConfigs = await base44.asServiceRole.entities.SyncConfiguration.filter(
      { platform, webhook_enabled: true },
      null,
      1
    );

    if (!syncConfigs || syncConfigs.length === 0) {
      return Response.json({ error: 'Webhook config not found' }, { status: 404 });
    }

    const config = syncConfigs[0];

    // Verify signature
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(body);
    const keyBuffer = encoder.encode(config.webhook_secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (computedSignature !== signature) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook data
    const payload = JSON.parse(body);

    // Handle product update
    if (payload.event_type === 'product_updated') {
      const product = await base44.asServiceRole.entities.EcommerceProduct.filter(
        { id: payload.product_id },
        null,
        1
      );

      if (product && product.length > 0) {
        const updates = {};

        // Update only configured data types
        if (config.data_types.includes('pricing') && payload.price) {
          updates.price = payload.price;
        }
        if (config.data_types.includes('inventory') && payload.inventory !== undefined) {
          updates.inventory = payload.inventory;
        }
        if (config.data_types.includes('descriptions') && payload.description) {
          updates.description = payload.description;
        }

        // Apply conflict resolution if needed
        if (config.conflict_resolution === 'manual') {
          // Check for differences before updating
          if (payload.price && Math.abs(payload.price - product[0].price) > 1) {
            await base44.asServiceRole.entities.SyncConfiguration.update(config.id, {
              last_conflict: {
                product_id: payload.product_id,
                field: 'price',
                local_value: product[0].price,
                platform_value: payload.price,
                timestamp: new Date().toISOString()
              }
            });
            return Response.json({ success: true, action: 'conflict_detected' });
          }
        }

        if (Object.keys(updates).length > 0) {
          await base44.asServiceRole.entities.EcommerceProduct.update(product[0].id, updates);
        }
      }

      // Log sync
      await base44.asServiceRole.entities.SyncLog.create({
        platform,
        product_id: payload.product_id,
        product_title: payload.product_title,
        sync_type: 'partial',
        status: 'success',
        duration_ms: 50
      });
    }

    return Response.json({ success: true, processed: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});