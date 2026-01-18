import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Link2, Zap, Cloud, CheckCircle2, XCircle, AlertCircle, 
  Play, RefreshCw, Settings, Bell, Database
} from 'lucide-react';

export default function IntegrationHub() {
  const [configs, setConfigs] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [runs, setRuns] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configList, outboxList, runsList, emails, sms, notifications] = await Promise.all([
        base44.entities.IntegrationConfig.list(),
        base44.entities.IntegrationOutbox.list('-created_date', 100),
        base44.entities.ReconcileRun.list('-started_at', 50),
        base44.entities.EmailLog.list('-created_date', 50),
        base44.entities.SmsLog.list('-created_date', 50),
        base44.entities.NotificationLog.list('-created_date', 50)
      ]);

      setConfigs(configList || []);
      setOutbox(outboxList || []);
      setRuns(runsList || []);
      setEmailLogs(emails || []);
      setSmsLogs(sms || []);
      setNotificationLogs(notifications || []);
    } catch (error) {
      console.error('Failed to fetch integration data:', error);
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
      alert('Dispatch triggered');
      fetchData();
    } catch (error) {
      alert('Dispatch failed: ' + error.message);
    }
  };

  const categoryIcon = (cat) => {
    if (cat === 'oauth_connector') return <Link2 className="w-4 h-4" />;
    if (cat === 'manual_api') return <Zap className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const statusIcon = (status) => {
    if (status === 'authorized' || status === 'sent') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'error' || status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  if (loading) {
    return <div className="p-8 text-white">Loading integration hub...</div>;
  }

  const stats = {
    total_integrations: configs.length,
    enabled: configs.filter(c => c.enabled).length,
    queued_items: outbox.filter(o => o.status === 'queued').length,
    failed_items: outbox.filter(o => o.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Integration Hub</h1>
          <p className="text-gray-400">Centralized integration management and monitoring</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Integrations</p>
                <p className="text-2xl font-bold text-white">{stats.total_integrations}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Enabled</p>
                <p className="text-2xl font-bold text-white">{stats.enabled}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Queued</p>
                <p className="text-2xl font-bold text-white">{stats.queued_items}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-white">{stats.failed_items}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="outbox">Outbox ({outbox.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="runs">Reconcile Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {configs.map(config => (
            <Card key={config.id} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {categoryIcon(config.category)}
                      <h3 className="font-bold text-white">{config.name}</h3>
                      {config.connector_status && (
                        <Badge className={
                          config.connector_status === 'authorized' ? 'bg-green-600' :
                          config.connector_status === 'error' ? 'bg-red-600' : 'bg-gray-600'
                        }>
                          {config.connector_status}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">{config.integration_id}</p>
                    
                    {config.last_reconcile_at && (
                      <p className="text-xs text-gray-500">
                        Last reconcile: {new Date(config.last_reconcile_at).toLocaleString()}
                      </p>
                    )}
                    {config.last_error && (
                      <p className="text-xs text-red-400 mt-1">{config.last_error}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Enabled</span>
                      <Switch 
                        checked={config.enabled} 
                        onCheckedChange={() => toggleIntegration(config)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => runDispatch(config.integration_id)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Dispatch
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedConfig(config)}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="outbox" className="space-y-4">
          {outbox.map(item => (
            <Card key={item.id} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{item.integration_id}</h4>
                      <Badge variant="outline" className="text-xs">{item.operation}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">Resource: {item.stable_resource_id}</p>
                    <p className="text-xs text-gray-500">Attempts: {item.attempt_count}</p>
                    {item.last_error && <p className="text-xs text-red-400 mt-1">{item.last_error}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(item.status)}
                    <Badge className={
                      item.status === 'sent' ? 'bg-green-600' :
                      item.status === 'failed' ? 'bg-red-600' :
                      item.status === 'dead_letter' ? 'bg-gray-600' : 'bg-yellow-600'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="bg-gray-900">
              <TabsTrigger value="email">Emails ({emailLogs.length})</TabsTrigger>
              <TabsTrigger value="sms">SMS ({smsLogs.length})</TabsTrigger>
              <TabsTrigger value="notifications">Notifications ({notificationLogs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-2">
              {emailLogs.map(log => (
                <Card key={log.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">{log.to_email}</p>
                        <p className="text-sm text-gray-400">Template: {log.template_id}</p>
                        <p className="text-xs text-gray-500">{new Date(log.created_date).toLocaleString()}</p>
                      </div>
                      <Badge className={
                        log.status === 'sent' ? 'bg-green-600' :
                        log.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="sms" className="space-y-2">
              {smsLogs.map(log => (
                <Card key={log.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">{log.to_phone}</p>
                        <p className="text-xs text-gray-500">{new Date(log.created_date).toLocaleString()}</p>
                      </div>
                      <Badge className={
                        log.status === 'sent' ? 'bg-green-600' :
                        log.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-2">
              {notificationLogs.map(log => (
                <Card key={log.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">{log.channel_id}</p>
                        <p className="text-sm text-gray-400">Type: {log.message_type}</p>
                        <p className="text-xs text-gray-500">{new Date(log.created_date).toLocaleString()}</p>
                      </div>
                      <Badge className={
                        log.status === 'sent' ? 'bg-green-600' :
                        log.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          {runs.map(run => (
            <Card key={run.id} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">{run.integration_id}</h4>
                    <p className="text-sm text-gray-400">Started: {new Date(run.started_at).toLocaleString()}</p>
                    {run.finished_at && (
                      <p className="text-sm text-gray-400">Finished: {new Date(run.finished_at).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className={
                      run.status === 'success' ? 'bg-green-600' :
                      run.status === 'in_progress' ? 'bg-blue-600' : 'bg-red-600'
                    }>
                      {run.status}
                    </Badge>
                    <div className="text-xs text-gray-400 mt-2">
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