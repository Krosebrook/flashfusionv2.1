import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Predicts potential deal outcomes using ML analysis
 * Estimates acquisition likelihood, IPO potential, time to exit
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { deal_id } = await req.json();

  try {
    const deal = await base44.entities.DealData.get(deal_id);
    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Build comprehensive context for prediction
    const context = `
Company: ${deal.company_name}
Industry: ${deal.industry || 'Unknown'}
Stage: ${deal.stage || 'Unknown'}
Funding Raised: $${deal.funding_raised || 0}M
Valuation: $${deal.valuation || 0}M
Location: ${deal.headquarters || 'Unknown'}
Description: ${deal.description || 'N/A'}

${deal.ai_scoring ? `AI Score: ${deal.ai_scoring.overall_score}/100
Key Strengths: ${deal.ai_scoring.key_strengths?.join(', ') || 'N/A'}
Concerns: ${deal.ai_scoring.potential_concerns?.join(', ') || 'N/A'}` : ''}

${deal.sentiment_analysis ? `Sentiment: ${deal.sentiment_analysis.overall_sentiment}
Founder Enthusiasm: ${deal.sentiment_analysis.founder_enthusiasm}/10
Investor Sentiment: ${deal.sentiment_analysis.investor_sentiment}/10` : ''}
`;

    // Use LLM with internet search for market intelligence
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `As an expert venture analyst, predict the likely outcome for this startup based on historical patterns, market conditions, and deal characteristics.

${context}

Analyze and predict:
1. Acquisition likelihood (0-100%): How likely is this company to be acquired?
2. IPO potential (0-100%): What's the probability of going public?
3. Unicorn probability (0-100%): Chance of reaching $1B+ valuation?
4. Time to exit (years): Estimated years until exit event
5. Risk factors: Key risks that could impact outcomes
6. Predicted outcome: Most likely outcome category
7. Confidence level: How confident are you in these predictions?

Consider: market trends, funding stage, traction indicators, competitive landscape, team quality, and timing.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          acquisition_likelihood: { type: 'number' },
          ipo_potential: { type: 'number' },
          unicorn_probability: { type: 'number' },
          time_to_exit_years: { type: 'number' },
          risk_factors: {
            type: 'array',
            items: { type: 'string' }
          },
          predicted_outcome: {
            type: 'string',
            enum: ['high_growth', 'steady_growth', 'plateau', 'acquisition_target', 'ipo_ready', 'high_risk']
          },
          confidence_level: {
            type: 'string',
            enum: ['very_high', 'high', 'medium', 'low']
          },
          reasoning: { type: 'string' }
        },
        required: ['acquisition_likelihood', 'ipo_potential', 'predicted_outcome', 'confidence_level']
      }
    });

    const outcomePrediction = {
      ...response,
      predicted_at: new Date().toISOString()
    };

    // Update deal with outcome prediction
    await base44.entities.DealData.update(deal_id, {
      outcome_prediction: outcomePrediction
    });

    return Response.json({ success: true, prediction: outcomePrediction });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});