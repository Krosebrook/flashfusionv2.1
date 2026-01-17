import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Hash function for idempotency keys
async function sha256Hash(data) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Enqueue an outbox item (idempotent via idempotency_key)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integration_id, operation, stable_resource_id, payload_json } = await req.json();

    if (!integration_id || !operation || !stable_resource_id || !payload_json) {
      return Response.json(
        { error: 'Missing required fields: integration_id, operation, stable_resource_id, payload_json' },
        { status: 400 }
      );
    }

    // Generate deterministic idempotency key
    const payloadStr = JSON.stringify(payload_json);
    const hashInput = `${integration_id}|${operation}|${stable_resource_id}|${payloadStr}`;
    const idempotency_key = await sha256Hash(hashInput);

    // Check if this exact outbox item already exists (idempotency)
    const existing = await base44.entities.IntegrationOutbox.filter(
      { idempotency_key },
      null,
      1
    );

    if (existing && existing.length > 0) {
      return Response.json({
        success: true,
        created: false,
        message: 'Outbox item already exists (idempotent)',
        outbox_id: existing[0].id
      });
    }

    // Create new outbox item
    const outbox = await base44.entities.IntegrationOutbox.create({
      integration_id,
      operation,
      stable_resource_id,
      payload_json: typeof payload_json === 'string' ? payload_json : JSON.stringify(payload_json),
      idempotency_key,
      status: 'queued',
      attempt_count: 0,
      next_attempt_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      created: true,
      outbox_id: outbox.id,
      idempotency_key
    });
  } catch (error) {
    console.error('enqueueOutbox error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});