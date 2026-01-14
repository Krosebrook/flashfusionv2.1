import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, GitBranch, Play, Trash2, Settings, 
  Code, Database, FileText, Image, ShoppingCart 
} from "lucide-react";

const nodeIcons = {
  CodeGen: Code,
  Content: FileText,
  Database: Database,
  Branding: Image,
  Commerce: ShoppingCart,
  condition: GitBranch,
  trigger: Play
};

const nodeColors = {
  CodeGen: "bg-blue-500/20 border-blue-500 text-blue-400",
  Content: "bg-purple-500/20 border-purple-500 text-purple-400",
  Database: "bg-green-500/20 border-green-500 text-green-400",
  Branding: "bg-pink-500/20 border-pink-500 text-pink-400",
  Commerce: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
  condition: "bg-orange-500/20 border-orange-500 text-orange-400",
  trigger: "bg-red-500/20 border-red-500 text-red-400"
};

export default function WorkflowNode({ node, onEdit, onDelete, isActive }) {
  const Icon = nodeIcons[node.type] || Bot;
  const colorClass = nodeColors[node.type] || "bg-gray-500/20 border-gray-500 text-gray-400";

  return (
    <Card className={`p-4 border-2 transition-all ${colorClass} ${isActive ? 'shadow-lg scale-105' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{node.name}</h4>
          <p className="text-xs text-gray-400 truncate">{node.description}</p>
          {node.type === 'condition' && (
            <Badge className="mt-2 text-xs">
              If {node.config?.condition}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit?.(node)}
            className="h-7 w-7 p-0"
          >
            <Settings className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete?.(node)}
            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}