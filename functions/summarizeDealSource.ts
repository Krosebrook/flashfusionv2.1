import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generates AI summary of deal from external sources (news, press releases)
 * Uses web search to find recent news and generate comprehensive summary
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { deal_id } = await req.json();

  try {
    const deal = await base44.entities.DealData.get(deal_id);
    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Generate search query for the company
    const searchQuery = `${deal.company_name} ${deal.industry || ''} startup funding news`;

    // Use LLM with internet search to gather and summarize information
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Research and summarize this company/deal from external sources:

Company: ${deal.company_name}
Industry: ${deal.industry || 'Unknown'}
Stage: ${deal.stage || 'Unknown'}
Website: ${deal.website || 'Unknown'}
Source URL: ${deal.source_url || 'N/A'}

Search for recent news, press releases, funding announcements, and key developments.

Provide:
1. A comprehensive summary (2-3 paragraphs)
2. Key highlights (bullet points of important facts)
3. Recent news items (last 6 months)
4. List of sources analyzed`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_highlights: {
            type: 'array',
            items: { type: 'string' }
          },
          recent_news: {
            type: 'array',
            items: { type: 'string' }
          },
          sources_analyzed: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['summary', 'key_highlights']
      }
    });

    const externalSummary = {
      ...response,
      generated_at: new Date().toISOString()
    };

    // Update deal with external summary
    await base44.entities.DealData.update(deal_id, {
      external_summary: externalSummary
    });

    return Response.json({ success: true, summary: externalSummary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});