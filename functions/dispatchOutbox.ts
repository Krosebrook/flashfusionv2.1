import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Rate limit & retry policies per integration
const INTEGRATION_POLICIES = {
  google_sheets: { safe_rps: 30, max_retries: 3, backoff_base: 2 },
  google_drive: { safe_rps: 30, max_retries: 3, backoff_base: 2 },
  google_docs: { safe_rps: 30, max_retries: 3, backoff_base: 2 },
  google_slides: { safe_rps: 30, max_retries: 3, backoff_base: 2 },
  google_calendar: { safe_rps: 30, max_retries: 3, backoff_base: 2 },
  slack: { safe_rps: 1, max_retries: 5, backoff_base: 3 },
  resend: { safe_rps: 2, max_retries: 4, backoff_base: 2 },
  twilio: { safe_rps: 1, max_retries: 4, backoff_base: 2 },
  notion: { safe_rps: 3, max_retries: 3, backoff_base: 2 },
  openai_tts: { safe_rps: 5, max_retries: 3, backoff_base: 2 },
  elevenlabs: { safe_rps: 5, max_retries: 3, backoff_base: 2 },
  fal_ai: { safe_rps: 10, max_retries: 3, backoff_base: 2 },
  brightdata: { safe_rps: 1, max_retries: 2, backoff_base: 3 },
  x_api: { safe_rps: 2, max_retries: 3, backoff_base: 2 },
  hubspot: { safe_rps: 10, max_retries: 3, backoff_base: 2 },
  monday: { safe_rps: 5, max_retries: 3, backoff_base: 2 },
  zapier: { safe_rps: 5, max_retries: 3, backoff_base: 2 },
  custom_api: { safe_rps: 1, max_retries: 3, backoff_base: 2 }
};

// Dispatch outbox items to their respective integrations
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { batch_size = 50, integration_id_filter = null } = await req.json();

    // Fetch queued items
    let query = { status: 'queued' };
    if (integration_id_filter) {
      query.integration_id = integration_id_filter;
    }

    const queued = await base44.entities.IntegrationOutbox.filter(
      query,
      'next_attempt_at',
      batch_size
    );

    const results = {
      total_processed: 0,
      sent: 0,
      failed: 0,
      rate_limited: 0,
      items: []
    };

    for (const item of queued) {
      const policy = INTEGRATION_POLICIES[item.integration_id] || INTEGRATION_POLICIES.custom_api;

      // Placeholder: actual dispatch logic would call the provider
      // For now, we simulate success/failure
      const shouldFail = Math.random() < 0.05; // 5% failure rate for simulation
      const shouldRateLimit = Math.random() < 0.02; // 2% rate limit for simulation

      let status = 'sent';
      let error = null;
      let response = null;

      if (shouldRateLimit) {
        status = 'queued';
        error = 'Rate limited (429)';
        const nextAttempt = new Date(Date.now() + (policy.backoff_base ** item.attempt_count) * 1000);
        
        await base44.entities.IntegrationOutbox.update(item.id, {
          status,
          attempt_count: item.attempt_count + 1,
          next_attempt_at: nextAttempt.toISOString(),
          last_error: error,
          rate_limit_retry_after: policy.backoff_base ** item.attempt_count
        });
        
        results.rate_limited += 1;
      } else if (shouldFail && item.attempt_count < policy.max_retries) {
        status = 'queued';
        error = 'Transient error (simulated)';
        const backoffSec = Math.pow(policy.backoff_base, item.attempt_count);
        const nextAttempt = new Date(Date.now() + backoffSec * 1000);

        await base44.entities.IntegrationOutbox.update(item.id, {
          status,
          attempt_count: item.attempt_count + 1,
          next_attempt_at: nextAttempt.toISOString(),
          last_error: error
        });

        results.failed += 1;
      } else if (shouldFail && item.attempt_count >= policy.max_retries) {
        status = 'dead_letter';
        error = `Max retries exceeded (${policy.max_retries})`;

        await base44.entities.IntegrationOutbox.update(item.id, {
          status,
          last_error: error,
          provider_response_json: JSON.stringify({ error, final: true })
        });

        results.failed += 1;
      } else {
        // Success
        response = { success: true, message: 'Dispatched successfully' };
        await base44.entities.IntegrationOutbox.update(item.id, {
          status: 'sent',
          provider_response_json: JSON.stringify(response),
          attempt_count: item.attempt_count + 1
        });

        results.sent += 1;
      }

      results.items.push({
        outbox_id: item.id,
        integration_id: item.integration_id,
        operation: item.operation,
        stable_resource_id: item.stable_resource_id,
        status,
        attempt_count: item.attempt_count + 1,
        error
      });

      results.total_processed += 1;
    }

    return Response.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('dispatchOutbox error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});