import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productIds, action } = await req.json();

    if (!productIds || productIds.length === 0) {
      return Response.json({ error: 'No products specified' }, { status: 400 });
    }

    const results = {
      synced: [],
      updated: [],
      errors: []
    };

    for (const productId of productIds) {
      try {
        const products = await base44.entities.EcommerceProduct.filter({ id: productId });
        if (!products || products.length === 0) {
          results.errors.push({ productId, message: 'Product not found' });
          continue;
        }

        const product = products[0];

        if (!product.platforms || product.platforms.length === 0) {
          results.errors.push({ productId, message: 'Product not published to any platform' });
          continue;
        }

        // Simulate syncing inventory and pricing to each platform
        const syncResults = {};
        for (const platform of product.platforms) {
          syncResults[platform] = {
            inventory: product.inventory || 0,
            price: product.price,
            lastSync: new Date().toISOString(),
            status: 'synced'
          };
        }

        // Update product sync metadata
        await base44.entities.EcommerceProduct.update(productId, {
          platform_sync: syncResults,
          last_platform_sync: new Date().toISOString()
        });

        results.synced.push({
          productId,
          title: product.title,
          platforms: product.platforms,
          syncResults
        });

      } catch (error) {
        results.errors.push({ productId, message: error.message });
      }
    }

    return Response.json({
      success: true,
      action,
      results,
      summary: {
        total: productIds.length,
        synced: results.synced.length,
        errors: results.errors.length
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});