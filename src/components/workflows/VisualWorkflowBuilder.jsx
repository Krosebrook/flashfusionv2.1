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
import { Plus, Trash2, Play, Pause, ChevronRight, Settings } from 'lucide-react';

export default function VisualWorkflowBuilder() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchWorkflows();
    fetchAgents();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AdvancedWorkflow.list('-updated_date', 50);
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await base44.entities.Workflow.filter(
        { is_template: false },
        '-updated_date',
        50
      );
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  const createWorkflow = async () => {
    if (!newWorkflowName.trim()) return;

    try {
      const workflow = await base44.entities.AdvancedWorkflow.create({
        name: newWorkflowName,
        description: '',
        steps: [],
        triggers: [],
        integrations: [],
        status: 'draft',
        execution_history: []
      });

      setWorkflows([...workflows, workflow]);
      setSelectedWorkflow(workflow);
      setSteps([]);
      setNewWorkflowName('');
    } catch (err) {
      console.error('Failed to create workflow:', err);
    }
  };

  const addStep = async () => {
    if (!selectedWorkflow) return;

    const newStep = {
      id: `step_${Date.now()}`,
      agent_id: '',
      agent_name: '',
      order: steps.length,
      config: {},
      condition: { type: 'none' }
    };

    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);

    await base44.entities.AdvancedWorkflow.update(selectedWorkflow.id, {
      steps: updatedSteps
    });
  };

  const updateStep = async (stepId, updates) => {
    const updatedSteps = steps.map(s => s.id === stepId ? { ...s, ...updates } : s);
    setSteps(updatedSteps);

    if (selectedWorkflow) {
      await base44.entities.AdvancedWorkflow.update(selectedWorkflow.id, {
        steps: updatedSteps
      });
    }
  };

  const removeStep = async (stepId) => {
    const updatedSteps = steps.filter(s => s.id !== stepId);
    setSteps(updatedSteps);

    if (selectedWorkflow) {
      await base44.entities.AdvancedWorkflow.update(selectedWorkflow.id, {
        steps: updatedSteps
      });
    }
  };

  const toggleWorkflowStatus = async (workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    try {
      await base44.entities.AdvancedWorkflow.update(workflow.id, { status: newStatus });
      fetchWorkflows();
    } catch (err) {
      console.error('Failed to update workflow:', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Visual Workflow Builder</h1>
        <p className="text-gray-600">Create multi-step agent workflows with conditional logic</p>
      </div>

      {/* Workflow Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {workflows.map(workflow => (
          <Button
            key={workflow.id}
            variant={selectedWorkflow?.id === workflow.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedWorkflow(workflow);
              setSteps(workflow.steps || []);
            }}
            className="flex items-center gap-2"
          >
            <span>{workflow.name}</span>
            <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
              {workflow.status}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Create New Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Workflow</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Workflow name"
            value={newWorkflowName}
            onChange={e => setNewWorkflowName(e.target.value)}
          />
          <Button onClick={createWorkflow} className="gap-2">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </CardContent>
      </Card>

      {selectedWorkflow && (
        <div className="space-y-4">
          {/* Workflow Controls */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>{selectedWorkflow.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{selectedWorkflow.description}</p>
              </div>
              <Button
                onClick={() => toggleWorkflowStatus(selectedWorkflow)}
                variant={selectedWorkflow.status === 'active' ? 'default' : 'outline'}
                className="gap-2"
              >
                {selectedWorkflow.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Activate
                  </>
                )}
              </Button>
            </CardHeader>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Workflow Steps</CardTitle>
              <Button size="sm" onClick={addStep} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No steps added yet. Click "Add Step" to get started.</p>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {step.order + 1}</Badge>
                          {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeStep(step.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Select Agent</label>
                          <Select
                            value={step.agent_id}
                            onValueChange={agentId => {
                              const agent = agents.find(a => a.id === agentId);
                              updateStep(step.id, {
                                agent_id: agentId,
                                agent_name: agent?.name || ''
                              });
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.map(agent => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Condition Type</label>
                          <Select
                            value={step.condition?.type || 'none'}
                            onValueChange={type => {
                              updateStep(step.id, {
                                condition: { ...step.condition, type }
                              });
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Condition</SelectItem>
                              <SelectItem value="if">If/Else</SelectItem>
                              <SelectItem value="switch">Switch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {step.condition?.type !== 'none' && (
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <Input
                            placeholder="Enter condition (e.g., status === 'success')"
                            value={step.condition?.condition || ''}
                            onChange={e => {
                              updateStep(step.id, {
                                condition: { ...step.condition, condition: e.target.value }
                              });
                            }}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution History */}
          {selectedWorkflow.execution_history && selectedWorkflow.execution_history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedWorkflow.execution_history.slice(-5).map((execution, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{new Date(execution.executed_at).toLocaleString()}</p>
                        <p className="text-xs text-gray-600">{execution.duration_ms}ms</p>
                      </div>
                      <Badge variant={execution.status === 'success' ? 'default' : 'destructive'}>
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}