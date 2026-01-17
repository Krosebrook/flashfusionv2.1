import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, productIds } = await req.json();

    // Get sync configuration
    const syncConfigs = await base44.entities.SyncConfiguration.filter(
      { platform, created_by: user.email },
      null,
      1
    );

    if (!syncConfigs || syncConfigs.length === 0) {
      return Response.json({ error: 'Sync config not found' }, { status: 404 });
    }

    const config = syncConfigs[0];
    const syncResults = [];
    const conflicts = [];

    // Sync each product with conflict detection
    for (const productId of productIds || []) {
      const product = await base44.entities.EcommerceProduct.filter(
        { id: productId },
        null,
        1
      );

      if (!product || product.length === 0) continue;

      const localProduct = product[0];

      // Simulate fetching product from platform
      const platformProduct = {
        id: productId,
        title: localProduct.title,
        price: localProduct.price + Math.random() * 10, // Simulated difference
        inventory: localProduct.inventory - Math.floor(Math.random() * 5),
        description: localProduct.description,
        images: localProduct.images
      };

      // Check for conflicts
      if (config.data_types.includes('pricing') && Math.abs(platformProduct.price - localProduct.price) > 1) {
        conflicts.push({
          productId,
          field: 'price',
          local_value: localProduct.price,
          platform_value: platformProduct.price,
          timestamp: new Date().toISOString()
        });

        // Apply conflict resolution strategy
        if (config.conflict_resolution === 'platform_wins') {
          localProduct.price = platformProduct.price;
        } else if (config.conflict_resolution === 'local_wins') {
          platformProduct.price = localProduct.price;
        } else if (config.conflict_resolution === 'manual') {
          // Store for manual review
          await base44.entities.SyncConfiguration.update(config.id, {
            last_conflict: {
              product_id: productId,
              field: 'price',
              local_value: localProduct.price,
              platform_value: platformProduct.price,
              timestamp: new Date().toISOString()
            }
          });
          continue;
        }
      }

      // Perform selective sync based on config
      const updates = {};
      if (config.data_types.includes('descriptions')) {
        updates.description = platformProduct.description;
      }
      if (config.data_types.includes('pricing')) {
        updates.price = platformProduct.price;
      }
      if (config.data_types.includes('inventory')) {
        updates.inventory = platformProduct.inventory;
      }
      if (config.data_types.includes('images')) {
        updates.images = platformProduct.images;
      }

      // Update product
      if (Object.keys(updates).length > 0) {
        await base44.entities.EcommerceProduct.update(productId, updates);
      }

      syncResults.push({
        productId,
        status: 'success',
        dataTypesUpdated: Object.keys(updates)
      });
    }

    return Response.json({
      success: true,
      platform,
      syncResults,
      conflictsDetected: conflicts.length,
      conflicts
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});