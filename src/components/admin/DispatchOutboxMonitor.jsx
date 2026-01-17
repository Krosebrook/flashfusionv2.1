import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RefreshCw, Zap, BarChart3 } from 'lucide-react';

export default function DispatchOutboxMonitor() {
  const [outboxItems, setOutboxItems] = useState([]);
  const [stats, setStats] = useState({
    queued: 0,
    sent: 0,
    failed: 0,
    dead_letter: 0
  });
  const [loading, setLoading] = useState(true);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [batchSize, setBatchSize] = useState(50);
  const [recentDispatches, setRecentDispatches] = useState([]);

  useEffect(() => {
    fetchOutboxData();
    const interval = setInterval(fetchOutboxData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchOutboxData = async () => {
    try {
      const items = await base44.entities.IntegrationOutbox.list('-updated_at', 500);
      setOutboxItems(items.slice(0, 100)); // Show last 100

      // Calculate stats
      const newStats = { queued: 0, sent: 0, failed: 0, dead_letter: 0 };
      for (const item of items) {
        newStats[item.status] = (newStats[item.status] || 0) + 1;
      }
      setStats(newStats);

      // Recent dispatches (last 24h, sent or failed)
      const now = Date.now();
      const last24h = now - 24 * 60 * 60 * 1000;
      const recentItems = items.filter(item => {
        const itemTime = new Date(item.updated_at).getTime();
        return itemTime > last24h && (item.status === 'sent' || item.status === 'failed');
      });
      setRecentDispatches(recentItems.slice(0, 50));

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch outbox data:', err);
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    setDispatchLoading(true);
    try {
      await base44.functions.invoke('dispatchOutbox', {
        batch_size: parseInt(batchSize),
        integration_id_filter: null
      });
      setTimeout(fetchOutboxData, 1000);
    } catch (err) {
      console.error('Failed to dispatch:', err);
    } finally {
      setDispatchLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-yellow-100 text-yellow-800';
      case 'dead_letter':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading outbox...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8" />
          Outbox Dispatcher Monitor
        </h1>
        <p className="text-gray-600">Monitor and control integration outbox dispatching</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.queued}</div>
            <p className="text-sm text-gray-600 mt-1">Queued</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <p className="text-sm text-gray-600 mt-1">Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.failed}</div>
            <p className="text-sm text-gray-600 mt-1">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.dead_letter}</div>
            <p className="text-sm text-gray-600 mt-1">Dead Letter</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Dispatch */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Dispatch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="500"
              value={batchSize}
              onChange={e => setBatchSize(e.target.value)}
              placeholder="Batch size"
              className="max-w-xs"
            />
            <Button
              onClick={handleDispatch}
              disabled={dispatchLoading}
              className="gap-2"
            >
              {dispatchLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Dispatch {batchSize} Items
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-600">
            Dispatches queued outbox items to their respective integrations with rate limiting and retries.
          </p>
        </CardContent>
      </Card>

      {/* Recent Dispatches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Dispatches (Last 24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentDispatches.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">No recent dispatches</p>
            ) : (
              recentDispatches.map(item => (
                <div
                  key={item.id}
                  className="p-3 border rounded flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </Badge>
                      <span className="text-sm font-medium">{item.integration_id}</span>
                      <span className="text-xs text-gray-600">{item.operation}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.stable_resource_id}
                    </p>
                    {item.last_error && (
                      <p className="text-xs text-red-600 mt-1">Error: {item.last_error}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    Attempt {item.attempt_count}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Queued Items */}
      <Card>
        <CardHeader>
          <CardTitle>All Outbox Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {outboxItems.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">No outbox items</p>
            ) : (
              outboxItems.map(item => (
                <div
                  key={item.id}
                  className="p-2 border rounded text-sm flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </Badge>
                    <span className="ml-2 text-xs text-gray-600">
                      {item.integration_id} • {item.operation}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}