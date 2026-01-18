import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Analyzes sentiment of deal descriptions and external sources
 * Returns sentiment score, founder enthusiasm, investor sentiment
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { deal_id } = await req.json();

  try {
    const deal = await base44.entities.DealData.get(deal_id);
    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Build context for sentiment analysis
    const context = [
      `Company: ${deal.company_name}`,
      `Industry: ${deal.industry || 'Unknown'}`,
      `Stage: ${deal.stage || 'Unknown'}`,
      `Description: ${deal.description || 'No description available'}`
    ].join('\n');

    // Use LLM with internet context if we have source_url
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the sentiment of this startup/deal. Assess:
1. Overall sentiment (very_positive, positive, neutral, negative, very_negative)
2. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
3. Founder enthusiasm level (0-10 based on language used)
4. Investor sentiment (0-10 based on market perception and traction signals)
5. Key phrases that indicate sentiment

Context:
${context}`,
      add_context_from_internet: deal.source_url ? true : false,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_sentiment: {
            type: 'string',
            enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative']
          },
          sentiment_score: { type: 'number' },
          founder_enthusiasm: { type: 'number' },
          investor_sentiment: { type: 'number' },
          key_phrases: {
            type: 'array',
            items: { type: 'string' }
          },
          reasoning: { type: 'string' }
        },
        required: ['overall_sentiment', 'sentiment_score', 'founder_enthusiasm', 'investor_sentiment']
      }
    });

    const sentimentAnalysis = {
      ...response,
      analyzed_at: new Date().toISOString()
    };

    // Update deal with sentiment analysis
    await base44.entities.DealData.update(deal_id, {
      sentiment_analysis: sentimentAnalysis
    });

    return Response.json({ success: true, sentiment: sentimentAnalysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});