"use client";
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Workflow, Activity, FolderOpen, Zap } from "lucide-react";

import WorkflowBuilder from "../components/agents/WorkflowBuilder";
import ActiveTaskMonitor from "../components/agents/ActiveTaskMonitor";
import WorkflowLibrary from "../components/agents/WorkflowLibrary";

export default function AgentOrchestration() {
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [activeTab, setActiveTab] = useState("builder");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaveWorkflow = async (workflowData) => {
    try {
      if (currentWorkflow?.id) {
        await base44.entities.Workflow.update(currentWorkflow.id, workflowData);
        alert("Workflow updated successfully!");
      } else {
        const saved = await base44.entities.Workflow.create(workflowData);
        setCurrentWorkflow(saved);
        alert("Workflow saved successfully!");
      }
      setActiveTab("library");
    } catch (error) {
      console.error("Failed to save workflow:", error);
      alert("Failed to save workflow. Please try again.");
    }
  };

  const handleExecuteWorkflow = async (nodes) => {
    if (!nodes || nodes.length === 0) return;

    try {
      const user = await base44.auth.me();
      
      // Simulate workflow execution
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Create agent task
        await base44.entities.AgentTask.create({
          project_id: "workflow_execution",
          agent_type: node.type === 'condition' ? 'Orchestrator' : node.type,
          task_description: node.config?.task || node.description,
          input_data: node.config,
          status: "in_progress",
          credits_used: 0
        });

        // Wait a bit to simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update execution count if workflow exists
      if (currentWorkflow?.id) {
        await base44.entities.Workflow.update(currentWorkflow.id, {
          execution_count: (currentWorkflow.execution_count || 0) + 1,
          last_executed: new Date().toISOString()
        });
      }

      setRefreshTrigger(prev => prev + 1);
      setActiveTab("monitor");
      
      alert(`Workflow execution started with ${nodes.length} agents!`);
    } catch (error) {
      console.error("Workflow execution failed:", error);
      alert("Failed to execute workflow. Please try again.");
    }
  };

  const handleLoadWorkflow = (workflow) => {
    setCurrentWorkflow(workflow);
    setActiveTab("builder");
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Bot className="w-8 h-8 text-purple-400" />
          <span>Agent Orchestration Hub</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Build, manage, and execute complex multi-agent workflows with visual drag-and-drop interface
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800 grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="builder">
            <Workflow className="w-4 h-4 mr-2" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="monitor">
            <Activity className="w-4 h-4 mr-2" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="library">
            <FolderOpen className="w-4 h-4 mr-2" />
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <WorkflowBuilder
            workflow={currentWorkflow}
            onSave={handleSaveWorkflow}
            onExecute={handleExecuteWorkflow}
          />
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <ActiveTaskMonitor refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <WorkflowLibrary
            onLoad={handleLoadWorkflow}
            onExecute={(workflow) => handleExecuteWorkflow(workflow.nodes)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}