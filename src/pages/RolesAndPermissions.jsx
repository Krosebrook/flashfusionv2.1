import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoleManagementPanel from '../components/admin/RoleManagementPanel';
import UserRoleAssignment from '../components/admin/UserRoleAssignment';
import { Shield, Users } from 'lucide-react';

export default function RolesAndPermissions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          Roles & Permissions
        </h1>
        <p className="text-gray-400 mt-2">
          Manage user roles and define granular access controls
        </p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="roles">
            <Shield className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Users className="w-4 h-4 mr-2" />
            User Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RoleManagementPanel />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <UserRoleAssignment />
        </TabsContent>
      </Tabs>
    </div>
  );
}