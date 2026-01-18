import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

/**
 * Enqueues an outbox item with idempotency
 * Returns existing if idempotency_key matches
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { integration_id, operation, stable_resource_id, payload } = body;

  try {
    if (!integration_id || !operation || !stable_resource_id || !payload) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate deterministic idempotency key
    const payloadStr = JSON.stringify(payload);
    const dataToHash = `${integration_id}:${operation}:${stable_resource_id}:${payloadStr}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataToHash));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const idempotency_key = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check if already exists
    const existing = await base44.asServiceRole.entities.IntegrationOutbox.filter({
      idempotency_key
    });

    if (existing.length > 0) {
      return Response.json({
        success: true,
        outbox_id: existing[0].id,
        status: existing[0].status,
        exists: true
      });
    }

    // Create new outbox entry
    const outbox = await base44.asServiceRole.entities.IntegrationOutbox.create({
      integration_id,
      operation,
      stable_resource_id,
      payload_json: payloadStr,
      idempotency_key,
      status: 'queued',
      attempt_count: 0,
      next_attempt_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      outbox_id: outbox.id,
      status: 'queued',
      exists: false
    });
  } catch (error) {
    console.error('enqueueOutbox error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});