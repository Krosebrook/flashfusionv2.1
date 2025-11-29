import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, ChevronUp, Edit, Trash2, History, 
  TrendingUp, Clock, Shield, Box 
} from "lucide-react";
import WSJFHistory from "./WSJFHistory";

const statusColors = {
  backlog: "bg-gray-500",
  ready: "bg-blue-500",
  in_progress: "bg-yellow-500",
  done: "bg-green-500",
  cancelled: "bg-red-500"
};

const ScoreBar = ({ label, value, icon: Icon, color }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1 text-gray-400">
        <Icon className="w-3 h-3" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-1.5">
      <div 
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${value * 10}%` }}
      />
    </div>
  </div>
);

export default function WSJFCard({ item, onEdit, onDelete, history }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{item.title}</h3>
              <Badge className={`${statusColors[item.status]} text-white text-xs`}>
                {item.status.replace("_", " ")}
              </Badge>
            </div>
            {item.description && (
              <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => onDelete(item)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <div className="text-2xl font-bold">{item.wsjf_score?.toFixed(1) || "N/A"}</div>
            <div className="text-xs text-gray-200">WSJF Score</div>
          </div>
          
          <div className="flex-1 ml-4 grid grid-cols-2 gap-2">
            <ScoreBar label="Business Value" value={item.business_value} icon={TrendingUp} color="bg-green-500" />
            <ScoreBar label="Time Critical" value={item.time_criticality} icon={Clock} color="bg-yellow-500" />
            <ScoreBar label="Risk Reduction" value={item.risk_reduction} icon={Shield} color="bg-blue-500" />
            <ScoreBar label="Job Size" value={item.job_size} icon={Box} color="bg-purple-500" />
          </div>
        </div>

        {item.owner_email && (
          <div className="text-xs text-gray-400">
            Owner: <span className="text-gray-300">{item.owner_email}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-gray-400 hover:text-white"
          onClick={() => setShowHistory(!showHistory)}
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History ({history?.length || 0} changes)
          </span>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {showHistory && (
          <WSJFHistory history={history} />
        )}
      </div>
    </Card>
  );
}