import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Package, Workflow, Eye, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const resourceIcons = {
  content: FileText,
  product: Package,
  workflow: Workflow,
  project: FileText
};

export default function CollaborationCard({ collaboration, onRefresh }) {
  const Icon = resourceIcons[collaboration.resource_type] || FileText;
  const isActive = collaboration.active_viewers?.length > 0;

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Icon className="w-5 h-5 text-blue-400 mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{collaboration.resource_title}</h3>
              <Badge variant="outline" className="text-xs mt-1">
                {collaboration.resource_type}
              </Badge>
            </div>
          </div>
          {isActive && (
            <Badge className="bg-green-500/20 text-green-400">
              <Eye className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <div className="flex -space-x-2">
            {collaboration.collaborators?.slice(0, 3).map((collab, i) => (
              <Avatar key={i} className="w-6 h-6 border-2 border-gray-800">
                <AvatarFallback className="text-xs bg-blue-600">
                  {collab.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {collaboration.collaborators?.length} collaborator{collaboration.collaborators?.length !== 1 ? 's' : ''}
          </span>
        </div>

        {collaboration.activity_log?.length > 0 && (
          <div className="bg-gray-900 p-2 rounded text-xs text-gray-400">
            Latest: {collaboration.activity_log[collaboration.activity_log.length - 1].action}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Eye className="w-3 h-3 mr-2" />
            Open
          </Button>
        </div>
      </div>
    </Card>
  );
}