import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Analyze a workflow and suggest optimizations
 * 
 * Payload:
 * {
 *   workflow_id: "workflow_123",
 *   workflow_config: {} // Current workflow configuration
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, workflow_config } = await req.json();

    if (!workflow_config) {
      return Response.json({ error: 'Workflow configuration is required' }, { status: 400 });
    }

    // Analyze workflow with AI
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a workflow optimization expert. Analyze this workflow and provide specific optimization recommendations:

Workflow Configuration:
${JSON.stringify(workflow_config, null, 2)}

Analyze for:
1. Performance improvements (parallel execution, caching, batching)
2. Error handling and resilience
3. Resource efficiency
4. Code quality and maintainability
5. Security and best practices

Return a JSON object with this structure:
{
  "overall_score": 85, // 0-100
  "optimizations": [
    {
      "category": "performance|reliability|security|maintainability",
      "severity": "critical|high|medium|low",
      "title": "Short title",
      "description": "Detailed explanation",
      "recommendation": "Specific action to take",
      "impact": "Expected benefit"
    }
  ],
  "estimated_improvement": {
    "speed": "20% faster",
    "reliability": "30% fewer errors",
    "cost": "15% cost reduction"
  },
  "priority_actions": ["Action 1", "Action 2", "Action 3"]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          optimizations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                severity: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                recommendation: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          estimated_improvement: {
            type: "object",
            properties: {
              speed: { type: "string" },
              reliability: { type: "string" },
              cost: { type: "string" }
            }
          },
          priority_actions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: result,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});