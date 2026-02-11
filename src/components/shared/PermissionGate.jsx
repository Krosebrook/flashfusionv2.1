import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield } from 'lucide-react';

/**
 * PermissionGate - A component that conditionally renders children based on user permissions
 * 
 * Usage:
 * <PermissionGate permission="generators.universal_generator">
 *   <Button>Generate App</Button>
 * </PermissionGate>
 * 
 * <PermissionGate anyOf={["content.create_content", "content.edit_content"]}>
 *   <ContentEditor />
 * </PermissionGate>
 * 
 * <PermissionGate allOf={["admin.manage_users", "admin.manage_roles"]}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export default function PermissionGate({ 
  permission, 
  anyOf, 
  allOf, 
  children, 
  fallback = null 
}) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [permission, anyOf, allOf]);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Admin users have all permissions
      if (user.role === 'admin') {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      // Get user's assigned roles
      const userRoles = await base44.entities.UserRole.filter({ user_email: user.email });
      if (userRoles.length === 0) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      // Fetch role details
      const roleIds = userRoles.map(ur => ur.role_id);
      const roles = await Promise.all(
        roleIds.map(id => base44.entities.Role.filter({ id }))
      );
      const activeRoles = roles.flat().filter(r => r.is_active);

      // Check single permission
      if (permission) {
        const [category, perm] = permission.split('.');
        const allowed = activeRoles.some(
          role => role.permissions?.[category]?.[perm] === true
        );
        setHasPermission(allowed);
      }

      // Check anyOf permissions (OR logic)
      if (anyOf && Array.isArray(anyOf)) {
        const allowed = anyOf.some(permString => {
          const [category, perm] = permString.split('.');
          return activeRoles.some(
            role => role.permissions?.[category]?.[perm] === true
          );
        });
        setHasPermission(allowed);
      }

      // Check allOf permissions (AND logic)
      if (allOf && Array.isArray(allOf)) {
        const allowed = allOf.every(permString => {
          const [category, perm] = permString.split('.');
          return activeRoles.some(
            role => role.permissions?.[category]?.[perm] === true
          );
        });
        setHasPermission(allowed);
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setHasPermission(false);
    }
    setLoading(false);
  };

  if (loading) {
    return fallback;
  }

  if (!hasPermission) {
    return fallback || (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
        <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">You don't have permission to access this feature</p>
      </div>
    );
  }

  return <>{children}</>;
}