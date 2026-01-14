import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FolderOpen, Play, Copy, Trash2, Search, 
  Star, TrendingUp, Loader2 
} from "lucide-react";

export default function WorkflowLibrary({ onLoad, onExecute }) {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const allWorkflows = await base44.entities.Workflow.list("-created_date");
      setWorkflows(allWorkflows);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (workflowId) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    
    try {
      await base44.entities.Workflow.delete(workflowId);
      setWorkflows(workflows.filter(w => w.id !== workflowId));
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      alert("Failed to delete workflow. Please try again.");
    }
  };

  const handleDuplicate = async (workflow) => {
    try {
      const duplicate = await base44.entities.Workflow.create({
        ...workflow,
        name: `${workflow.name} (Copy)`,
        id: undefined,
        created_date: undefined,
        execution_count: 0
      });
      setWorkflows([duplicate, ...workflows]);
    } catch (error) {
      console.error("Failed to duplicate workflow:", error);
      alert("Failed to duplicate workflow. Please try again.");
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const templates = filteredWorkflows.filter(w => w.is_template);
  const myWorkflows = filteredWorkflows.filter(w => !w.is_template);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-600 pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <>
          {templates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onLoad={onLoad}
                    onExecute={onExecute}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    isTemplate
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-400" />
              My Workflows ({myWorkflows.length})
            </h3>
            {myWorkflows.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No workflows saved yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create a workflow in the builder and save it to see it here
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onLoad={onLoad}
                    onExecute={onExecute}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, onLoad, onExecute, onDuplicate, onDelete, isTemplate }) {
  return (
    <Card className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-all">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{workflow.name}</h4>
            {workflow.description && (
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                {workflow.description}
              </p>
            )}
          </div>
          {isTemplate && (
            <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Badge variant="outline" className="text-xs">
            {workflow.nodes?.length || 0} nodes
          </Badge>
          <Badge className={
            workflow.status === 'active' ? 'bg-green-500/20 text-green-400' :
            workflow.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }>
            {workflow.status}
          </Badge>
        </div>

        {workflow.execution_count > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>Executed {workflow.execution_count} times</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onLoad?.(workflow)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <FolderOpen className="w-3 h-3 mr-2" />
            Load
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExecute?.(workflow)}
          >
            <Play className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicate?.(workflow)}
          >
            <Copy className="w-3 h-3" />
          </Button>
          {!isTemplate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete?.(workflow.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}