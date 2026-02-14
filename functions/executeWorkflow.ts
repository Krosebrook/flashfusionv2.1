import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Execute a workflow with support for:
 * - Sequential execution
 * - Parallel execution
 * - Conditional logic (if/else, switch)
 * 
 * Payload:
 * {
 *   workflow_id: "workflow_123",
 *   input_data: {} // Initial workflow data
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, input_data = {} } = await req.json();

    if (!workflow_id) {
      return Response.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    // Fetch workflow
    const workflow = await base44.asServiceRole.entities.AdvancedWorkflow.get(workflow_id);
    
    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const startTime = Date.now();
    let context = { ...input_data };
    const executedSteps = [];
    const parallelTimeSaved = 0;

    // Helper to evaluate condition
    const evaluateCondition = (condition, context) => {
      try {
        const func = new Function('context', `return ${condition}`);
        return func(context);
      } catch (err) {
        console.error('Condition evaluation error:', err);
        return false;
      }
    };

    // Helper to execute a single step
    const executeStep = async (step) => {
      const stepStart = Date.now();
      try {
        // Simulate step execution (replace with actual agent/function call)
        console.log(`Executing step ${step.id}: ${step.agent_name}`);
        
        // In a real implementation, call the agent/function here
        // const result = await base44.functions.invoke(step.agent_id, context);
        
        const result = {
          status: 'success',
          output: { message: `Step ${step.id} completed` }
        };

        executedSteps.push({
          step_id: step.id,
          status: 'success',
          duration_ms: Date.now() - stepStart
        });

        return result;
      } catch (error) {
        executedSteps.push({
          step_id: step.id,
          status: 'failed',
          error: error.message,
          duration_ms: Date.now() - stepStart
        });
        throw error;
      }
    };

    // Group steps by execution mode
    const steps = workflow.steps || [];
    let currentIndex = 0;

    while (currentIndex < steps.length) {
      const currentStep = steps[currentIndex];

      // Check if this is part of a parallel group
      const parallelGroup = steps.filter(
        s => s.execution_mode === 'parallel' && 
        s.parallel_group === currentStep.parallel_group
      );

      if (parallelGroup.length > 1 && currentStep.execution_mode === 'parallel') {
        // Execute parallel group
        const parallelStart = Date.now();
        const parallelPromises = parallelGroup.map(step => executeStep(step));
        const results = await Promise.all(parallelPromises);
        
        // Merge results into context
        results.forEach((result, idx) => {
          context[`step_${parallelGroup[idx].id}_result`] = result;
        });

        // Skip already executed parallel steps
        currentIndex += parallelGroup.length;
      } else {
        // Execute sequential step
        const result = await executeStep(currentStep);
        context[`step_${currentStep.id}_result`] = result;

        // Handle conditional logic
        if (currentStep.condition?.type === 'if') {
          const conditionMet = evaluateCondition(currentStep.condition.condition, context);
          const nextStepId = conditionMet 
            ? currentStep.condition.then_step 
            : currentStep.condition.else_step;
          
          if (nextStepId) {
            const nextIndex = steps.findIndex(s => s.id === nextStepId);
            if (nextIndex !== -1) {
              currentIndex = nextIndex;
              continue;
            }
          }
        } else if (currentStep.condition?.type === 'switch') {
          const switchValue = evaluateCondition(currentStep.condition.switch_variable, context);
          const cases = currentStep.condition.cases || {};
          const nextStepId = cases[switchValue] || cases.default;
          
          if (nextStepId) {
            const nextIndex = steps.findIndex(s => s.id === nextStepId);
            if (nextIndex !== -1) {
              currentIndex = nextIndex;
              continue;
            }
          }
        }

        currentIndex++;
      }
    }

    const duration = Date.now() - startTime;

    // Update execution history
    const executionRecord = {
      executed_at: new Date().toISOString(),
      status: 'success',
      duration_ms: duration,
      parallel_execution_time_ms: parallelTimeSaved,
      steps_completed: executedSteps.length,
      executed_steps: executedSteps
    };

    await base44.asServiceRole.entities.AdvancedWorkflow.update(workflow_id, {
      execution_history: [...(workflow.execution_history || []), executionRecord]
    });

    return Response.json({
      success: true,
      workflow_id,
      duration_ms: duration,
      steps_executed: executedSteps.length,
      output: context,
      execution_record: executionRecord
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});