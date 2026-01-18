import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Initialize IntegrationConfig for all integrations
 * Run this once to seed the database
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const integrations = [
    { id: 'google_sheets', name: 'Google Sheets', category: 'oauth_connector', rps: 2 },
    { id: 'google_drive', name: 'Google Drive', category: 'oauth_connector', rps: 2 },
    { id: 'google_docs', name: 'Google Docs', category: 'oauth_connector', rps: 2 },
    { id: 'google_slides', name: 'Google Slides', category: 'oauth_connector', rps: 2 },
    { id: 'google_calendar', name: 'Google Calendar', category: 'oauth_connector', rps: 2 },
    { id: 'slack', name: 'Slack', category: 'oauth_connector', rps: 1 },
    { id: 'notion', name: 'Notion', category: 'oauth_connector', rps: 3 },
    { id: 'linkedin', name: 'LinkedIn', category: 'oauth_connector', rps: 1 },
    { id: 'tiktok', name: 'TikTok', category: 'oauth_connector', rps: 1 },
    { id: 'resend', name: 'Resend (Email)', category: 'manual_api', rps: 2 },
    { id: 'twilio', name: 'Twilio (SMS)', category: 'manual_api', rps: 1 },
    { id: 'openai_tts', name: 'OpenAI TTS', category: 'manual_api', rps: 5 },
    { id: 'elevenlabs', name: 'ElevenLabs', category: 'manual_api', rps: 2 },
    { id: 'fal_ai', name: 'Fal AI', category: 'manual_api', rps: 1 },
    { id: 'brightdata', name: 'BrightData', category: 'manual_api', rps: 1 },
    { id: 'x', name: 'X (Twitter)', category: 'manual_api', rps: 1 },
    { id: 'hubspot', name: 'HubSpot', category: 'manual_api', rps: 10 },
    { id: 'monday', name: 'Monday.com', category: 'manual_api', rps: 2 },
    { id: 'zapier', name: 'Zapier Webhooks', category: 'manual_api', rps: 5 },
    { id: 'custom_api', name: 'Custom API', category: 'custom', rps: 1 }
  ];

  try {
    for (const int of integrations) {
      const existing = await base44.asServiceRole.entities.IntegrationConfig.filter({
        integration_id: int.id
      });

      if (existing.length === 0) {
        await base44.asServiceRole.entities.IntegrationConfig.create({
          integration_id: int.id,
          name: int.name,
          category: int.category,
          enabled: false,
          settings_json: JSON.stringify({
            rate_limit_rps: int.rps,
            max_retries: 5,
            backoff_base_sec: 2,
            batch_size: 50
          }),
          connector_status: int.category === 'oauth_connector' ? 'not_authorized' : null
        });
      }
    }

    return Response.json({ success: true, initialized: integrations.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});