import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated notification system for integration failures
 * Sends alerts via email/Slack when integrations fail or hit rate limits
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { integration_id, error_type, error_message, context } = await req.json();

  try {
    // Get integration config
    const configs = await base44.asServiceRole.entities.IntegrationConfig.filter({
      integration_id
    });
    const config = configs[0];

    if (!config) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Determine severity
    const severity = error_type === 'rate_limit' ? 'warning' : 'error';
    const emoji = severity === 'error' ? '🚨' : '⚠️';

    // Build notification message
    const message = `${emoji} Integration Alert: ${config.name}

**Type:** ${error_type}
**Severity:** ${severity}
**Message:** ${error_message}

**Context:**
${JSON.stringify(context, null, 2)}

**Timestamp:** ${new Date().toISOString()}`;

    // Try to send Slack notification if enabled
    const slackConfigs = await base44.asServiceRole.entities.IntegrationConfig.filter({
      integration_id: 'slack',
      enabled: true
    });

    if (slackConfigs.length > 0) {
      try {
        // Enqueue Slack notification
        await base44.functions.invoke('enqueueOutbox', {
          integration_id: 'slack',
          operation: 'notify',
          stable_resource_id: `integration_failure_${Date.now()}`,
          payload: {
            channel: '#integration-alerts', // Configure as needed
            message,
            severity
          }
        });
      } catch (slackError) {
        console.error('Failed to enqueue Slack notification:', slackError);
      }
    }

    // Always try to send email to admin
    try {
      // Get all admin users
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      
      for (const admin of admins) {
        await base44.functions.invoke('enqueueOutbox', {
          integration_id: 'resend',
          operation: 'email',
          stable_resource_id: `integration_failure_${admin.email}_${Date.now()}`,
          payload: {
            to: admin.email,
            subject: `Integration ${severity === 'error' ? 'Failure' : 'Warning'}: ${config.name}`,
            body: message
          }
        });
      }
    } catch (emailError) {
      console.error('Failed to enqueue email notification:', emailError);
    }

    // Update integration config with last error
    await base44.asServiceRole.entities.IntegrationConfig.update(config.id, {
      last_error: `${error_type}: ${error_message}`,
      connector_status: severity === 'error' ? 'error' : config.connector_status
    });

    return Response.json({ 
      success: true, 
      message: 'Notifications sent',
      severity 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});