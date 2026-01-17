import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Switch
} from '@/components/ui/switch';
import { Search, RefreshCw, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const INTEGRATION_CATALOG = [
  { id: 'google_sheets', name: 'Google Sheets', category: 'oauth_connector' },
  { id: 'google_drive', name: 'Google Drive', category: 'oauth_connector' },
  { id: 'google_docs', name: 'Google Docs', category: 'oauth_connector' },
  { id: 'google_slides', name: 'Google Slides', category: 'oauth_connector' },
  { id: 'google_calendar', name: 'Google Calendar', category: 'oauth_connector' },
  { id: 'slack', name: 'Slack', category: 'oauth_connector' },
  { id: 'notion', name: 'Notion', category: 'oauth_connector' },
  { id: 'linkedin', name: 'LinkedIn', category: 'oauth_connector' },
  { id: 'tiktok', name: 'TikTok', category: 'oauth_connector' },
  { id: 'resend', name: 'Resend', category: 'manual_api' },
  { id: 'twilio', name: 'Twilio', category: 'manual_api' },
  { id: 'openai_tts', name: 'OpenAI TTS', category: 'manual_api' },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'manual_api' },
  { id: 'fal_ai', name: 'Fal AI', category: 'manual_api' },
  { id: 'brightdata', name: 'BrightData', category: 'manual_api' },
  { id: 'x_api', name: 'X (Twitter)', category: 'manual_api' },
  { id: 'hubspot', name: 'HubSpot', category: 'manual_api' },
  { id: 'monday', name: 'Monday.com', category: 'manual_api' },
  { id: 'zapier', name: 'Zapier', category: 'manual_api' },
  { id: 'custom_api', name: 'Custom API', category: 'custom' }
];

export default function IntegrationsAdmin() {
  const [configs, setConfigs] = useState([]);
  const [latestRuns, setLatestRuns] = useState({});
  const [outboxCounts, setOutboxCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrationData();
    const interval = setInterval(fetchIntegrationData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchIntegrationData = async () => {
    try {
      const [configs, runs, outbox] = await Promise.all([
        base44.entities.IntegrationConfig.list('-updated_date', 100),
        base44.entities.ReconcileRun.list('-started_at', 100),
        base44.entities.IntegrationOutbox.list('-created_at', 1000)
      ]);

      setConfigs(configs);

      // Group runs by integration
      const runsMap = {};
      for (const run of runs) {
        if (!runsMap[run.integration_id]) {
          runsMap[run.integration_id] = run;
        }
      }
      setLatestRuns(runsMap);

      // Count outbox items by status and integration
      const countsMap = {};
      for (const item of outbox) {
        if (!countsMap[item.integration_id]) {
          countsMap[item.integration_id] = { queued: 0, sent: 0, failed: 0, dead_letter: 0 };
        }
        countsMap[item.integration_id][item.status] = (countsMap[item.integration_id][item.status] || 0) + 1;
      }
      setOutboxCounts(countsMap);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch integration data:', err);
      setLoading(false);
    }
  };

  const toggleIntegration = async (config) => {
    try {
      await base44.entities.IntegrationConfig.update(config.id, {
        enabled: !config.enabled
      });
      fetchIntegrationData();
    } catch (err) {
      console.error('Failed to toggle integration:', err);
    }
  };

  const runReconciliation = async (integrationId) => {
    try {
      const functionName = `reconcile${integrationId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
      await base44.functions.invoke(functionName, {});
      setTimeout(fetchIntegrationData, 1000);
    } catch (err) {
      console.error('Failed to run reconciliation:', err);
    }
  };

  const ensureConfig = async (integrationId, name, category) => {
    const existing = configs.find(c => c.integration_id === integrationId);
    if (!existing) {
      await base44.entities.IntegrationConfig.create({
        integration_id: integrationId,
        name,
        category,
        enabled: false,
        settings_json: JSON.stringify({
          rate_limit_rps: 1,
          max_retries: 3,
          backoff_base_sec: 2,
          batch_size: 50
        })
      });
      fetchIntegrationData();
    }
  };

  const getStatusIndicator = (config) => {
    if (!config.enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }

    const latestRun = latestRuns[config.integration_id];
    if (!latestRun) {
      return <Badge variant="outline">Never run</Badge>;
    }

    if (latestRun.status === 'success' || latestRun.status === 'partial') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700">Healthy</span>
        </div>
      );
    } else if (latestRun.status === 'failed') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-700">Error</span>
        </div>
      );
    }

    return <Badge variant="outline">{latestRun.status}</Badge>;
  };

  const filteredIntegrations = INTEGRATION_CATALOG.filter(int =>
    int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    int.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-4 text-center">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integrations Admin</h1>
        <p className="text-gray-600">Manage, monitor, and control all integrations</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4">
        {filteredIntegrations.map(integration => {
          const config = configs.find(c => c.integration_id === integration.id);
          const counts = outboxCounts[integration.id] || {};
          const latestRun = latestRuns[integration.id];

          return (
            <Card key={integration.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <p className="text-xs text-gray-600 mt-1">{integration.id}</p>
                </div>
                <div className="text-right">
                  {getStatusIndicator(config || { enabled: false })}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Integration Status</span>
                  {config ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={() => toggleIntegration(config)}
                      />
                      <span className="text-sm">{config.enabled ? 'Active' : 'Inactive'}</span>
                    </label>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => ensureConfig(integration.id, integration.name, integration.category)}
                    >
                      Initialize
                    </Button>
                  )}
                </div>

                {/* Outbox Counts */}
                {config && (
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="font-bold text-blue-700">{counts.queued || 0}</p>
                      <p className="text-xs text-gray-600">Queued</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="font-bold text-green-700">{counts.sent || 0}</p>
                      <p className="text-xs text-gray-600">Sent</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded">
                      <p className="font-bold text-yellow-700">{counts.failed || 0}</p>
                      <p className="text-xs text-gray-600">Failed</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <p className="font-bold text-red-700">{counts.dead_letter || 0}</p>
                      <p className="text-xs text-gray-600">Dead Letter</p>
                    </div>
                  </div>
                )}

                {/* Last Reconciliation */}
                {latestRun && (
                  <div className="p-3 bg-gray-50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Reconciliation</span>
                      <Badge variant={latestRun.status === 'success' ? 'default' : 'destructive'}>
                        {latestRun.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {new Date(latestRun.started_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      Checked: {latestRun.checked} | Fixed: {latestRun.drift_fixed} | Failed: {latestRun.failures || 0}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {config && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runReconciliation(integration.id)}
                      className="flex-1 gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reconcile Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}