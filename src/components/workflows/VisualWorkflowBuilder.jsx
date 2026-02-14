import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus, Trash2, Play, Pause, ChevronRight, Settings, Sparkles, Activity } from 'lucide-react';
import AIWorkflowAssistant from './AIWorkflowAssistant';
import WorkflowPerformanceInsights from './WorkflowPerformanceInsights';
import OptimizationBadge from './OptimizationBadge';
import { toast } from 'sonner';

export default function VisualWorkflowBuilder() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState('builder');
  const [showOptimizations, setShowOptimizations] = useState(false);

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

  const addStep = async (isParallel = false) => {
    if (!selectedWorkflow) return;

    const newStep = {
      id: `step_${Date.now()}`,
      agent_id: '',
      agent_name: '',
      order: steps.length,
      config: {},
      condition: { type: 'none' },
      parallel_group: isParallel ? `group_${Date.now()}` : null,
      execution_mode: isParallel ? 'parallel' : 'sequential'
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

  const handleWorkflowGenerated = async (generatedWorkflow) => {
    try {
      const workflow = await base44.entities.AdvancedWorkflow.create({
        name: generatedWorkflow.name,
        description: generatedWorkflow.description,
        steps: generatedWorkflow.steps || [],
        triggers: [generatedWorkflow.trigger],
        integrations: [],
        status: 'draft',
        config: generatedWorkflow,
        execution_history: [],
        optimization_suggestions: []
      });

      setWorkflows([...workflows, workflow]);
      setSelectedWorkflow(workflow);
      setSteps(workflow.steps || []);
      setActiveTab('builder');
      toast.success('Workflow generated successfully!');
    } catch (err) {
      console.error('Failed to create generated workflow:', err);
      toast.error('Failed to create workflow');
    }
  };

  const handleViewOptimizations = () => {
    setActiveTab('ai-assistant');
    setShowOptimizations(true);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          Visual Workflow Builder
          <Sparkles className="w-6 h-6 text-purple-400" />
        </h1>
        <p className="text-gray-400">Create and optimize workflows with AI-powered assistance</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="builder">
            <Settings className="w-4 h-4 mr-2" />
            Workflow Builder
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="w-4 h-4 mr-2" />
            Performance Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6 mt-6">
          {/* Create New Workflow */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Create New Workflow</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Workflow name"
                value={newWorkflowName}
                onChange={e => setNewWorkflowName(e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
              <Button onClick={createWorkflow} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </CardContent>
          </Card>

          {selectedWorkflow && (
            <div className="space-y-4">
              {/* Workflow Controls */}
              <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle>{selectedWorkflow.name}</CardTitle>
                  <OptimizationBadge 
                    suggestions={selectedWorkflow.optimization_suggestions}
                    onClick={handleViewOptimizations}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">{selectedWorkflow.description}</p>
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
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Workflow Steps</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => addStep(false)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Add Step
                </Button>
                <Button size="sm" onClick={() => addStep(true)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Parallel Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No steps added yet. Click "Add Step" to get started.</p>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div key={step.id} className={`border rounded-lg p-4 space-y-3 ${
                      step.execution_mode === 'parallel' 
                        ? 'border-purple-500 bg-purple-900/20' 
                        : 'border-gray-600 bg-gray-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {step.order + 1}</Badge>
                          {step.execution_mode === 'parallel' && (
                            <Badge className="bg-purple-600">Parallel</Badge>
                          )}
                          {idx < steps.length - 1 && step.execution_mode !== 'parallel' && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
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

                      <div className="grid gap-3 md:grid-cols-3">
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
                           <SelectTrigger className="mt-1 bg-gray-600 border-gray-500">
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
                          <label className="text-sm font-medium">Execution Mode</label>
                          <Select
                           value={step.execution_mode || 'sequential'}
                           onValueChange={mode => {
                             updateStep(step.id, {
                               execution_mode: mode,
                               parallel_group: mode === 'parallel' ? step.parallel_group || `group_${Date.now()}` : null
                             });
                           }}
                          >
                           <SelectTrigger className="mt-1 bg-gray-600 border-gray-500">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="sequential">Sequential</SelectItem>
                             <SelectItem value="parallel">Parallel</SelectItem>
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
                           <SelectTrigger className="mt-1 bg-gray-600 border-gray-500">
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

                      {step.condition?.type === 'if' && (
                        <div className="p-3 bg-blue-900/30 rounded border border-blue-700 space-y-2">
                          <label className="text-xs font-medium text-blue-300">If Condition</label>
                          <Input
                            placeholder="e.g., response.status === 'success'"
                            value={step.condition?.condition || ''}
                            onChange={e => {
                              updateStep(step.id, {
                                condition: { ...step.condition, condition: e.target.value }
                              });
                            }}
                            className="text-sm bg-gray-600 border-gray-500"
                          />
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="text-xs font-medium text-green-300">Then: Next Step</label>
                              <Input
                                placeholder="Step ID"
                                value={step.condition?.then_step || ''}
                                onChange={e => {
                                  updateStep(step.id, {
                                    condition: { ...step.condition, then_step: e.target.value }
                                  });
                                }}
                                className="text-sm bg-gray-600 border-gray-500 mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-red-300">Else: Next Step</label>
                              <Input
                                placeholder="Step ID"
                                value={step.condition?.else_step || ''}
                                onChange={e => {
                                  updateStep(step.id, {
                                    condition: { ...step.condition, else_step: e.target.value }
                                  });
                                }}
                                className="text-sm bg-gray-600 border-gray-500 mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {step.condition?.type === 'switch' && (
                        <div className="p-3 bg-purple-900/30 rounded border border-purple-700 space-y-2">
                          <label className="text-xs font-medium text-purple-300">Switch Variable</label>
                          <Input
                            placeholder="e.g., response.type"
                            value={step.condition?.switch_variable || ''}
                            onChange={e => {
                              updateStep(step.id, {
                                condition: { ...step.condition, switch_variable: e.target.value }
                              });
                            }}
                            className="text-sm bg-gray-600 border-gray-500"
                          />
                          <label className="text-xs font-medium text-purple-300 block mt-2">Cases (JSON)</label>
                          <textarea
                            placeholder='{"success": "step_2", "error": "step_3", "default": "step_4"}'
                            value={step.condition?.cases ? JSON.stringify(step.condition.cases) : ''}
                            onChange={e => {
                              try {
                                const cases = JSON.parse(e.target.value);
                                updateStep(step.id, {
                                  condition: { ...step.condition, cases }
                                });
                              } catch (err) {
                                // Invalid JSON, ignore
                              }
                            }}
                            className="w-full text-sm bg-gray-600 border-gray-500 rounded p-2 min-h-[60px] font-mono"
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
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedWorkflow.execution_history.slice(-5).map((execution, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border border-gray-600 rounded bg-gray-700">
                      <div>
                        <p className="text-sm font-medium">{new Date(execution.executed_at).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{execution.duration_ms}ms</p>
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
      </TabsContent>

      <TabsContent value="ai-assistant" className="space-y-6 mt-6">
        <AIWorkflowAssistant 
          onWorkflowGenerated={handleWorkflowGenerated}
          currentWorkflow={selectedWorkflow}
        />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6 mt-6">
        <WorkflowPerformanceInsights 
          workflow={selectedWorkflow}
          executionHistory={selectedWorkflow?.execution_history}
        />
      </TabsContent>
    </Tabs>
    </div>
  );
}