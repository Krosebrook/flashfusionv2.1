import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Dispatches queued outbox items with rate limiting and retries
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { batch_size = 50, integration_filter = null } = body;

  try {
    // Fetch queued items ready to dispatch
    const query = integration_filter 
      ? { status: 'queued', integration_id: integration_filter }
      : { status: 'queued' };
    
    const items = await base44.asServiceRole.entities.IntegrationOutbox.filter(
      query,
      'next_attempt_at',
      batch_size
    );

    const results = { dispatched: 0, failed: 0, skipped: 0 };

    for (const item of items) {
      // Check if next_attempt_at is in the future
      if (new Date(item.next_attempt_at) > new Date()) {
        results.skipped++;
        continue;
      }

      try {
        const payload = JSON.parse(item.payload_json);
        let response;

        // Route to appropriate handler based on integration_id
        switch (item.integration_id) {
          case 'resend':
            response = await dispatchResend(base44, payload);
            break;
          case 'twilio':
            response = await dispatchTwilio(base44, payload);
            break;
          case 'slack':
            response = await dispatchSlack(base44, payload);
            break;
          case 'google_sheets':
            response = await dispatchGoogleSheets(base44, payload);
            break;
          default:
            response = { success: false, error: 'Unknown integration' };
        }

        if (response.success) {
          await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
            status: 'sent',
            provider_response_json: JSON.stringify(response)
          });
          results.dispatched++;
        } else {
          throw new Error(response.error || 'Dispatch failed');
        }
      } catch (error) {
        const newAttempt = item.attempt_count + 1;
        const maxAttempts = 5;

        if (newAttempt >= maxAttempts) {
          await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
            status: 'dead_letter',
            last_error: error.message,
            attempt_count: newAttempt
          });
        } else {
          // Exponential backoff: 2^attempt minutes
          const backoffMinutes = Math.pow(2, newAttempt);
          const nextAttempt = new Date(Date.now() + backoffMinutes * 60 * 1000);

          await base44.asServiceRole.entities.IntegrationOutbox.update(item.id, {
            status: 'queued',
            attempt_count: newAttempt,
            last_error: error.message,
            next_attempt_at: nextAttempt.toISOString()
          });
        }
        results.failed++;
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('dispatchOutbox error:', error);
    // Notify on critical failure
    try {
      await base44.functions.invoke('notifyIntegrationFailure', {
        integration_id: 'outbox_dispatcher',
        error_type: 'dispatch_failed',
        error_message: error.message,
        context: { batch_size }
      });
    } catch (notifyError) {
      console.error('Failed to send failure notification:', notifyError);
    }
    
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Dispatcher helpers
async function dispatchResend(base44, payload) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return { success: false, error: 'RESEND_API_KEY not set' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (response.status === 429) {
    throw new Error('Rate limited by Resend');
  }

  if (response.ok) {
    return { success: true, data: await response.json() };
  }
  return { success: false, error: await response.text() };
}

async function dispatchTwilio(base44, payload) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  if (!sid || !token) return { success: false, error: 'Twilio credentials not set' };

  const auth = btoa(`${sid}:${token}`);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(payload).toString()
  });

  if (response.status === 429) {
    throw new Error('Rate limited by Twilio');
  }

  if (response.ok) {
    return { success: true, data: await response.json() };
  }
  return { success: false, error: await response.text() };
}

async function dispatchSlack(base44, payload) {
  const token = await base44.asServiceRole.connectors.getAccessToken('slack');
  if (!token) return { success: false, error: 'Slack not authorized' };

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (data.error === 'rate_limited') {
    throw new Error('Rate limited by Slack');
  }
  
  if (data.ok) {
    return { success: true, data };
  }
  return { success: false, error: data.error };
}

async function dispatchGoogleSheets(base44, payload) {
  const token = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
  if (!token) return { success: false, error: 'Google Sheets not authorized' };

  const { spreadsheet_id, range, values } = payload;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  if (response.status === 429) {
    throw new Error('Rate limited by Google Sheets API');
  }

  if (response.ok) {
    return { success: true, data: await response.json() };
  }
  return { success: false, error: await response.text() };
}