import React from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const actionIcons = {
  insert: Plus,
  update: Edit,
  delete: Trash2
};

const actionColors = {
  insert: "text-green-400 bg-green-400/20",
  update: "text-blue-400 bg-blue-400/20",
  delete: "text-red-400 bg-red-400/20"
};

export default function WSJFHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        No history available
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {sortedHistory.map((entry, index) => {
        const Icon = actionIcons[entry.action];
        
        return (
          <div 
            key={entry.id || index}
            className="flex items-start gap-3 p-2 bg-gray-900 rounded-lg text-sm"
          >
            <div className={`p-1.5 rounded ${actionColors[entry.action]}`}>
              <Icon className="w-3 h-3" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium capitalize">{entry.action}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(entry.created_date), "MMM d, h:mm a")}
                </span>
              </div>
              
              <div className="text-xs text-gray-400 mb-1">
                by {entry.actor_email}
              </div>

              {entry.action === "update" && entry.changed_fields?.length > 0 && (
                <div className="space-y-1">
                  {entry.changed_fields.map((field) => (
                    <div key={field} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs py-0">
                        {field.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-red-400">{entry.old_values?.[field]}</span>
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      <span className="text-green-400">{entry.new_values?.[field]}</span>
                    </div>
                  ))}
                </div>
              )}

              {entry.action === "update" && 
               entry.old_wsjf_score !== entry.new_wsjf_score && (
                <div className="flex items-center gap-2 text-xs mt-1 text-purple-400">
                  <span>WSJF: {entry.old_wsjf_score?.toFixed(1)}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">{entry.new_wsjf_score?.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}