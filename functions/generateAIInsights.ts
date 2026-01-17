import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's analytics data
    const [goals, usageLogs, products, contentPieces] = await Promise.all([
      base44.entities.PerformanceGoal.filter({ created_by: user.email }, '-created_date', 10),
      base44.entities.UsageLog.filter({ created_by: user.email }, '-created_date', 50),
      base44.entities.EcommerceProduct.filter({ created_by: user.email }, '-created_date', 50),
      base44.entities.ContentPiece.filter({ created_by: user.email }, '-created_date', 50)
    ]);

    // Prepare data summary
    const dataSummary = {
      activeGoals: goals.filter(g => g.status === 'on_track').length,
      totalCreditsUsed: usageLogs.reduce((sum, log) => sum + log.credits_used, 0),
      totalProducts: products.length,
      publishedProducts: products.filter(p => p.status === 'published').length,
      contentCreated: contentPieces.length,
      avgContentEngagement: contentPieces.length > 0 
        ? contentPieces.reduce((sum, c) => sum + (c.performance_data?.engagement || 0), 0) / contentPieces.length
        : 0
    };

    // Use LLM to generate insights
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this user's analytics data and provide 3-5 key insights and recommendations:
      
      Active Goals: ${dataSummary.activeGoals}
      Credits Used: ${dataSummary.totalCreditsUsed}
      E-commerce Products: ${dataSummary.publishedProducts}/${dataSummary.totalProducts} published
      Content Created: ${dataSummary.contentCreated} pieces
      Average Engagement: ${dataSummary.avgContentEngagement.toFixed(1)}%
      
      Return a JSON array of insights with: title (string), description (string), type (opportunity/warning/achievement/trend/recommendation), confidence (0-100), and recommendation (string).`,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string' },
                confidence: { type: 'number' },
                recommendation: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Save insights to database
    const insights = [];
    for (const insight of response.insights || []) {
      const saved = await base44.entities.AIInsight.create({
        title: insight.title,
        description: insight.description,
        type: insight.type,
        confidence: insight.confidence,
        recommendation: insight.recommendation,
        metric: 'user_analytics',
        generated_at: new Date().toISOString()
      });
      insights.push(saved);
    }

    return Response.json({
      success: true,
      insightsCount: insights.length,
      insights
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});