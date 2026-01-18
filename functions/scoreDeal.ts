import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered deal scoring engine
 * Analyzes deal fit against user criteria and historical patterns
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { deal_id, user_email } = body;

  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch deal data
    const deals = await base44.entities.DealData.filter({ id: deal_id });
    if (!deals.length) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }
    const deal = deals[0];

    // Fetch user profile and criteria
    const profiles = await base44.entities.UserProfile.filter({
      created_by: user_email || user.email
    });
    if (!profiles.length) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const profile = profiles[0];
    const criteria = profile.deal_sourcing_criteria || {};
    const goals = profile.portfolio_goals || {};

    // Build scoring prompt
    const prompt = `Analyze this investment opportunity against the user's criteria and provide a detailed scoring.

USER CRITERIA:
- Target Industries: ${criteria.target_industries?.join(', ') || 'Not specified'}
- Investment Size: $${criteria.investment_size_min}M - $${criteria.investment_size_max}M
- Deal Structures: ${criteria.deal_structures?.join(', ') || 'Any'}
- Geographic Preferences: ${criteria.geographic_preferences?.join(', ') || 'Any'}
- Risk Tolerance: ${criteria.risk_tolerance || 'moderate'}

USER GOALS:
- Time Horizon: ${goals.time_horizon || 'Not set'}
- Target Annual Return: ${goals.target_annual_return || 'Not set'}%
- Diversification: ${goals.diversification_strategy || 'Not set'}

DEAL DETAILS:
- Company: ${deal.company_name}
- Industry: ${deal.industry}
- Stage: ${deal.stage}
- Funding Raised: $${deal.funding_raised}M
- Valuation: $${deal.valuation}M
- Location: ${deal.headquarters}
- Description: ${deal.description}

Provide a JSON response with:
{
  "overall_score": 0-100,
  "dimension_scores": {
    "industry_fit": 0-100,
    "size_fit": 0-100,
    "stage_fit": 0-100,
    "geography_fit": 0-100,
    "risk_fit": 0-100,
    "goal_alignment": 0-100
  },
  "confidence": "high" | "medium" | "low",
  "key_strengths": ["string", "string"],
  "potential_concerns": ["string", "string"],
  "recommendation": "strong_match" | "good_match" | "moderate_match" | "weak_match",
  "reasoning": "2-3 sentence explanation"
}`;

    // Call AI for scoring
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          dimension_scores: { type: 'object' },
          confidence: { type: 'string' },
          key_strengths: { type: 'array', items: { type: 'string' } },
          potential_concerns: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' },
          reasoning: { type: 'string' }
        }
      }
    });

    const scoring = aiResponse;

    // Update deal with relevance score
    await base44.asServiceRole.entities.DealData.update(deal_id, {
      relevance_score: scoring.overall_score,
      ai_scoring: scoring
    });

    return Response.json({
      success: true,
      deal_id,
      scoring
    });
  } catch (error) {
    console.error('Deal scoring error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});