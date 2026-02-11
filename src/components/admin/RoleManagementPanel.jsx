import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Plus, Edit, Trash2, Users, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PERMISSION_CATEGORIES = {
  generators: {
    label: 'Generators',
    permissions: ['universal_generator', 'feature_generator', 'prd_generator', 'brandkit_generator', 'content_creator']
  },
  business_intelligence: {
    label: 'Business Intelligence',
    permissions: ['deal_sourcer', 'view_deals', 'edit_deals', 'delete_deals', 'analytics', 'advanced_analytics']
  },
  ecommerce: {
    label: 'E-commerce',
    permissions: ['view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products', 'manage_inventory']
  },
  content: {
    label: 'Content',
    permissions: ['view_content', 'create_content', 'edit_content', 'delete_content', 'schedule_content', 'publish_content']
  },
  collaboration: {
    label: 'Collaboration',
    permissions: ['view_projects', 'create_projects', 'edit_projects', 'delete_projects', 'share_projects', 'manage_team']
  },
  workflows: {
    label: 'Workflows',
    permissions: ['view_workflows', 'create_workflows', 'edit_workflows', 'delete_workflows', 'execute_workflows']
  },
  integrations: {
    label: 'Integrations',
    permissions: ['view_integrations', 'connect_integrations', 'manage_integrations', 'view_sync_logs']
  },
  admin: {
    label: 'Admin',
    permissions: ['manage_roles', 'manage_users', 'view_billing', 'manage_billing', 'view_usage_logs', 'system_settings']
  }
};

export default function RoleManagementPanel() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const fetchedRoles = await base44.entities.Role.list();
      setRoles(fetchedRoles);
    } catch (error) {
      toast.error('Failed to fetch roles');
    }
    setLoading(false);
  };

  const createDefaultRole = (name) => ({
    name,
    description: '',
    is_system_role: false,
    permissions: Object.keys(PERMISSION_CATEGORIES).reduce((acc, category) => {
      acc[category] = PERMISSION_CATEGORIES[category].permissions.reduce((perms, perm) => {
        perms[perm] = false;
        return perms;
      }, {});
      return acc;
    }, {}),
    resource_limits: {
      max_projects: -1,
      max_content_pieces: -1,
      max_products: -1,
      max_workflows: -1,
      max_team_members: -1
    },
    is_active: true
  });

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole?.id) {
        await base44.entities.Role.update(editingRole.id, roleData);
        toast.success('Role updated successfully');
      } else {
        await base44.entities.Role.create(roleData);
        toast.success('Role created successfully');
      }
      fetchRoles();
      setShowDialog(false);
      setEditingRole(null);
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await base44.entities.Role.delete(roleId);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Role Management
          </h2>
          <p className="text-gray-400">Define and manage user roles with granular permissions</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRole(createDefaultRole('New Role'))} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>{editingRole?.id ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            </DialogHeader>
            {editingRole && <RoleEditor role={editingRole} onSave={handleSaveRole} onCancel={() => setShowDialog(false)} />}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {role.name}
                    {role.is_system_role && <Badge variant="outline" className="text-xs">System</Badge>}
                    {!role.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">{role.description || 'No description'}</p>
                </div>
                {!role.is_system_role && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingRole(role);
                        setShowDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <RolePermissionsSummary permissions={role.permissions} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RoleEditor({ role, onSave, onCancel }) {
  const [editedRole, setEditedRole] = useState(role);

  const handlePermissionChange = (category, permission, value) => {
    setEditedRole({
      ...editedRole,
      permissions: {
        ...editedRole.permissions,
        [category]: {
          ...editedRole.permissions[category],
          [permission]: value
        }
      }
    });
  };

  const handleLimitChange = (limitKey, value) => {
    setEditedRole({
      ...editedRole,
      resource_limits: {
        ...editedRole.resource_limits,
        [limitKey]: value === '' ? -1 : parseInt(value)
      }
    });
  };

  const toggleCategoryPermissions = (category, enabled) => {
    const updatedPerms = { ...editedRole.permissions[category] };
    PERMISSION_CATEGORIES[category].permissions.forEach(perm => {
      updatedPerms[perm] = enabled;
    });
    setEditedRole({
      ...editedRole,
      permissions: {
        ...editedRole.permissions,
        [category]: updatedPerms
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Role Name</label>
          <Input
            value={editedRole.name}
            onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
            placeholder="e.g., Analyst, Contributor, Viewer"
            className="bg-gray-700 border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={editedRole.description}
            onChange={(e) => setEditedRole({ ...editedRole, description: e.target.value })}
            placeholder="Describe this role's purpose and responsibilities"
            className="bg-gray-700 border-gray-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={editedRole.is_active}
            onCheckedChange={(checked) => setEditedRole({ ...editedRole, is_active: checked })}
          />
          <label className="text-sm">Role is active</label>
        </div>
      </div>

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="bg-gray-700">
          <TabsTrigger value="permissions">
            <Lock className="w-4 h-4 mr-2" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="limits">
            <Users className="w-4 h-4 mr-2" />
            Resource Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4 mt-4">
          {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
            const allEnabled = category.permissions.every(
              perm => editedRole.permissions[categoryKey]?.[perm]
            );
            const someEnabled = category.permissions.some(
              perm => editedRole.permissions[categoryKey]?.[perm]
            );

            return (
              <Card key={categoryKey} className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{category.label}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCategoryPermissions(categoryKey, !allEnabled)}
                    >
                      {allEnabled ? 'Disable All' : 'Enable All'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {category.permissions.map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <Switch
                          checked={editedRole.permissions[categoryKey]?.[permission] || false}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(categoryKey, permission, checked)
                          }
                        />
                        <label className="text-sm">
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="limits" className="space-y-4 mt-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle>Resource Limits</CardTitle>
              <p className="text-sm text-gray-400">Set -1 for unlimited</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Max Projects</label>
                <Input
                  type="number"
                  value={editedRole.resource_limits.max_projects}
                  onChange={(e) => handleLimitChange('max_projects', e.target.value)}
                  className="bg-gray-600 border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Content Pieces</label>
                <Input
                  type="number"
                  value={editedRole.resource_limits.max_content_pieces}
                  onChange={(e) => handleLimitChange('max_content_pieces', e.target.value)}
                  className="bg-gray-600 border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Products</label>
                <Input
                  type="number"
                  value={editedRole.resource_limits.max_products}
                  onChange={(e) => handleLimitChange('max_products', e.target.value)}
                  className="bg-gray-600 border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Workflows</label>
                <Input
                  type="number"
                  value={editedRole.resource_limits.max_workflows}
                  onChange={(e) => handleLimitChange('max_workflows', e.target.value)}
                  className="bg-gray-600 border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Team Members</label>
                <Input
                  type="number"
                  value={editedRole.resource_limits.max_team_members}
                  onChange={(e) => handleLimitChange('max_team_members', e.target.value)}
                  className="bg-gray-600 border-gray-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(editedRole)} className="bg-blue-600 hover:bg-blue-700">
          {role.id ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </div>
  );
}

function RolePermissionsSummary({ permissions }) {
  const enabledCount = Object.values(permissions || {}).reduce(
    (count, category) => count + Object.values(category).filter(Boolean).length,
    0
  );

  const totalCount = Object.values(PERMISSION_CATEGORIES).reduce(
    (count, cat) => count + cat.permissions.length,
    0
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Permissions</span>
        <Badge variant="outline">
          {enabledCount} / {totalCount}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
          const enabled = category.permissions.some(
            perm => permissions?.[key]?.[perm]
          );
          return enabled ? (
            <Badge key={key} className="text-xs bg-blue-600">
              {category.label}
            </Badge>
          ) : null;
        })}
      </div>
    </div>
  );
}