"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Palette, Shield } from "lucide-react";
import RoleManagementPanel from "../components/admin/RoleManagementPanel";
import BrandKitAssignmentManager from "../components/brandkit/BrandKitAssignmentManager";

export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-400" />
          <span>Team Management</span>
        </h1>
        <p className="text-gray-400">
          Manage user roles, permissions, and brand kit assignments for your
          team
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="roles">
            <Shield className="w-4 h-4 mr-2" />
            User Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="brands">
            <Palette className="w-4 h-4 mr-2" />
            Brand Kit Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagementPanel />
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <BrandKitAssignmentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
