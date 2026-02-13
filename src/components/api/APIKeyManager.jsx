import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function APIKeyManager() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', permissions: {}, rate_limit: 1000 });
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const fetchedKeys = await base44.entities.APIKey.list('-created_date');
      setKeys(fetchedKeys);
    } catch (error) {
      toast.error('Failed to fetch API keys');
    }
    setLoading(false);
  };

  const handleCreateKey = async () => {
    try {
      const { data } = await base44.functions.invoke('generateAPIKey', newKey);
      setGeneratedKey(data.api_key);
      toast.success('API key generated successfully');
      fetchKeys();
    } catch (error) {
      toast.error('Failed to generate API key');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return;
    try {
      await base44.entities.APIKey.delete(keyId);
      toast.success('API key deleted');
      fetchKeys();
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const handleToggleKey = async (key) => {
    try {
      await base44.entities.APIKey.update(key.id, { is_active: !key.is_active });
      toast.success(key.is_active ? 'API key deactivated' : 'API key activated');
      fetchKeys();
    } catch (error) {
      toast.error('Failed to update API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePermissionChange = (category, permission, value) => {
    setNewKey({
      ...newKey,
      permissions: {
        ...newKey.permissions,
        [category]: {
          ...(newKey.permissions[category] || {}),
          [permission]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-gray-400">Manage authentication keys for API access</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            {generatedKey ? (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                  <p className="text-sm text-green-300 mb-2">API Key Generated Successfully!</p>
                  <div className="flex items-center gap-2 bg-gray-900 p-3 rounded font-mono text-sm">
                    <code className="flex-1">{generatedKey}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(generatedKey)}>
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-300 mt-2">⚠️ Save this key securely - it won't be shown again</p>
                </div>
                <Button onClick={() => { setShowCreateDialog(false); setGeneratedKey(null); }} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Key Name</label>
                  <Input
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    placeholder="e.g., Production API Key"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rate Limit (requests/hour)</label>
                  <Input
                    type="number"
                    value={newKey.rate_limit}
                    onChange={(e) => setNewKey({ ...newKey, rate_limit: parseInt(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Permissions</label>
                  <div className="space-y-3">
                    {['deals', 'products', 'content', 'workflows'].map(category => (
                      <Card key={category} className="bg-gray-700 border-gray-600">
                        <CardContent className="p-3">
                          <p className="font-medium mb-2 capitalize">{category}</p>
                          <div className="flex gap-4">
                            {['read', 'write', 'delete'].map(perm => (
                              <label key={perm} className="flex items-center gap-2 text-sm">
                                <Switch
                                  checked={newKey.permissions[category]?.[perm] || false}
                                  onCheckedChange={(checked) => handlePermissionChange(category, perm, checked)}
                                />
                                <span className="capitalize">{perm}</span>
                              </label>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateKey} className="bg-blue-600 hover:bg-blue-700">
                    Generate Key
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {keys.map((key) => (
          <Card key={key.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{key.name}</h3>
                    <Badge variant={key.is_active ? 'default' : 'secondary'}>
                      {key.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Prefix: <code className="bg-gray-700 px-2 py-0.5 rounded">{key.prefix}...</code></p>
                    <p>Rate Limit: {key.rate_limit} req/hour</p>
                    {key.last_used_at && <p>Last Used: {new Date(key.last_used_at).toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleToggleKey(key)}>
                    {key.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteKey(key.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}