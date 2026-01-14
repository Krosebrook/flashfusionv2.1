import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Users, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ROLES = {
  admin: {
    label: "Admin",
    color: "bg-red-500/20 text-red-400",
    description: "Full access to all features and settings"
  },
  editor: {
    label: "Editor",
    color: "bg-blue-500/20 text-blue-400",
    description: "Can create, edit, and publish content"
  },
  viewer: {
    label: "Viewer",
    color: "bg-gray-500/20 text-gray-400",
    description: "Read-only access to content and analytics"
  }
};

const PERMISSION_GROUPS = {
  content: {
    label: "Content Management",
    permissions: ["can_create_content", "can_edit_content", "can_delete_content", "can_publish_content"]
  },
  analytics: {
    label: "Analytics & Reporting",
    permissions: ["can_view_analytics"]
  },
  admin: {
    label: "Administration",
    permissions: ["can_manage_users", "can_manage_brands", "can_manage_products"]
  }
};

const ROLE_DEFAULTS = {
  admin: {
    can_create_content: true,
    can_edit_content: true,
    can_delete_content: true,
    can_publish_content: true,
    can_view_analytics: true,
    can_manage_users: true,
    can_manage_brands: true,
    can_manage_products: true
  },
  editor: {
    can_create_content: true,
    can_edit_content: true,
    can_delete_content: false,
    can_publish_content: true,
    can_view_analytics: true,
    can_manage_users: false,
    can_manage_brands: false,
    can_manage_products: false
  },
  viewer: {
    can_create_content: false,
    can_edit_content: false,
    can_delete_content: false,
    can_publish_content: false,
    can_view_analytics: true,
    can_manage_users: false,
    can_manage_brands: false,
    can_manage_products: false
  }
};

export default function RoleManagementPanel() {
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    user_email: "",
    role: "viewer",
    can_create_content: false,
    can_edit_content: false,
    can_delete_content: false,
    can_publish_content: false,
    can_view_analytics: true,
    can_manage_users: false,
    can_manage_brands: false,
    can_manage_products: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, user] = await Promise.all([
        base44.entities.UserRole.list("-created_date", 100),
        base44.auth.me()
      ]);
      setRoles(rolesData);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setIsLoading(false);
  };

  const handleRoleChange = (role) => {
    const defaults = ROLE_DEFAULTS[role] || {};
    setFormData(prev => ({
      ...prev,
      role,
      ...defaults
    }));
  };

  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSave = async () => {
    if (!formData.user_email) return;

    try {
      if (editingId) {
        await base44.entities.UserRole.update(editingId, formData);
      } else {
        // Check if role already exists for this user
        const existing = roles.find(r => r.user_email === formData.user_email);
        if (existing) {
          await base44.entities.UserRole.update(existing.id, formData);
        } else {
          await base44.entities.UserRole.create(formData);
        }
      }
      await fetchData();
      resetForm();
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this user's role?")) return;
    try {
      await base44.entities.UserRole.delete(id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const handleEdit = (role) => {
    setFormData(role);
    setEditingId(role.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      user_email: "",
      role: "viewer",
      can_create_content: false,
      can_edit_content: false,
      can_delete_content: false,
      can_publish_content: false,
      can_view_analytics: true,
      can_manage_users: false,
      can_manage_brands: false,
      can_manage_products: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-8 text-center">
        <Shield className="w-12 h-12 mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400">Only administrators can manage user roles</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          User Roles & Permissions
        </h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit User Role" : "Add User Role"}
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={formData.user_email}
                onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                disabled={!!editingId}
                className="bg-gray-900 border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                {ROLES[formData.role]?.description}
              </p>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h4 className="font-medium mb-4">Custom Permissions</h4>
              <div className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([group, { label, permissions }]) => (
                  <div key={group}>
                    <p className="text-sm text-gray-400 mb-3">{label}</p>
                    <div className="space-y-2 ml-2">
                      {permissions.map(perm => (
                        <div key={perm} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData[perm]}
                            onCheckedChange={() => togglePermission(perm)}
                          />
                          <label className="text-sm cursor-pointer">
                            {perm.replace(/can_|_/g, (m) => m === "_" ? " " : "").replace(/^./, str => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingId ? "Update" : "Add"} User
              </Button>
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {roles.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No users assigned</h3>
          <p className="text-gray-400">Add your first team member to get started</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {roles.map(role => (
            <Card key={role.id} className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{role.user_email}</h3>
                    <Badge className={ROLES[role.role]?.color}>
                      {ROLES[role.role]?.label || role.role}
                    </Badge>
                    {!role.is_active && (
                      <Badge variant="outline" className="text-xs">Inactive</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {Object.entries(PERMISSION_GROUPS).map(([group, { permissions }]) => {
                      const activePerms = permissions.filter(p => role[p]).length;
                      return (
                        <div key={group} className="text-xs">
                          <p className="text-gray-400">{PERMISSION_GROUPS[group].label}</p>
                          <p className="font-medium">
                            {activePerms} of {permissions.length}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(role)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(role.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}