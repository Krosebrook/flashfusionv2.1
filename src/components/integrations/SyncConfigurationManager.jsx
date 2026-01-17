import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Webhook, Settings } from 'lucide-react';

export default function SyncConfigurationManager() {
  const [configs, setConfigs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
    fetchConnections();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SyncConfiguration.list('-updated_date', 50);
      setConfigs(data);
    } catch (err) {
      console.error('Failed to fetch sync configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const data = await base44.entities.PlatformConnection.list('-updated_date', 50);
      setConnections(data);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  const updateConfig = async (configId, updates) => {
    try {
      await base44.entities.SyncConfiguration.update(configId, updates);
      fetchConfigs();
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  const handleDataTypeChange = async (configId, dataType, checked) => {
    const config = configs.find(c => c.id === configId);
    const dataTypes = checked
      ? [...(config.data_types || []), dataType]
      : (config.data_types || []).filter(dt => dt !== dataType);

    await updateConfig(configId, { data_types: dataTypes });
  };

  if (loading) {
    return <div className="p-4 text-center">Loading configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sync Configuration</h1>
        <p className="text-gray-600">Manage bidirectional sync settings with conflict resolution and webhooks</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {connections.map(conn => {
          const config = configs.find(c => c.platform === conn.platform);

          return (
            <Card key={conn.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{conn.platform}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{conn.store_url}</p>
                  </div>
                  <Badge variant={config ? 'default' : 'secondary'}>
                    {config ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {config ? (
                  <>
                    {/* Data Types Selection */}
                    <div>
                      <h4 className="font-medium mb-3">Data Types to Sync</h4>
                      <div className="space-y-2">
                        {[
                          { id: 'descriptions', label: 'Product Descriptions' },
                          { id: 'inventory', label: 'Inventory Levels' },
                          { id: 'pricing', label: 'Pricing' },
                          { id: 'images', label: 'Product Images' },
                          { id: 'categories', label: 'Categories' },
                          { id: 'tags', label: 'Tags' },
                          { id: 'reviews', label: 'Customer Reviews' }
                        ].map(dataType => (
                          <label key={dataType.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={(config.data_types || []).includes(dataType.id)}
                              onCheckedChange={checked =>
                                handleDataTypeChange(config.id, dataType.id, checked)
                              }
                            />
                            <span className="text-sm">{dataType.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sync Direction */}
                    <div>
                      <h4 className="font-medium mb-2">Sync Direction</h4>
                      <Select
                        value={config.sync_direction}
                        onValueChange={value => updateConfig(config.id, { sync_direction: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pull">Pull Only (from platform)</SelectItem>
                          <SelectItem value="push">Push Only (to platform)</SelectItem>
                          <SelectItem value="bidirectional">Bidirectional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Conflict Resolution */}
                    <div>
                      <h4 className="font-medium mb-2">Conflict Resolution</h4>
                      <Select
                        value={config.conflict_resolution}
                        onValueChange={value => updateConfig(config.id, { conflict_resolution: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="platform_wins">Platform Wins</SelectItem>
                          <SelectItem value="local_wins">Local Wins</SelectItem>
                          <SelectItem value="manual">Manual Review</SelectItem>
                          <SelectItem value="merge">Merge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sync Frequency */}
                    <div>
                      <h4 className="font-medium mb-2">Sync Frequency</h4>
                      <Select
                        value={config.sync_frequency}
                        onValueChange={value => updateConfig(config.id, { sync_frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time (Webhook)</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Webhook Configuration */}
                    <div className="border-t pt-4">
                      <label className="flex items-center gap-2 mb-3 cursor-pointer">
                        <Checkbox
                          checked={config.webhook_enabled || false}
                          onCheckedChange={checked =>
                            updateConfig(config.id, { webhook_enabled: checked })
                          }
                        />
                        <span className="font-medium flex items-center gap-2">
                          <Webhook className="w-4 h-4" />
                          Enable Real-time Webhooks
                        </span>
                      </label>

                      {config.webhook_enabled && (
                        <div className="space-y-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <Input
                            placeholder="Webhook URL"
                            value={config.webhook_url || ''}
                            onChange={e => updateConfig(config.id, { webhook_url: e.target.value })}
                            className="text-sm"
                          />
                          <div className="text-xs text-gray-600 p-2 bg-white rounded">
                            <p className="font-medium">Webhook Secret (for verification)</p>
                            <code className="block mt-1 break-all">{config.webhook_secret || 'Generate'}</code>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Last Conflict */}
                    {config.last_conflict && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <div className="flex gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium">Last Conflict Detected</span>
                        </div>
                        <p className="text-xs text-gray-700">
                          Product {config.last_conflict.product_id} - {config.last_conflict.field}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(config.last_conflict.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-3">Create sync configuration for this platform</p>
                    <Button
                      onClick={() => {
                        base44.entities.SyncConfiguration.create({
                          platform: conn.platform,
                          data_types: ['descriptions', 'inventory', 'pricing'],
                          sync_direction: 'bidirectional',
                          conflict_resolution: 'manual',
                          sync_frequency: 'daily',
                          is_active: true
                        });
                        fetchConfigs();
                      }}
                    >
                      Create Configuration
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