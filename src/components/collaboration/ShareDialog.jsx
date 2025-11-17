import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, UserPlus, Mail } from "lucide-react";

export default function ShareDialog({ resource, onClose, onShared }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;

    setIsSharing(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Collaboration.create({
        resource_type: resource.type,
        resource_id: resource.id,
        resource_title: resource.title,
        collaborators: [
          { email: user.email, role: "owner", added_date: new Date().toISOString() },
          { email: email.trim(), role, added_date: new Date().toISOString() }
        ],
        activity_log: [{
          user_email: user.email,
          action: `Shared with ${email}`,
          timestamp: new Date().toISOString(),
          details: `Added as ${role}`
        }],
        active_viewers: []
      });

      onShared?.();
      onClose();
    } catch (error) {
      console.error("Failed to share:", error);
      alert("Failed to share. Please try again.");
    }
    setIsSharing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Share Resource</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor - Can edit and manage</SelectItem>
                <SelectItem value="viewer">Viewer - Can only view</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleShare}
            disabled={isSharing || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>
    </div>
  );
}