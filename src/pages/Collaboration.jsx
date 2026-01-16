"use client";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Share2,
  FileText,
  Workflow as WorkflowIcon,
  Activity,
} from "lucide-react";

import CollaborationCard from "../components/collaboration/CollaborationCard";
import ShareDialog from "../components/collaboration/ShareDialog";
import ActivityFeed from "../components/collaboration/ActivityFeed";

export default function Collaboration() {
  const [collaborations, setCollaborations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Collaboration.list("-updated_date");
      setCollaborations(data);
    } catch (error) {
      console.error("Failed to fetch collaborations:", error);
    }
    setIsLoading(false);
  };

  const handleShare = (resource) => {
    setSelectedResource(resource);
    setShowShareDialog(true);
  };

  const myCollaborations = collaborations.filter((c) =>
    c.collaborators?.some((col) => col.email === base44.auth.currentUser?.email)
  );

  const stats = {
    total: myCollaborations.length,
    active: myCollaborations.filter((c) => c.active_viewers?.length > 0).length,
    owned: myCollaborations.filter(
      (c) => c.created_by === base44.auth.currentUser?.email
    ).length,
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-400" />
          <span>Real-time Collaboration</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Collaborate with your team on projects, workflows, and content in
          real-time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Collaborations</p>
              <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Now</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.active}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Owned by Me</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.owned}
              </p>
            </div>
            <Share2 className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="all">
            All Shared ({myCollaborations.length})
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <WorkflowIcon className="w-4 h-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="w-4 h-4 mr-2" />
            Activity Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {myCollaborations.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No collaborations yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start collaborating by sharing your content or workflows with
                team members
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCollaborations.map((collab) => (
                <CollaborationCard
                  key={collab.id}
                  collaboration={collab}
                  onRefresh={fetchCollaborations}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCollaborations
              .filter((c) => c.resource_type === "content")
              .map((collab) => (
                <CollaborationCard
                  key={collab.id}
                  collaboration={collab}
                  onRefresh={fetchCollaborations}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCollaborations
              .filter((c) => c.resource_type === "workflow")
              .map((collab) => (
                <CollaborationCard
                  key={collab.id}
                  collaboration={collab}
                  onRefresh={fetchCollaborations}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityFeed collaborations={myCollaborations} />
        </TabsContent>
      </Tabs>

      {showShareDialog && (
        <ShareDialog
          resource={selectedResource}
          onClose={() => {
            setShowShareDialog(false);
            setSelectedResource(null);
          }}
          onShared={fetchCollaborations}
        />
      )}
    </div>
  );
}
