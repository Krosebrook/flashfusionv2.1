import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Play,
  Save,
  ArrowRight,
  Bot,
  Code,
  FileText,
  Database,
  Image,
  ShoppingCart,
  GitBranch,
} from "lucide-react";

import WorkflowNode from "./WorkflowNode";

const agentTypes = [
  {
    id: "CodeGen",
    name: "Code Generator",
    icon: Code,
    description: "Generate code and features",
  },
  {
    id: "Content",
    name: "Content Creator",
    icon: FileText,
    description: "Create content and copy",
  },
  {
    id: "Database",
    name: "Database Agent",
    icon: Database,
    description: "Manage data operations",
  },
  {
    id: "Branding",
    name: "Brand Agent",
    icon: Image,
    description: "Create brand assets",
  },
  {
    id: "Commerce",
    name: "E-commerce Agent",
    icon: ShoppingCart,
    description: "Manage products",
  },
  {
    id: "condition",
    name: "Conditional Branch",
    icon: GitBranch,
    description: "Add conditional logic",
  },
];

export default function WorkflowBuilder({ workflow, onSave, onExecute }) {
  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const [nodes, setNodes] = useState(workflow?.nodes || []);
  const [editingNode, setEditingNode] = useState(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);

  const addNode = (agentType) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: agentType.id,
      name: agentType.name,
      description: agentType.description,
      config: {},
      position: nodes.length,
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
  };

  const editNode = (node) => {
    setEditingNode(node);
    setShowNodeConfig(true);
  };

  const updateNode = (updatedNode) => {
    setNodes(nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setShowNodeConfig(false);
    setEditingNode(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(nodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedNodes = items.map((node, index) => ({
      ...node,
      position: index,
    }));

    setNodes(updatedNodes);
  };

  const handleSave = () => {
    const workflowData = {
      name: workflowName || "Untitled Workflow",
      nodes,
      connections: nodes
        .map((node, index) => ({
          from: node.id,
          to: nodes[index + 1]?.id || null,
        }))
        .filter((c) => c.to),
      status: "draft",
    };
    onSave?.(workflowData);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Workflow Name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-gray-900 border-gray-600 text-lg font-semibold"
          />
          <Button
            onClick={handleSave}
            disabled={!workflowName || nodes.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={() => onExecute?.(nodes)}
            disabled={nodes.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Palette */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-4">Add Agents</h3>
            <div className="space-y-2">
              {agentTypes.map((agentType) => {
                const Icon = agentType.icon;
                return (
                  <Button
                    key={agentType.id}
                    onClick={() => addNode(agentType)}
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="truncate">{agentType.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Workflow Canvas */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold mb-4">
              Workflow ({nodes.length} nodes)
            </h3>
            {nodes.length === 0 ? (
              <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-12 text-center">
                <Bot className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">No agents added yet</p>
                <p className="text-sm text-gray-500">
                  Add agents from the left panel to build your workflow
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="workflow">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-gray-700"
                      }`}
                    >
                      {nodes.map((node, index) => (
                        <div key={node.id}>
                          <Draggable draggableId={node.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={
                                  snapshot.isDragging ? "opacity-50" : ""
                                }
                              >
                                <WorkflowNode
                                  node={node}
                                  onEdit={editNode}
                                  onDelete={() => deleteNode(node.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                          {index < nodes.length - 1 && (
                            <div className="flex justify-center py-2">
                              <ArrowRight className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      </Card>

      {/* Node Configuration Modal */}
      {showNodeConfig && editingNode && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4">
            Configure: {editingNode.name}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Task Description
              </label>
              <Input
                value={editingNode.config?.task || ""}
                onChange={(e) =>
                  setEditingNode({
                    ...editingNode,
                    config: { ...editingNode.config, task: e.target.value },
                  })
                }
                placeholder="What should this agent do?"
                className="bg-gray-900 border-gray-600"
              />
            </div>

            {editingNode.type === "condition" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Condition
                </label>
                <Input
                  value={editingNode.config?.condition || ""}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      config: {
                        ...editingNode.config,
                        condition: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., result.status === 'success'"
                  className="bg-gray-900 border-gray-600"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => updateNode(editingNode)}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setShowNodeConfig(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
