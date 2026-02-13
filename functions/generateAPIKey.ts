import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHash } from 'node:crypto';

/**
 * Generate a new API key
 * Payload: { name: string, permissions: object, rate_limit?: number, expires_at?: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { name, permissions, rate_limit, expires_at } = await req.json();

    // Generate random API key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const rawKey = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const apiKey = `ffl_${rawKey}`;

    // Hash the key for storage
    const hash = createHash('sha256');
    hash.update(apiKey);
    const hashedKey = hash.digest('hex');

    // Store in database
    const keyRecord = await base44.asServiceRole.entities.APIKey.create({
      name,
      key: hashedKey,
      prefix: apiKey.slice(0, 12),
      permissions,
      rate_limit: rate_limit || 1000,
      is_active: true,
      expires_at
    });

    // Return the raw key (only time it's shown)
    return Response.json({
      success: true,
      api_key: apiKey,
      key_id: keyRecord.id,
      prefix: keyRecord.prefix,
      message: 'Save this key securely - it will not be shown again'
    }, { status: 201 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});