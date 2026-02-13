import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Analyze workflow performance and identify bottlenecks
 * 
 * Payload:
 * {
 *   workflow_id: "workflow_123",
 *   execution_history: [] // Recent execution data
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, execution_history } = await req.json();

    // Fetch workflow details
    const workflow = await base44.entities.Workflow.filter({ id: workflow_id });
    if (!workflow || workflow.length === 0) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Prepare execution data for analysis
    const executionSummary = {
      total_executions: execution_history?.length || 0,
      avg_duration: execution_history?.reduce((sum, e) => sum + (e.duration || 0), 0) / (execution_history?.length || 1),
      success_rate: (execution_history?.filter(e => e.status === 'success').length / (execution_history?.length || 1)) * 100,
      error_rate: (execution_history?.filter(e => e.status === 'failed').length / (execution_history?.length || 1)) * 100,
      recent_executions: execution_history?.slice(0, 10) || []
    };

    // AI analysis of performance
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a workflow performance analyst. Analyze this workflow's execution data and identify bottlenecks:

Workflow: ${workflow[0].name}
Configuration: ${JSON.stringify(workflow[0].config || {}, null, 2)}

Execution Summary:
- Total Executions: ${executionSummary.total_executions}
- Average Duration: ${executionSummary.avg_duration}ms
- Success Rate: ${executionSummary.success_rate}%
- Error Rate: ${executionSummary.error_rate}%

Recent Executions:
${JSON.stringify(executionSummary.recent_executions, null, 2)}

Identify:
1. Performance bottlenecks (slow steps, blocking operations)
2. Error patterns and root causes
3. Resource constraints
4. Scaling issues
5. Optimization opportunities

Return a JSON object with this structure:
{
  "health_status": "healthy|warning|critical",
  "performance_score": 75, // 0-100
  "bottlenecks": [
    {
      "step_id": "step_1",
      "step_name": "Step name",
      "issue": "Description of bottleneck",
      "impact": "high|medium|low",
      "avg_duration": 1500,
      "recommendation": "How to fix"
    }
  ],
  "error_patterns": [
    {
      "pattern": "Error description",
      "frequency": "Common|Occasional|Rare",
      "root_cause": "Likely cause",
      "solution": "Recommended fix"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation"
  ],
  "predicted_improvements": {
    "speed": "Expected speed improvement",
    "reliability": "Expected reliability improvement"
  }
}`,
      response_json_schema: {
        type: "object",
        properties: {
          health_status: { type: "string" },
          performance_score: { type: "number" },
          bottlenecks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_id: { type: "string" },
                step_name: { type: "string" },
                issue: { type: "string" },
                impact: { type: "string" },
                avg_duration: { type: "number" },
                recommendation: { type: "string" }
              }
            }
          },
          error_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                frequency: { type: "string" },
                root_cause: { type: "string" },
                solution: { type: "string" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: { type: "string" }
          },
          predicted_improvements: {
            type: "object",
            properties: {
              speed: { type: "string" },
              reliability: { type: "string" }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: result,
      workflow_id,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});