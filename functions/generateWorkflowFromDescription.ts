import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate a workflow template from natural language description
 * 
 * Payload:
 * {
 *   description: "Create a workflow that sends an email when a new product is added"
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description is required' }, { status: 400 });
    }

    // Use LLM to generate workflow structure
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a workflow automation expert. Generate a detailed workflow configuration based on this description: "${description}"

Return a JSON object with this structure:
{
  "name": "Workflow name",
  "description": "Detailed description",
  "trigger": {
    "type": "entity_create|entity_update|scheduled|webhook|manual",
    "config": {} // Trigger-specific config
  },
  "steps": [
    {
      "id": "step_1",
      "type": "action|condition|integration|transform",
      "name": "Step name",
      "config": {} // Step-specific config
    }
  ],
  "error_handling": {
    "on_error": "retry|fail|continue",
    "max_retries": 3
  }
}

Make it practical and production-ready. Include realistic step configurations.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          trigger: {
            type: "object",
            properties: {
              type: { type: "string" },
              config: { type: "object" }
            }
          },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                name: { type: "string" },
                config: { type: "object" }
              }
            }
          },
          error_handling: {
            type: "object",
            properties: {
              on_error: { type: "string" },
              max_retries: { type: "number" }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      workflow: result,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});