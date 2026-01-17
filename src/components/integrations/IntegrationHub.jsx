import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Link as LinkIcon,
  ArrowDownUp,
  Zap,
  BarChart3,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function IntegrationHub() {
  const [connections, setConnections] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [syncing, setSyncing] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
    fetchSyncLogs();
  }, []);

  const fetchConnections = async () => {
    try {
      const data = await base44.entities.PlatformConnection.list('-updated_date', 50);
      setConnections(data);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const data = await base44.entities.SyncLog.list('-created_date', 50);
      setSyncLogs(data);
    } catch (err) {
      console.error('Failed to fetch sync logs:', err);
    }
  };

  const handleSync = async (platform, action) => {
    setSyncing(prev => ({ ...prev, [platform]: true }));
    try {
      const response = await base44.functions.invoke('bidirectionalSync', {
        platform,
        action
      });
      if (response.success) {
        fetchConnections();
        fetchSyncLogs();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleAIGeneration = async (platform, generationType) => {
    setSyncing(prev => ({ ...prev, [platform]: true }));
    try {
      const products = await base44.entities.EcommerceProduct.filter(
        { platforms: { $in: [platform] } },
        null,
        10
      );

      const productIds = products.map(p => p.id);

      await base44.functions.invoke('triggerAIGeneration', {
        productIds,
        generationType,
        platform
      });

      fetchSyncLogs();
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setSyncing(prev => ({ ...prev, [platform]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integration Hub</h1>
        <p className="text-gray-600">
          Connect and manage your e-commerce platforms with bidirectional sync and AI-powered content generation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4" />
            Sync Status
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Generation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map(conn => (
              <Card key={conn.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{conn.platform}</CardTitle>
                    <Badge className={getStatusColor(conn.status)}>
                      {conn.status}
                    </Badge>
                  </div>
                  {conn.store_url && (
                    <p className="text-sm text-gray-600 truncate">{conn.store_url}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {conn.last_sync && (
                    <div className="text-xs text-gray-600">
                      Last synced: {new Date(conn.last_sync).toLocaleString()}
                    </div>
                  )}
                  {conn.error_message && (
                    <div className="flex gap-2 items-start text-xs text-red-600 bg-red-50 p-2 rounded">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {conn.error_message}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(conn.platform, 'pull')}
                      disabled={syncing[conn.platform]}
                      className="flex-1"
                    >
                      {syncing[conn.platform] ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Pulling...
                        </>
                      ) : (
                        'Pull Data'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(conn.platform, 'push')}
                      disabled={syncing[conn.platform]}
                      className="flex-1"
                    >
                      {syncing[conn.platform] ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Pushing...
                        </>
                      ) : (
                        'Push Updates'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <div className="space-y-3">
            {syncLogs.slice(0, 20).map(log => (
              <Card key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : log.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                      <span className="font-medium">{log.platform}</span>
                      <Badge variant="outline">{log.sync_type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{log.product_title}</p>
                    {log.duration_ms && (
                      <p className="text-xs text-gray-500">
                        Duration: {log.duration_ms}ms
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.created_date).toLocaleString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {connections
              .filter(c => c.status === 'connected')
              .map(conn => (
                <Card key={conn.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{conn.platform}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Generate AI content for products on this platform
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAIGeneration(conn.platform, 'description')}
                        disabled={syncing[conn.platform]}
                        className="flex-1"
                      >
                        {syncing[conn.platform] ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Descriptions'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAIGeneration(conn.platform, 'image')}
                        disabled={syncing[conn.platform]}
                        className="flex-1"
                      >
                        {syncing[conn.platform] ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Images'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {connections.map(conn => {
              const connSyncLogs = syncLogs.filter(
                log => log.platform === conn.platform && log.status === 'success'
              );
              return (
                <Card key={conn.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{conn.platform}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold">{connSyncLogs.length}</p>
                      <p className="text-xs text-gray-600">Successful syncs</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {conn.auto_sync_enabled ? 'Auto-sync' : 'Manual sync'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}