import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHmac } from 'node:crypto';

/**
 * Trigger webhooks for an event
 * Payload: { event_type: string, data: object }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_type, data } = await req.json();

    // Find active webhooks subscribed to this event
    const webhooks = await base44.asServiceRole.entities.WebhookSubscription.filter({
      is_active: true
    });

    const subscribedWebhooks = webhooks.filter(wh => wh.events?.includes(event_type));

    if (subscribedWebhooks.length === 0) {
      return Response.json({ message: 'No webhooks subscribed to this event' });
    }

    // Deliver to each webhook
    const deliveries = await Promise.all(
      subscribedWebhooks.map(webhook => deliverWebhook(base44, webhook, event_type, data))
    );

    return Response.json({
      success: true,
      event_type,
      webhooks_triggered: deliveries.length,
      deliveries
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function deliverWebhook(base44, webhook, event_type, data) {
  const payload = {
    event: event_type,
    timestamp: new Date().toISOString(),
    data
  };

  const payloadString = JSON.stringify(payload);

  // Create signature
  let signature = '';
  if (webhook.secret) {
    const hmac = createHmac('sha256', webhook.secret);
    hmac.update(payloadString);
    signature = hmac.digest('hex');
  }

  // Create log entry
  const log = await base44.asServiceRole.entities.WebhookLog.create({
    webhook_id: webhook.id,
    event_type,
    payload: payloadString,
    status: 'pending',
    attempt_count: 1
  });

  try {
    // Send webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Event-Type': event_type
      },
      body: payloadString
    });

    const responseBody = await response.text();

    // Update log
    await base44.asServiceRole.entities.WebhookLog.update(log.id, {
      status: response.ok ? 'success' : 'failed',
      response_code: response.status,
      response_body: responseBody.slice(0, 1000),
      delivered_at: response.ok ? new Date().toISOString() : null,
      error_message: response.ok ? null : `HTTP ${response.status}`
    });

    // Update webhook stats
    await base44.asServiceRole.entities.WebhookSubscription.update(webhook.id, {
      last_triggered_at: response.ok ? new Date().toISOString() : webhook.last_triggered_at,
      total_deliveries: (webhook.total_deliveries || 0) + 1,
      failed_deliveries: response.ok ? webhook.failed_deliveries : (webhook.failed_deliveries || 0) + 1
    });

    return {
      webhook_id: webhook.id,
      success: response.ok,
      status_code: response.status
    };

  } catch (error) {
    // Update log on error
    await base44.asServiceRole.entities.WebhookLog.update(log.id, {
      status: 'failed',
      error_message: error.message
    });

    await base44.asServiceRole.entities.WebhookSubscription.update(webhook.id, {
      failed_deliveries: (webhook.failed_deliveries || 0) + 1
    });

    return {
      webhook_id: webhook.id,
      success: false,
      error: error.message
    };
  }
}