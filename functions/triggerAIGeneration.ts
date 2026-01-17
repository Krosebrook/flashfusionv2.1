import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Trigger AI content/image generation for products from connected platforms
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productIds, generationType, platform } = await req.json();

    // Get brand kit for the user
    const brandKits = await base44.entities.BrandKit.filter(
      { created_by: user.email },
      '-updated_date',
      1
    );

    const brandKit = brandKits?.[0];

    // Fetch products
    const products = await base44.entities.EcommerceProduct.filter(
      { id: { $in: productIds } },
      null,
      100
    );

    const results = [];

    for (const product of products) {
      try {
        if (generationType === 'description') {
          // Generate AI description
          const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a compelling product description for: "${product.title}". 
            Category: ${product.category}
            Current description: ${product.description}
            Brand voice: ${brandKit?.voice_guide || 'professional and friendly'}
            Keep it under 200 words and optimized for e-commerce.`,
            response_json_schema: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                seo_keywords: { type: 'array', items: { type: 'string' } }
              }
            }
          });

          await base44.entities.EcommerceProduct.update(product.id, {
            description: response.description,
            seo_keywords: response.seo_keywords
          });

          results.push({
            productId: product.id,
            type: 'description',
            status: 'success'
          });
        } else if (generationType === 'image') {
          // Generate AI image
          const imageResponse = await base44.integrations.Core.GenerateImage({
            prompt: `Professional product photo of ${product.title}. ${product.description}. High quality, well-lit, on white background.`,
            existing_image_urls: product.images?.slice(0, 2)
          });

          if (imageResponse.url) {
            await base44.entities.EcommerceProduct.update(product.id, {
              images: [...(product.images || []), imageResponse.url]
            });

            results.push({
              productId: product.id,
              type: 'image',
              status: 'success',
              imageUrl: imageResponse.url
            });
          }
        }
      } catch (err) {
        results.push({
          productId: product.id,
          type: generationType,
          status: 'error',
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      platform,
      generationType,
      results,
      totalProcessed: products.length,
      successCount: results.filter(r => r.status === 'success').length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});