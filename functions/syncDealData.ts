import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { integration_id, query } = body;

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to understand preferences
    const profiles = await base44.entities.UserProfile.filter({
      created_by: user.email
    });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'Complete onboarding first' }, { status: 400 });
    }

    let deals = [];

    // Route to appropriate integration
    switch (integration_id) {
      case 'perplexity':
        deals = await syncPerplexity(query, profile);
        break;
      case 'firecrawl':
        deals = await syncFirecrawl(query, profile);
        break;
      case 'crunchbase':
        deals = await syncCrunchbase(query, profile);
        break;
      case 'angellist':
        deals = await syncAngelList(query, profile);
        break;
      default:
        return Response.json({ error: 'Integration not supported' }, { status: 400 });
    }

    // Save deals to database
    for (const deal of deals) {
      try {
        await base44.entities.DealData.create({
          ...deal,
          source_integration: integration_id,
          created_by: user.email
        });
      } catch (e) {
        console.error('Failed to save deal:', e);
      }
    }

    // Update integration last_sync
    const integ = await base44.entities.IntegrationRegistry.filter({
      integration_id
    });
    if (integ.length > 0) {
      await base44.entities.IntegrationRegistry.update(integ[0].id, {
        last_sync: new Date().toISOString(),
        status: 'healthy'
      });
    }

    return Response.json({
      success: true,
      synced: deals.length,
      integration: integration_id
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function syncPerplexity(query, profile) {
  // Placeholder - would use Perplexity API
  return [];
}

async function syncFirecrawl(query, profile) {
  // Placeholder - would use Firecrawl API
  return [];
}

async function syncCrunchbase(query, profile) {
  // Placeholder - would use Crunchbase API
  return [];
}

async function syncAngelList(query, profile) {
  // Placeholder - would use AngelList API
  return [];
}