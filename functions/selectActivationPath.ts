import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Path Selection Algorithm
 * Run once at onboarding completion, then daily if not yet activated
 * 
 * Output: Selects one of:
 * - "deal_first": Strong sourcing preferences (≥3 industries, specific sizes)
 * - "portfolio_first": Clear goals (ROI ≥15% OR long-term horizon)
 * - "community_first": Networking preference OR ≥2 peer group interests
 * - "balanced": Default (rotate through all three guides)
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const profiles = await base44.entities.UserProfile.filter({
      created_by: user.email
    });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    let selectedPath = 'balanced';
    let reason = '';

    // Quick Start mode → Light Touch (minimal guidance, high agency)
    if (profile.quick_start_mode === true) {
      selectedPath = 'light_touch';
      reason = 'Quick Start mode - prefer high autonomy';
    }
    // Deal-First: Strong deal sourcing criteria
    else if (
      profile.deal_sourcing_criteria?.target_industries?.length >= 3 &&
      profile.deal_sourcing_criteria?.investment_size_min != null
    ) {
      selectedPath = 'deal_first';
      reason = `${profile.deal_sourcing_criteria.target_industries.length} industries defined + investment size range set`;
    }
    // Portfolio-First: Clear goals, returns-focused
    else if (
      profile.portfolio_goals?.target_annual_return >= 15 ||
      profile.portfolio_goals?.time_horizon === 'long_term'
    ) {
      selectedPath = 'portfolio_first';
      reason = `Return target ${profile.portfolio_goals.target_annual_return}% or long-term horizon`;
    }
    // Community-First: Networking preference
    else if (
      profile.community_preferences?.engagement_preference === 'networking' ||
      profile.community_preferences?.peer_group_interests?.length >= 2
    ) {
      selectedPath = 'community_first';
      reason = `${profile.community_preferences.engagement_preference} preference or ${profile.community_preferences.peer_group_interests?.length} interests`;
    }

    // Initialize activation state if not present
    const activationState = profile.activation_state || {
      activated: false,
      activation_date: null,
      activated_path: selectedPath,
      activation_milestones: {
        first_deal_viewed: { achieved: false },
        first_deal_saved: { achieved: false },
        portfolio_goal_created: { achieved: false },
        community_joined: { achieved: false }
      },
      active_nudges: [],
      dismissed_nudges: [],
      guidance_surfaces_shown: {
        inline_cards: 0,
        tooltips: 0,
        spotlights: 0,
        toasts: 0
      },
      behavioral_signals: {
        session_count: 0,
        deals_viewed: 0,
        deals_saved: 0,
        communities_viewed: 0,
        communities_joined: 0,
        portfolio_interactions: 0,
        time_in_app_minutes: 0
      }
    };

    // Update profile with selected path
    await base44.entities.UserProfile.update(profile.id, {
      activation_state: {
        ...activationState,
        activated_path: selectedPath
      }
    });

    return Response.json({
      success: true,
      selected_path: selectedPath,
      reason,
      activation_state: activationState
    });
  } catch (error) {
    console.error('Path selection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});