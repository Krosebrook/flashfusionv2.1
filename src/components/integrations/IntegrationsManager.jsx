import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, RefreshCw, Zap } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'ai_research', label: 'AI & Research' },
  { value: 'financial_data', label: 'Financial Data' },
  { value: 'communication', label: 'Communication' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'deal_sourcing', label: 'Deal Sourcing' },
  { value: 'portfolio_mgmt', label: 'Portfolio' },
  { value: 'automation', label: 'Automation' }
];

export default function IntegrationsManager() {
  const [integrations, setIntegrations] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const data = await base44.entities.IntegrationRegistry.list('-updated_date', 100);
      setIntegrations(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
      setLoading(false);
    }
  };

  const toggleIntegration = async (integ) => {
    try {
      await base44.entities.IntegrationRegistry.update(integ.id, {
        enabled: !integ.enabled
      });
      fetchIntegrations();
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const syncIntegration = async (integ) => {
    try {
      await base44.functions.invoke('syncDealData', {
        integration_id: integ.integration_id,
        query: ''
      });
      fetchIntegrations();
    } catch (err) {
      console.error('Failed to sync:', err);
    }
  };

  const filtered = integrations.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || i.category === category;
    return matchSearch && matchCategory;
  });

  if (loading) return <div className="p-4">Loading integrations...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integration Hub</h2>
        <p className="text-gray-600 mt-1">Connect with 25+ platforms for deal sourcing & portfolio management</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(integ => (
          <Card key={integ.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{integ.name}</CardTitle>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {CATEGORIES.find(c => c.value === integ.category)?.label}
                  </Badge>
                </div>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={integ.enabled}
                    onCheckedChange={() => toggleIntegration(integ)}
                  />
                </label>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Use Cases */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Use Cases</p>
                <div className="flex flex-wrap gap-1">
                  {integ.use_cases?.slice(0, 2).map(uc => (
                    <Badge key={uc} variant="secondary" className="text-xs">
                      {uc.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    integ.status === 'healthy' ? 'bg-green-500' : 
                    integ.status === 'error' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-700 capitalize">
                    {integ.status}
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              {integ.last_sync && (
                <p className="text-xs text-gray-500">
                  Last sync: {new Date(integ.last_sync).toLocaleString()}
                </p>
              )}

              {/* Actions */}
              {integ.enabled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => syncIntegration(integ)}
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync Now
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No integrations found</p>
        </div>
      )}
    </div>
  );
}