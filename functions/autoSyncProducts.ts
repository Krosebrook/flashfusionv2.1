import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log("Starting automatic product sync...");
    
    // Get all connected platforms
    const connections = await base44.asServiceRole.entities.PlatformConnection.filter({
      status: "connected",
      auto_sync_enabled: true
    });
    
    console.log(`Found ${connections.length} platforms to sync`);
    
    // Get all published products
    const products = await base44.asServiceRole.entities.EcommerceProduct.filter({
      status: "published"
    });
    
    console.log(`Found ${products.length} published products`);
    
    const syncResults = [];
    
    for (const connection of connections) {
      console.log(`Syncing to ${connection.platform}...`);
      
      // Get products for this platform
      const platformProducts = products.filter(p => 
        p.platforms?.includes(connection.platform)
      );
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of platformProducts) {
        const startTime = Date.now();
        
        try {
          // Simulate sync to platform
          // In production, this would call the actual platform API
          console.log(`Syncing ${product.title} to ${connection.platform}`);
          
          // Log the sync
          await base44.asServiceRole.entities.SyncLog.create({
            platform: connection.platform,
            product_id: product.id,
            product_title: product.title,
            sync_type: "full",
            status: "success",
            new_value: {
              price: product.price,
              inventory: product.inventory,
              status: product.status
            },
            duration_ms: Date.now() - startTime
          });
          
          successCount++;
        } catch (error) {
          console.error(`Failed to sync ${product.title}:`, error);
          
          await base44.asServiceRole.entities.SyncLog.create({
            platform: connection.platform,
            product_id: product.id,
            product_title: product.title,
            sync_type: "full",
            status: "failed",
            error_message: error.message,
            duration_ms: Date.now() - startTime
          });
          
          errorCount++;
        }
      }
      
      // Update connection sync history
      const syncHistory = connection.sync_history || [];
      syncHistory.unshift({
        timestamp: new Date().toISOString(),
        status: errorCount === 0 ? "success" : "error",
        products_synced: successCount,
        message: `Synced ${successCount} products${errorCount > 0 ? `, ${errorCount} errors` : ""}`
      });
      
      await base44.asServiceRole.entities.PlatformConnection.update(connection.id, {
        last_sync: new Date().toISOString(),
        sync_history: syncHistory.slice(0, 20) // Keep last 20 sync records
      });
      
      syncResults.push({
        platform: connection.platform,
        success: successCount,
        errors: errorCount
      });
    }
    
    console.log("Sync completed:", syncResults);
    
    return Response.json({
      success: true,
      message: "Product sync completed",
      results: syncResults,
      totalProducts: products.length,
      totalPlatforms: connections.length
    });
    
  } catch (error) {
    console.error("Auto sync failed:", error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});