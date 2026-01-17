import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Share2,
  Lock,
  User,
  MessageSquare,
  Workflow,
  Plus,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AgentCollaborationHub() {
  const [agents, setAgents] = useState([]);
  const [sharedAgents, setSharedAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Workflow.filter(
        { is_template: false },
        '-updated_date',
        50
      );
      setAgents(data);

      // In production, fetch actual shared agents
      const shared = data.filter(a => a.collaborators && a.collaborators.length > 0);
      setSharedAgents(shared);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareAgent = async () => {
    if (!selectedAgent || !shareEmail) return;

    try {
      // Create collaboration record
      await base44.entities.Collaboration.create({
        resource_type: 'workflow',
        resource_id: selectedAgent.id,
        resource_title: selectedAgent.name,
        collaborators: [
          {
            email: shareEmail,
            role: sharePermission === 'edit' ? 'editor' : 'viewer',
            added_date: new Date().toISOString()
          }
        ]
      });

      fetchAgents();
      setShareDialogOpen(false);
      setShareEmail('');
      setSharePermission('view');
    } catch (err) {
      console.error('Failed to share agent:', err);
    }
  };

  const handleAddComment = async (agentId) => {
    const comment = comments[agentId];
    if (!comment || !comment.trim()) return;

    try {
      // In production, add comment to collaboration record
      const collaboration = await base44.entities.Collaboration.filter(
        { resource_id: agentId },
        null,
        1
      );

      if (collaboration && collaboration.length > 0) {
        const updated = collaboration[0];
        if (!updated.activity_log) updated.activity_log = [];
        updated.activity_log.push({
          user_email: (await base44.auth.me()).email,
          action: 'comment',
          timestamp: new Date().toISOString(),
          details: comment
        });

        await base44.entities.Collaboration.update(updated.id, {
          activity_log: updated.activity_log
        });

        setComments(prev => ({ ...prev, [agentId]: '' }));
        fetchAgents();
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Agent Collaboration Hub</h1>
        <p className="text-gray-600">
          Share agents with teammates, set permissions, and collaborate with feedback
        </p>
      </div>

      <Tabs defaultValue="myagents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="myagents">My Agents</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="myagents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => (
              <Card key={agent.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <Dialog open={shareDialogOpen && selectedAgent?.id === agent.id}>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShareDialogOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Agent: {agent.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                              placeholder="teammate@example.com"
                              value={shareEmail}
                              onChange={e => setShareEmail(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Permission</label>
                            <Select value={sharePermission} onValueChange={setSharePermission}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="view">View Only</SelectItem>
                                <SelectItem value="edit">Can Edit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleShareAgent} className="w-full">
                            Share Agent
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-2">Execution Stats</p>
                    <div className="flex gap-2 text-sm">
                      <span>{agent.execution_count || 0} executions</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="space-y-2 max-h-24 overflow-y-auto text-sm">
                      {/* Comments would go here */}
                      <p className="text-gray-600 text-xs">No comments yet</p>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Input
                        placeholder="Add comment..."
                        size="sm"
                        value={comments[agent.id] || ''}
                        onChange={e =>
                          setComments(prev => ({ ...prev, [agent.id]: e.target.value }))
                        }
                        className="text-xs h-7"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(agent.id)}
                        className="h-7 px-2"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sharedAgents.map(agent => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Shared
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{agent.description}</p>
                  <div className="text-xs text-gray-600">
                    Shared by: {agent.created_by}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Use Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {sharedAgents.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No agents shared with you yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {agents.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-gray-600">Owned by you</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </Badge>
                      <Button size="sm" variant="ghost">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Agent Dependencies & Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map(agent => (
                  <div key={agent.id} className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">{agent.name}</div>
                    <div className="text-sm text-gray-600">
                      {agent.nodes && agent.nodes.length > 0
                        ? `${agent.nodes.length} workflow nodes`
                        : 'No workflow nodes'}
                    </div>
                    {agent.connections && agent.connections.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        Connected to: {agent.connections.length} agent(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}