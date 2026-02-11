import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Check if the current user has a specific permission
 * 
 * Payload:
 * {
 *   permission: "generators.universal_generator",
 *   anyOf: ["content.create_content", "content.edit_content"],
 *   allOf: ["admin.manage_users", "admin.manage_roles"]
 * }
 * 
 * Returns:
 * {
 *   allowed: boolean,
 *   user_roles: [...],
 *   reason: string
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        allowed: false,
        reason: 'User not authenticated' 
      }, { status: 401 });
    }

    const { permission, anyOf, allOf } = await req.json();

    // Admin users have all permissions
    if (user.role === 'admin') {
      return Response.json({
        allowed: true,
        user_roles: ['admin'],
        reason: 'Admin user has full access'
      });
    }

    // Get user's assigned roles
    const userRoles = await base44.asServiceRole.entities.UserRole.filter({ 
      user_email: user.email 
    });

    if (userRoles.length === 0) {
      return Response.json({
        allowed: false,
        user_roles: [],
        reason: 'No roles assigned to user'
      });
    }

    // Fetch role details
    const roleIds = userRoles.map(ur => ur.role_id);
    const roles = await Promise.all(
      roleIds.map(id => base44.asServiceRole.entities.Role.filter({ id }))
    );
    const activeRoles = roles.flat().filter(r => r.is_active);

    if (activeRoles.length === 0) {
      return Response.json({
        allowed: false,
        user_roles: [],
        reason: 'All assigned roles are inactive'
      });
    }

    let allowed = false;

    // Check single permission
    if (permission) {
      const [category, perm] = permission.split('.');
      allowed = activeRoles.some(
        role => role.permissions?.[category]?.[perm] === true
      );
    }

    // Check anyOf permissions (OR logic)
    if (anyOf && Array.isArray(anyOf)) {
      allowed = anyOf.some(permString => {
        const [category, perm] = permString.split('.');
        return activeRoles.some(
          role => role.permissions?.[category]?.[perm] === true
        );
      });
    }

    // Check allOf permissions (AND logic)
    if (allOf && Array.isArray(allOf)) {
      allowed = allOf.every(permString => {
        const [category, perm] = permString.split('.');
        return activeRoles.some(
          role => role.permissions?.[category]?.[perm] === true
        );
      });
    }

    return Response.json({
      allowed,
      user_roles: activeRoles.map(r => ({ id: r.id, name: r.name })),
      reason: allowed 
        ? 'Permission granted based on assigned roles' 
        : 'Permission denied - insufficient privileges'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});