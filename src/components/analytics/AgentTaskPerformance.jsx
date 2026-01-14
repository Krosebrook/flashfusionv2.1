import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bot, Clock, Zap, TrendingUp, AlertCircle } from "lucide-react";

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'];

export default function AgentTaskPerformance({ tasks }) {
  // Agent performance by type
  const agentStats = tasks.reduce((acc, task) => {
    if (!acc[task.agent_type]) {
      acc[task.agent_type] = {
        agent: task.agent_type,
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: 0,
        totalTime: 0,
        totalCredits: 0
      };
    }
    acc[task.agent_type].total += 1;
    if (task.status === 'completed') acc[task.agent_type].completed += 1;
    if (task.status === 'failed') acc[task.agent_type].failed += 1;
    if (task.status === 'in_progress') acc[task.agent_type].inProgress += 1;
    acc[task.agent_type].totalTime += task.execution_time || 0;
    acc[task.agent_type].totalCredits += task.credits_used || 0;
    return acc;
  }, {});

  const agentPerformance = Object.values(agentStats).map(agent => ({
    ...agent,
    successRate: agent.total > 0 ? ((agent.completed / agent.total) * 100).toFixed(1) : 0,
    avgTime: agent.completed > 0 ? (agent.totalTime / agent.completed).toFixed(2) : 0,
    avgCredits: agent.completed > 0 ? Math.round(agent.totalCredits / agent.completed) : 0
  }));

  // Distribution chart data
  const distributionData = agentPerformance.map(a => ({
    name: a.agent,
    value: a.total
  }));

  // Performance comparison data
  const comparisonData = agentPerformance.map(a => ({
    agent: a.agent,
    successRate: parseFloat(a.successRate),
    avgTime: parseFloat(a.avgTime),
    avgCredits: a.avgCredits
  }));

  // Identify slow agents
  const slowAgents = agentPerformance.filter(a => parseFloat(a.avgTime) > 5);
  const unreliableAgents = agentPerformance.filter(a => parseFloat(a.successRate) < 80 && a.total > 3);

  const totalTasks = tasks.length;
  const avgExecutionTime = tasks.length > 0
    ? (tasks.reduce((sum, t) => sum + (t.execution_time || 0), 0) / tasks.filter(t => t.execution_time).length).toFixed(2)
    : 0;
  const totalCreditsConsumed = tasks.reduce((sum, t) => sum + (t.credits_used || 0), 0);
  const overallSuccessRate = tasks.length > 0
    ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-purple-400">{totalTasks}</p>
            </div>
            <Bot className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">{overallSuccessRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Time</p>
              <p className="text-2xl font-bold text-blue-400">{avgExecutionTime}s</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Credits Used</p>
              <p className="text-2xl font-bold text-yellow-400">{totalCreditsConsumed}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>
      </div>

      {(slowAgents.length > 0 || unreliableAgents.length > 0) && (
        <Card className="bg-orange-900/20 border-orange-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-400">Agent Optimization Opportunities</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slowAgents.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm text-gray-300">Slow Agents ({">"} 5s avg)</h4>
                <div className="space-y-2">
                  {slowAgents.map((agent, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{agent.agent}</span>
                      <Badge className="bg-orange-500/20 text-orange-400">{agent.avgTime}s</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {unreliableAgents.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm text-gray-300">Low Success Rate ({"<"} 80%)</h4>
                <div className="space-y-2">
                  {unreliableAgents.map((agent, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{agent.agent}</span>
                      <Badge className="bg-red-500/20 text-red-400">{agent.successRate}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Task Distribution by Agent Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Success Rate by Agent</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="agent" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="successRate" fill="#10B981" name="Success Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Agent Performance</h3>
        <div className="space-y-3">
          {agentPerformance.map((agent, index) => (
            <div key={agent.agent} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <h4 className="font-semibold">{agent.agent}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    parseFloat(agent.successRate) >= 90 ? 'bg-green-500/20 text-green-400' :
                    parseFloat(agent.successRate) >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }>
                    {agent.successRate}% success
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                <div className="bg-gray-800 p-2 rounded text-center">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="font-bold text-blue-400">{agent.total}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded text-center">
                  <p className="text-gray-400 text-xs">Completed</p>
                  <p className="font-bold text-green-400">{agent.completed}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded text-center">
                  <p className="text-gray-400 text-xs">Failed</p>
                  <p className="font-bold text-red-400">{agent.failed}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded text-center">
                  <p className="text-gray-400 text-xs">Avg Time</p>
                  <p className="font-bold text-blue-400">{agent.avgTime}s</p>
                </div>
                <div className="bg-gray-800 p-2 rounded text-center">
                  <p className="text-gray-400 text-xs">Avg Credits</p>
                  <p className="font-bold text-yellow-400">{agent.avgCredits}</p>
                </div>
                <div className="bg-gray-800 p-2 rounded text-center">
                  <p className="text-gray-400 text-xs">Total Credits</p>
                  <p className="font-bold text-orange-400">{agent.totalCredits}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}