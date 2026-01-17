import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Initialize retention state for a user at onboarding completion.
 * Creates the foundation for 30-day habit tracking and re-engagement logic.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await base44.entities.UserProfile.filter({
      created_by: user.email
    });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Determine initial phase based on activation
    const retentionState = {
      phase: 'phase_1',
      days_since_activation: 0,
      activated_at: new Date().toISOString(),
      active_habit_loops: {
        discovery: {
          active: profile.activation_state?.activated_path === 'deal_first' || profile.activation_state?.activated_path === 'balanced',
          triggered_count: 0,
          last_triggered_at: null,
          actions_taken: 0
        },
        insight: {
          active: profile.activation_state?.activated_path === 'portfolio_first' || profile.activation_state?.activated_path === 'balanced',
          triggered_count: 0,
          last_triggered_at: null,
          insights_generated: 0
        },
        social: {
          active: profile.activation_state?.activated_path === 'community_first' || profile.activation_state?.activated_path === 'balanced',
          triggered_count: 0,
          last_triggered_at: null,
          joins: 0,
          follows: 0
        }
      },
      weekly_engagement: {
        visits_this_week: 1,
        streak_weeks: 1,
        total_compounding_actions: profile.activation_state?.behavioral_signals?.deals_saved || 0,
        last_visit_at: new Date().toISOString()
      },
      digest_preferences: {
        opted_in: false,
        frequency: 'weekly',
        preferred_day: 'monday',
        preferred_time_utc: '09:00',
        last_sent_at: null
      },
      reengagement_tracking: {
        last_active_at: new Date().toISOString(),
        inactivity_tier: 0,
        reengage_messages_sent: 0,
        last_reengagement_at: null,
        suppressed_until: null
      },
      personalization_signals: {
        preferences_refined_count: 0,
        feedback_provided: false,
        auto_adjustments: [],
        preference_version: 1
      }
    };

    // Update profile with retention state
    await base44.entities.UserProfile.update(profile.id, {
      retention_state: retentionState
    });

    return Response.json({
      success: true,
      retention_state: retentionState,
      message: 'Retention state initialized for 30-day tracking'
    });
  } catch (error) {
    console.error('Retention initialization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});