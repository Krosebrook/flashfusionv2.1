import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check if default roles already exist
    const existingRoles = await base44.asServiceRole.entities.Role.list();
    if (existingRoles.length > 0) {
      return Response.json({ 
        message: 'Default roles already exist',
        roles: existingRoles 
      });
    }

    // Define default roles
    const defaultRoles = [
      {
        name: 'Analyst',
        description: 'Can view analytics, deals, and reports but cannot edit or create',
        is_system_role: false,
        permissions: {
          generators: {
            universal_generator: false,
            feature_generator: false,
            prd_generator: false,
            brandkit_generator: false,
            content_creator: false
          },
          business_intelligence: {
            deal_sourcer: true,
            view_deals: true,
            edit_deals: false,
            delete_deals: false,
            analytics: true,
            advanced_analytics: true
          },
          ecommerce: {
            view_products: true,
            create_products: false,
            edit_products: false,
            delete_products: false,
            publish_products: false,
            manage_inventory: false
          },
          content: {
            view_content: true,
            create_content: false,
            edit_content: false,
            delete_content: false,
            schedule_content: false,
            publish_content: false
          },
          collaboration: {
            view_projects: true,
            create_projects: false,
            edit_projects: false,
            delete_projects: false,
            share_projects: false,
            manage_team: false
          },
          workflows: {
            view_workflows: true,
            create_workflows: false,
            edit_workflows: false,
            delete_workflows: false,
            execute_workflows: false
          },
          integrations: {
            view_integrations: true,
            connect_integrations: false,
            manage_integrations: false,
            view_sync_logs: true
          },
          admin: {
            manage_roles: false,
            manage_users: false,
            view_billing: false,
            manage_billing: false,
            view_usage_logs: true,
            system_settings: false
          }
        },
        resource_limits: {
          max_projects: 0,
          max_content_pieces: 0,
          max_products: 0,
          max_workflows: 0,
          max_team_members: 0
        },
        is_active: true
      },
      {
        name: 'Contributor',
        description: 'Can create and edit content, products, and workflows but cannot delete or manage team',
        is_system_role: false,
        permissions: {
          generators: {
            universal_generator: true,
            feature_generator: true,
            prd_generator: true,
            brandkit_generator: true,
            content_creator: true
          },
          business_intelligence: {
            deal_sourcer: true,
            view_deals: true,
            edit_deals: true,
            delete_deals: false,
            analytics: true,
            advanced_analytics: false
          },
          ecommerce: {
            view_products: true,
            create_products: true,
            edit_products: true,
            delete_products: false,
            publish_products: false,
            manage_inventory: true
          },
          content: {
            view_content: true,
            create_content: true,
            edit_content: true,
            delete_content: false,
            schedule_content: true,
            publish_content: false
          },
          collaboration: {
            view_projects: true,
            create_projects: true,
            edit_projects: true,
            delete_projects: false,
            share_projects: true,
            manage_team: false
          },
          workflows: {
            view_workflows: true,
            create_workflows: true,
            edit_workflows: true,
            delete_workflows: false,
            execute_workflows: true
          },
          integrations: {
            view_integrations: true,
            connect_integrations: true,
            manage_integrations: false,
            view_sync_logs: true
          },
          admin: {
            manage_roles: false,
            manage_users: false,
            view_billing: false,
            manage_billing: false,
            view_usage_logs: false,
            system_settings: false
          }
        },
        resource_limits: {
          max_projects: 50,
          max_content_pieces: 200,
          max_products: 100,
          max_workflows: 20,
          max_team_members: 5
        },
        is_active: true
      },
      {
        name: 'Viewer',
        description: 'Read-only access to all features',
        is_system_role: false,
        permissions: {
          generators: {
            universal_generator: false,
            feature_generator: false,
            prd_generator: false,
            brandkit_generator: false,
            content_creator: false
          },
          business_intelligence: {
            deal_sourcer: false,
            view_deals: true,
            edit_deals: false,
            delete_deals: false,
            analytics: true,
            advanced_analytics: false
          },
          ecommerce: {
            view_products: true,
            create_products: false,
            edit_products: false,
            delete_products: false,
            publish_products: false,
            manage_inventory: false
          },
          content: {
            view_content: true,
            create_content: false,
            edit_content: false,
            delete_content: false,
            schedule_content: false,
            publish_content: false
          },
          collaboration: {
            view_projects: true,
            create_projects: false,
            edit_projects: false,
            delete_projects: false,
            share_projects: false,
            manage_team: false
          },
          workflows: {
            view_workflows: true,
            create_workflows: false,
            edit_workflows: false,
            delete_workflows: false,
            execute_workflows: false
          },
          integrations: {
            view_integrations: true,
            connect_integrations: false,
            manage_integrations: false,
            view_sync_logs: true
          },
          admin: {
            manage_roles: false,
            manage_users: false,
            view_billing: false,
            manage_billing: false,
            view_usage_logs: false,
            system_settings: false
          }
        },
        resource_limits: {
          max_projects: 0,
          max_content_pieces: 0,
          max_products: 0,
          max_workflows: 0,
          max_team_members: 0
        },
        is_active: true
      }
    ];

    // Create default roles
    const createdRoles = await Promise.all(
      defaultRoles.map(role => base44.asServiceRole.entities.Role.create(role))
    );

    return Response.json({
      success: true,
      message: 'Default roles created successfully',
      roles: createdRoles
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});