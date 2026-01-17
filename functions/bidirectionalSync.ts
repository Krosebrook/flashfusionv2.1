import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Bidirectional sync function for e-commerce platforms
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, action } = await req.json();

    // Get platform connection
    const connection = await base44.entities.PlatformConnection.filter(
      { platform, created_by: user.email },
      '-updated_date',
      1
    );

    if (!connection || connection.length === 0) {
      return Response.json(
        { error: 'Platform not connected' },
        { status: 404 }
      );
    }

    const platformConn = connection[0];

    // Simulate syncing product data from platform
    if (action === 'pull') {
      const syncLog = await base44.entities.SyncLog.create({
        platform,
        product_id: 'batch_sync',
        product_title: 'Batch Sync',
        sync_type: 'full',
        status: 'in_progress',
        old_value: null,
        new_value: null
      });

      // Simulate API call to fetch products from platform
      // In production, this would call actual platform APIs using credentials
      await new Promise(resolve => setTimeout(resolve, 2000));

      await base44.entities.SyncLog.update(syncLog.id, {
        status: 'success',
        duration_ms: 2000
      });

      await base44.entities.PlatformConnection.update(platformConn.id, {
        last_sync: new Date().toISOString(),
        error_message: null
      });

      return Response.json({
        success: true,
        message: 'Products synced from platform',
        syncLog
      });
    }

    // Push product updates to platform
    if (action === 'push') {
      const products = await base44.entities.EcommerceProduct.filter(
        { platforms: { $in: [platform] } },
        '-updated_date',
        100
      );

      const syncLog = await base44.entities.SyncLog.create({
        platform,
        product_id: 'batch_sync',
        product_title: 'Batch Sync',
        sync_type: 'full',
        status: 'in_progress'
      });

      // Simulate pushing updates
      await new Promise(resolve => setTimeout(resolve, 1500));

      await base44.entities.SyncLog.update(syncLog.id, {
        status: 'success',
        duration_ms: 1500,
        new_value: { products_synced: products.length }
      });

      await base44.entities.PlatformConnection.update(platformConn.id, {
        last_sync: new Date().toISOString()
      });

      return Response.json({
        success: true,
        message: `Synced ${products.length} products to ${platform}`,
        syncLog
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});