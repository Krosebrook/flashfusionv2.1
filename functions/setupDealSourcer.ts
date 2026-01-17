import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Initialize integration registry
    await base44.functions.invoke('initializeIntegrations', {});

    // Create initial automation to check for deals daily
    const automation = await base44.functions.invoke('createAutomation', {
      automation_type: 'scheduled',
      name: 'Daily Deal Sync',
      function_name: 'syncDealData',
      repeat_interval: 1,
      repeat_unit: 'days',
      start_time: '06:00',
      function_args: {
        integration_id: 'all',
        query: ''
      }
    });

    return Response.json({
      success: true,
      message: 'Deal Sourcer initialized with 25 integrations',
      automation_id: automation.id
    });
  } catch (error) {
    console.error('Setup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});