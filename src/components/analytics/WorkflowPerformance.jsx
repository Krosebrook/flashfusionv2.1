import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Workflow, Clock, CheckCircle2, XCircle, Zap, AlertTriangle } from "lucide-react";

export default function WorkflowPerformance({ workflows, tasks }) {
  // Calculate workflow metrics
  const workflowMetrics = workflows.map(workflow => {
    const workflowTasks = tasks.filter(t => t.project_id === workflow.id || t.project_id === `workflow_${workflow.id}`);
    const totalExecutions = workflow.execution_count || 0;
    const successfulExecutions = workflowTasks.filter(t => t.status === 'completed').length;
    const failedExecutions = workflowTasks.filter(t => t.status === 'failed').length;
    const avgExecutionTime = workflowTasks.length > 0
      ? workflowTasks.reduce((sum, t) => sum + (t.execution_time || 0), 0) / workflowTasks.length
      : 0;
    const totalCredits = workflowTasks.reduce((sum, t) => sum + (t.credits_used || 0), 0);
    const successRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : 0;

    return {
      id: workflow.id,
      name: workflow.name,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: parseFloat(successRate),
      avgExecutionTime: avgExecutionTime.toFixed(2),
      totalCredits,
      nodes: workflow.nodes?.length || 0
    };
  });

  const topWorkflows = [...workflowMetrics]
    .sort((a, b) => b.totalExecutions - a.totalExecutions)
    .slice(0, 5);

  const totalWorkflowExecutions = workflowMetrics.reduce((sum, w) => sum + w.totalExecutions, 0);
  const avgSuccessRate = workflowMetrics.length > 0
    ? workflowMetrics.reduce((sum, w) => sum + w.successRate, 0) / workflowMetrics.length
    : 0;
  const totalWorkflowCredits = workflowMetrics.reduce((sum, w) => sum + w.totalCredits, 0);

  // Identify bottlenecks
  const bottlenecks = workflowMetrics
    .filter(w => w.successRate < 80 || w.avgExecutionTime > 30)
    .map(w => ({
      ...w,
      issues: [
        w.successRate < 80 && `Low success rate (${w.successRate}%)`,
        w.avgExecutionTime > 30 && `Slow execution (${w.avgExecutionTime}s avg)`,
        w.totalCredits > 500 && `High credit usage (${w.totalCredits} credits)`
      ].filter(Boolean)
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Executions</p>
              <p className="text-2xl font-bold text-blue-400">{totalWorkflowExecutions}</p>
            </div>
            <Workflow className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Success Rate</p>
              <p className="text-2xl font-bold text-green-400">{avgSuccessRate.toFixed(1)}%</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Credits Used</p>
              <p className="text-2xl font-bold text-yellow-400">{totalWorkflowCredits}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bottlenecks</p>
              <p className="text-2xl font-bold text-red-400">{bottlenecks.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </Card>
      </div>

      {bottlenecks.length > 0 && (
        <Card className="bg-red-900/20 border-red-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Performance Bottlenecks Detected</h3>
          </div>
          <div className="space-y-3">
            {bottlenecks.map((workflow) => (
              <div key={workflow.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{workflow.name}</h4>
                  <Badge className="bg-red-500/20 text-red-400">Needs Optimization</Badge>
                </div>
                <div className="space-y-1">
                  {workflow.issues.map((issue, i) => (
                    <p key={i} className="text-sm text-red-300">⚠️ {issue}</p>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>{workflow.nodes} nodes</span>
                  <span>{workflow.totalExecutions} executions</span>
                  <span>{workflow.avgExecutionTime}s avg</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Workflows by Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topWorkflows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="totalExecutions" fill="#3B82F6" name="Executions" />
            <Bar dataKey="totalCredits" fill="#F59E0B" name="Credits Used" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Workflow Performance Details</h3>
        <div className="space-y-4">
          {workflowMetrics.map((workflow) => (
            <div key={workflow.id} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{workflow.name}</h4>
                  <p className="text-xs text-gray-400">{workflow.nodes} nodes • {workflow.totalExecutions} executions</p>
                </div>
                <Badge className={
                  workflow.successRate >= 90 ? 'bg-green-500/20 text-green-400' :
                  workflow.successRate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }>
                  {workflow.successRate}% success
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-400 text-xs">Successful</p>
                  <p className="font-bold text-green-400">{workflow.successfulExecutions}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-400 text-xs">Failed</p>
                  <p className="font-bold text-red-400">{workflow.failedExecutions}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-400 text-xs">Avg Time</p>
                  <p className="font-bold text-blue-400">{workflow.avgExecutionTime}s</p>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-400 text-xs">Credits</p>
                  <p className="font-bold text-yellow-400">{workflow.totalCredits}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Success Rate</span>
                  <span>{workflow.successRate}%</span>
                </div>
                <Progress value={workflow.successRate} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}