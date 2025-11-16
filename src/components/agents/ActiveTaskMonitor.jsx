import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, CheckCircle2, XCircle, Clock, 
  Loader2, AlertCircle, Play, Square 
} from "lucide-react";

export default function ActiveTaskMonitor({ refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await base44.entities.AgentTask.list("-created_date", 50);
      setTasks(allTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "failed": return <XCircle className="w-5 h-5 text-red-400" />;
      case "in_progress": return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case "pending": return <Clock className="w-5 h-5 text-yellow-400" />;
      case "retry": return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400";
      case "failed": return "bg-red-500/20 text-red-400";
      case "in_progress": return "bg-blue-500/20 text-blue-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "retry": return "bg-orange-500/20 text-orange-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const activeTasks = tasks.filter(t => t.status === "in_progress" || t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const failedTasks = tasks.filter(t => t.status === "failed");

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Tasks</p>
              <p className="text-2xl font-bold text-blue-400">{activeTasks.length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-400">{completedTasks.length}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-400">{failedTasks.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <Button onClick={fetchTasks} size="sm" variant="outline">
            Refresh
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No tasks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 10).map((task) => (
              <Card key={task.id} className="bg-gray-900 border-gray-700 p-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{task.task_description}</h4>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Agent: {task.agent_type}</span>
                      {task.credits_used > 0 && (
                        <span className="text-yellow-400">{task.credits_used} credits</span>
                      )}
                      {task.execution_time && (
                        <span>{task.execution_time}s</span>
                      )}
                    </div>
                    {task.status === "in_progress" && (
                      <Progress value={50} className="mt-2 h-1" />
                    )}
                    {task.error_message && (
                      <p className="text-xs text-red-400 mt-2">{task.error_message}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}