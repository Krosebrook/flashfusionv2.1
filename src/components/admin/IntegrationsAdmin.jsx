import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, XCircle, AlertCircle, Play, RefreshCw, 
  Zap, Cloud, Link2, Settings 
} from 'lucide-react';

export default function IntegrationsAdmin() {
  const [configs, setConfigs] = useState([]);
  const [outboxStats, setOutboxStats] = useState({});
  const [reconcileRuns, setReconcileRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configList, outbox, runs] = await Promise.all([
        base44.entities.IntegrationConfig.list(),
        base44.entities.IntegrationOutbox.list('-created_date', 1000),
        base44.entities.ReconcileRun.list('-started_at', 50)
      ]);

      setConfigs(configList || []);
      setReconcileRuns(runs || []);

      // Calculate stats per integration
      const stats = {};
      (outbox || []).forEach(item => {
        if (!stats[item.integration_id]) {
          stats[item.integration_id] = { queued: 0, sent: 0, failed: 0, dead_letter: 0 };
        }
        stats[item.integration_id][item.status]++;
      });
      setOutboxStats(stats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const toggleIntegration = async (config) => {
    await base44.entities.IntegrationConfig.update(config.id, {
      enabled: !config.enabled
    });
    fetchData();
  };

  const runDispatch = async (integration_id = null) => {
    try {
      await base44.functions.invoke('dispatchOutbox', {
        batch_size: 50,
        integration_filter: integration_id
      });
      alert('Dispatch complete');
      fetchData();
    } catch (error) {
      alert('Dispatch failed: ' + error.message);
    }
  };

  const runReconcile = async (integration_id) => {
    try {
      await base44.functions.invoke('reconcileIntegration', { integration_id });
      alert('Reconcile complete');
      fetchData();
    } catch (error) {
      alert('Reconcile failed: ' + error.message);
    }
  };

  const categoryIcon = (cat) => {
    if (cat === 'oauth_connector') return <Link2 className="w-4 h-4" />;
    if (cat === 'manual_api') return <Zap className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const statusBadge = (status) => {
    if (status === 'authorized') return <Badge className="bg-green-600">Connected</Badge>;
    if (status === 'error') return <Badge className="bg-red-600">Error</Badge>;
    return <Badge variant="outline">Not Connected</Badge>;
  };

  if (loading) {
    return <div className="p-8">Loading integrations...</div>;
  }

  const oauthConnectors = configs.filter(c => c.category === 'oauth_connector');
  const manualApis = configs.filter(c => c.category === 'manual_api');
  const custom = configs.filter(c => c.category === 'custom');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Integration Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={() => runDispatch()} variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Dispatch All Queued
            </Button>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="connectors">
        <TabsList>
          <TabsTrigger value="connectors">OAuth Connectors</TabsTrigger>
          <TabsTrigger value="manual">Manual APIs</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="runs">Reconcile Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="connectors" className="space-y-4">
          {oauthConnectors.map(config => (
            <IntegrationCard 
              key={config.id}
              config={config}
              stats={outboxStats[config.integration_id]}
              onToggle={toggleIntegration}
              onDispatch={runDispatch}
              onReconcile={runReconcile}
              categoryIcon={categoryIcon}
              statusBadge={statusBadge}
            />
          ))}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          {manualApis.map(config => (
            <IntegrationCard 
              key={config.id}
              config={config}
              stats={outboxStats[config.integration_id]}
              onToggle={toggleIntegration}
              onDispatch={runDispatch}
              onReconcile={runReconcile}
              categoryIcon={categoryIcon}
              statusBadge={statusBadge}
            />
          ))}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {custom.map(config => (
            <IntegrationCard 
              key={config.id}
              config={config}
              stats={outboxStats[config.integration_id]}
              onToggle={toggleIntegration}
              onDispatch={runDispatch}
              onReconcile={runReconcile}
              categoryIcon={categoryIcon}
              statusBadge={statusBadge}
            />
          ))}
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          {reconcileRuns.map(run => (
            <Card key={run.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{run.integration_id}</div>
                    <div className="text-sm text-gray-600">
                      Started: {new Date(run.started_at).toLocaleString()}
                    </div>
                    {run.finished_at && (
                      <div className="text-sm text-gray-600">
                        Finished: {new Date(run.finished_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={
                      run.status === 'success' ? 'bg-green-600' :
                      run.status === 'in_progress' ? 'bg-blue-600' :
                      'bg-red-600'
                    }>
                      {run.status}
                    </Badge>
                    <div className="text-xs text-gray-600">
                      Checked: {run.checked || 0} | Fixed: {run.drift_fixed || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntegrationCard({ config, stats, onToggle, onDispatch, onReconcile, categoryIcon, statusBadge }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {categoryIcon(config.category)}
              <h3 className="font-bold">{config.name}</h3>
              {config.connector_status && statusBadge(config.connector_status)}
            </div>
            
            <div className="flex gap-4 text-sm mb-3">
              <span>Queued: <strong>{stats?.queued || 0}</strong></span>
              <span>Sent: <strong>{stats?.sent || 0}</strong></span>
              <span>Failed: <strong>{stats?.failed || 0}</strong></span>
              <span>Dead: <strong>{stats?.dead_letter || 0}</strong></span>
            </div>

            {config.last_reconcile_at && (
              <div className="text-xs text-gray-600">
                Last reconcile: {new Date(config.last_reconcile_at).toLocaleString()}
              </div>
            )}
            {config.last_error && (
              <div className="text-xs text-red-600 mt-1">{config.last_error}</div>
            )}
          </div>

          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm">Enabled</span>
              <Switch 
                checked={config.enabled} 
                onCheckedChange={() => onToggle(config)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDispatch(config.integration_id)}
              >
                <Play className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onReconcile(config.integration_id)}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}