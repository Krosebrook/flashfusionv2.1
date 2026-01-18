import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated deal sourcing engine
 * Discovers and scores new deals matching user criteria
 * Should run daily via automation
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { user_email, limit = 10 } = body;

  try {
    // Fetch user profile
    const profiles = user_email 
      ? await base44.asServiceRole.entities.UserProfile.filter({ created_by: user_email })
      : await base44.asServiceRole.entities.UserProfile.list('-updated_date', 100);

    if (!profiles.length) {
      return Response.json({ error: 'No profiles found' }, { status: 404 });
    }

    const results = [];

    for (const profile of profiles) {
      const criteria = profile.deal_sourcing_criteria || {};
      const goals = profile.portfolio_goals || {};

      // Skip if no criteria set or user is dormant
      if (!criteria.target_industries?.length) {
        console.log(`Skipping ${profile.created_by}: No criteria set`);
        continue;
      }

      const lifecycle = profile.lifecycle_state || {};
      if (lifecycle.current_state === 'dormant') {
        console.log(`Skipping ${profile.created_by}: Dormant state`);
        continue;
      }

      // Build search query for AI
      const searchQuery = `Find ${limit} recent investment opportunities matching:
- Industries: ${criteria.target_industries.join(', ')}
- Investment size: $${criteria.investment_size_min}M - $${criteria.investment_size_max}M
- Stage: ${criteria.deal_structures?.join(', ') || 'any stage'}
- Geography: ${criteria.geographic_preferences?.join(', ') || 'global'}

Focus on deals announced or updated in the last 30 days. Include company name, industry, stage, funding amount, valuation, location, and brief description.`;

      // Use AI with internet search to find deals
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: searchQuery,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            deals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  industry: { type: 'string' },
                  stage: { type: 'string' },
                  funding_raised: { type: 'number' },
                  valuation: { type: 'number' },
                  headquarters: { type: 'string' },
                  description: { type: 'string' },
                  source_url: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const newDeals = aiResponse.deals || [];

      // Insert deals and score them
      const scoredDeals = [];
      for (const dealData of newDeals) {
        // Validate deal data
        if (!dealData.company_name || !dealData.industry) {
          console.log('Skipping invalid deal:', dealData);
          continue;
        }

        // Check if deal already exists
        const existing = await base44.asServiceRole.entities.DealData.filter({
          company_name: dealData.company_name
        });

        let dealId;
        if (existing.length === 0) {
          // Create new deal with defaults
          try {
            const created = await base44.asServiceRole.entities.DealData.create({
              company_name: dealData.company_name,
              industry: dealData.industry || 'Unknown',
              stage: dealData.stage || 'seed',
              funding_raised: dealData.funding_raised || 0,
              valuation: dealData.valuation || 0,
              headquarters: dealData.headquarters || 'Unknown',
              description: dealData.description || '',
              source_url: dealData.source_url || '',
              source_integration: 'ai_auto_sourcing',
              status: 'new',
              created_by: 'system'
            });
            dealId = created.id;
          } catch (createError) {
            console.error('Failed to create deal:', createError);
            continue;
          }
        } else {
          dealId = existing[0].id;
        }

        // Score the deal with retry logic
        let retries = 0;
        while (retries < 3) {
          try {
            const scoreResponse = await base44.functions.invoke('scoreDeal', {
              deal_id: dealId,
              user_email: profile.created_by
            });
            scoredDeals.push({
              deal_id: dealId,
              company: dealData.company_name,
              score: scoreResponse.scoring?.overall_score || 0
            });
            break;
          } catch (e) {
            retries++;
            console.error(`Scoring attempt ${retries} failed:`, e);
            if (retries >= 3) {
              console.error('Scoring failed after 3 attempts');
            }
          }
        }
      }

      // Trigger Discovery Loop if high-scoring deals found
      const highScoreDeals = scoredDeals.filter(d => d.score >= 70);
      if (highScoreDeals.length > 0) {
        const engagement = profile.engagement_state || {};
        const discovery = engagement.active_habit_loops?.discovery || {};

        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          engagement_state: {
            ...engagement,
            active_habit_loops: {
              ...engagement.active_habit_loops,
              discovery: {
                ...discovery,
                active: true,
                triggered_count: (discovery.triggered_count || 0) + 1,
                last_triggered_at: new Date().toISOString(),
                pending_deals: highScoreDeals.map(d => d.deal_id)
              }
            }
          }
        });
      }

      results.push({
        user: profile.created_by,
        deals_found: newDeals.length,
        deals_scored: scoredDeals.length,
        high_score_deals: highScoreDeals.length
      });
    }

    return Response.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Auto-sourcing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});