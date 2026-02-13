import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_EVENTS = [
  { value: 'deal.created', label: 'Deal Created' },
  { value: 'deal.updated', label: 'Deal Updated' },
  { value: 'deal.deleted', label: 'Deal Deleted' },
  { value: 'product.created', label: 'Product Created' },
  { value: 'product.updated', label: 'Product Updated' },
  { value: 'product.deleted', label: 'Product Deleted' },
  { value: 'content.created', label: 'Content Created' },
  { value: 'content.updated', label: 'Content Updated' },
  { value: 'content.published', label: 'Content Published' },
  { value: 'workflow.started', label: 'Workflow Started' },
  { value: 'workflow.completed', label: 'Workflow Completed' },
  { value: 'workflow.failed', label: 'Workflow Failed' }
];

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedWebhooks, fetchedLogs] = await Promise.all([
        base44.entities.WebhookSubscription.list('-created_date'),
        base44.entities.WebhookLog.list('-created_date', 50)
      ]);
      setWebhooks(fetchedWebhooks);
      setLogs(fetchedLogs);
    } catch (error) {
      toast.error('Failed to fetch webhooks');
    }
    setLoading(false);
  };

  const handleCreateWebhook = async () => {
    try {
      // Generate a random secret
      const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      await base44.entities.WebhookSubscription.create({
        ...newWebhook,
        secret,
        is_active: true,
        retry_config: { max_retries: 3, retry_delay_seconds: 60 },
        total_deliveries: 0,
        failed_deliveries: 0
      });

      toast.success('Webhook created successfully');
      setShowCreateDialog(false);
      setNewWebhook({ name: '', url: '', events: [] });
      fetchData();
    } catch (error) {
      toast.error('Failed to create webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await base44.entities.WebhookSubscription.delete(webhookId);
      toast.success('Webhook deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  const handleToggleWebhook = async (webhook) => {
    try {
      await base44.entities.WebhookSubscription.update(webhook.id, {
        is_active: !webhook.is_active
      });
      toast.success(webhook.is_active ? 'Webhook deactivated' : 'Webhook activated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update webhook');
    }
  };

  const handleEventToggle = (event) => {
    const events = newWebhook.events.includes(event)
      ? newWebhook.events.filter(e => e !== event)
      : [...newWebhook.events, event];
    setNewWebhook({ ...newWebhook, events });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Webhook Subscriptions</h2>
          <p className="text-gray-400">Receive real-time notifications for events</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Create Webhook Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Webhook Name</label>
                <Input
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="e.g., Production Webhook"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                <Input
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://your-app.com/webhooks"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Subscribe to Events</label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_EVENTS.map(event => (
                    <label key={event.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={newWebhook.events.includes(event.value)}
                        onCheckedChange={() => handleEventToggle(event.value)}
                      />
                      <span className="text-sm">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateWebhook} className="bg-blue-600 hover:bg-blue-700">
                  Create Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{webhook.name}</h3>
                    <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                      {webhook.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 break-all">{webhook.url}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleToggleWebhook(webhook)}>
                    {webhook.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteWebhook(webhook.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {webhook.events?.map(event => (
                  <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Deliveries</p>
                  <p className="font-semibold">{webhook.total_deliveries || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Failed</p>
                  <p className="font-semibold text-red-400">{webhook.failed_deliveries || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Success Rate</p>
                  <p className="font-semibold text-green-400">
                    {webhook.total_deliveries > 0
                      ? Math.round(((webhook.total_deliveries - (webhook.failed_deliveries || 0)) / webhook.total_deliveries) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Webhook Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => {
              const webhook = webhooks.find(w => w.id === log.webhook_id);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{log.event_type}</p>
                      <p className="text-xs text-gray-400">{webhook?.name || 'Unknown webhook'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.response_code || 'Failed'}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}