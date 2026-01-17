import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const INTEGRATIONS_CATALOG = [
  // AI & Research
  { id: 'perplexity', name: 'Perplexity', category: 'ai_research', type: 'api', use_cases: ['deal_research', 'market_analysis', 'competitor_intel'] },
  { id: 'firecrawl', name: 'Firecrawl', category: 'ai_research', type: 'api', use_cases: ['web_scraping', 'data_extraction', 'deal_discovery'] },
  { id: 'openai', name: 'OpenAI', category: 'ai_research', type: 'api', use_cases: ['analysis', 'summarization', 'recommendations'] },
  { id: 'anthropic', name: 'Claude (Anthropic)', category: 'ai_research', type: 'api', use_cases: ['deep_analysis', 'document_review', 'due_diligence'] },
  { id: 'openrouter', name: 'OpenRouter', category: 'ai_research', type: 'api', use_cases: ['llm_selection', 'cost_optimization'] },

  // Financial Data
  { id: 'crunchbase', name: 'Crunchbase', category: 'financial_data', type: 'api', use_cases: ['startup_data', 'funding_info', 'investor_tracking'] },
  { id: 'pitchbook', name: 'PitchBook', category: 'financial_data', type: 'api', use_cases: ['deal_data', 'market_insights', 'valuation'] },
  { id: 'alpha_vantage', name: 'Alpha Vantage', category: 'financial_data', type: 'api', use_cases: ['stock_data', 'technical_analysis'] },
  { id: 'yahoo_finance', name: 'Yahoo Finance API', category: 'financial_data', type: 'api', use_cases: ['market_prices', 'financial_statements'] },
  { id: 'bloomberg', name: 'Bloomberg', category: 'financial_data', type: 'api', use_cases: ['market_data', 'news', 'analysis'] },

  // Communication
  { id: 'slack', name: 'Slack', category: 'communication', type: 'oauth', use_cases: ['notifications', 'deal_alerts', 'team_collaboration'] },
  { id: 'resend', name: 'Resend', category: 'communication', type: 'api', use_cases: ['email_notifications', 'deal_alerts', 'reports'] },
  { id: 'twilio', name: 'Twilio', category: 'communication', type: 'api', use_cases: ['sms_alerts', 'urgent_notifications'] },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'communication', type: 'api', use_cases: ['voice_notifications', 'audio_alerts'] },

  // Productivity & Organization
  { id: 'notion', name: 'Notion', category: 'productivity', type: 'oauth', use_cases: ['deal_notes', 'due_diligence_docs', 'portfolio_tracking'] },
  { id: 'google_sheets', name: 'Google Sheets', category: 'productivity', type: 'oauth', use_cases: ['portfolio_tracking', 'exit_tracking', 'financial_models'] },
  { id: 'google_docs', name: 'Google Docs', category: 'productivity', type: 'oauth', use_cases: ['investment_memos', 'documentation'] },

  // Deal Sourcing
  { id: 'linkedin', name: 'LinkedIn', category: 'deal_sourcing', type: 'oauth', use_cases: ['founder_research', 'investor_outreach', 'market_intelligence'] },
  { id: 'angellist', name: 'AngelList', category: 'deal_sourcing', type: 'api', use_cases: ['deal_sourcing', 'founder_discovery', 'co_invest_opportunities'] },
  { id: 'dealroom', name: 'Dealroom', category: 'deal_sourcing', type: 'api', use_cases: ['european_deals', 'startup_database', 'investment_tracking'] },

  // Portfolio Management
  { id: 'carta', name: 'Carta', category: 'portfolio_mgmt', type: 'api', use_cases: ['cap_table_mgmt', 'valuation_tracking', 'liquidity_events'] },
  { id: 'stripe', name: 'Stripe', category: 'portfolio_mgmt', type: 'oauth', use_cases: ['payments', 'subscriptions', 'fund_operations'] },

  // Automation
  { id: 'zapier', name: 'Zapier', category: 'automation', type: 'api', use_cases: ['workflow_automation', 'data_syncing', 'cross_platform_integration'] }
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    let created = 0;
    let skipped = 0;

    for (const integ of INTEGRATIONS_CATALOG) {
      try {
        const existing = await base44.entities.IntegrationRegistry.filter({
          integration_id: integ.id
        });

        if (existing.length === 0) {
          await base44.entities.IntegrationRegistry.create({
            ...integ,
            config_json: JSON.stringify({
              enabled: false,
              rate_limit: 'default',
              retry_policy: 'exponential'
            })
          });
          created++;
        } else {
          skipped++;
        }
      } catch (e) {
        console.error(`Failed to create ${integ.id}:`, e);
      }
    }

    return Response.json({
      success: true,
      created,
      skipped,
      total: INTEGRATIONS_CATALOG.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});