import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, platforms } = await req.json();

    if (!productId || !platforms || platforms.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the product
    const product = await base44.entities.EcommerceProduct.filter({ id: productId });
    if (!product || product.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const publishedProduct = product[0];
    const results = {};

    // Process each platform
    for (const platform of platforms) {
      try {
        const platformPayload = {
          product: {
            title: publishedProduct.title,
            description: publishedProduct.description,
            price: publishedProduct.price,
            sku: publishedProduct.sku,
            images: publishedProduct.images || [],
            seoTitle: publishedProduct.seo_title,
            seoDescription: publishedProduct.seo_description,
            seoKeywords: publishedProduct.seo_keywords,
            tags: publishedProduct.tags
          },
          platform
        };

        // Simulate platform API integration
        // In production, you'd call actual platform APIs here
        const mockProductId = `${platform.toLowerCase()}_${publishedProduct.id}_${Date.now()}`;
        
        results[platform] = {
          success: true,
          productId: mockProductId,
          url: `https://${platform.toLowerCase()}.com/product/${mockProductId}`,
          syncedAt: new Date().toISOString(),
          status: 'active'
        };
      } catch (error) {
        results[platform] = {
          success: false,
          error: error.message
        };
      }
    }

    // Update product with platform data
    const platformIds = { ...(publishedProduct.platform_ids || {}) };
    const platformList = [...new Set([...(publishedProduct.platforms || []), ...platforms])];
    
    Object.entries(results).forEach(([platform, data]) => {
      if (data.success) {
        platformIds[platform] = data.productId;
      }
    });

    // Update the product in the database
    await base44.entities.EcommerceProduct.update(publishedProduct.id, {
      platforms: platformList,
      platform_ids: platformIds,
      status: 'published'
    });

    return Response.json({
      success: true,
      results,
      message: `Product published to ${Object.values(results).filter(r => r.success).length} platform(s)`
    });

  } catch (error) {
    console.error('Publish error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});