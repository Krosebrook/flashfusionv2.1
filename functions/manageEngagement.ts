import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Unified engagement management function
 * Handles: activation, retention, habit loops, re-engagement in one place
 * 
 * Action types: activate, trigger_loop, check_reengagement, update_digest
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { action, context } = body;

  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    let result = {};

    switch (action) {
      case 'initialize':
        result = initializeEngagement(profile);
        break;
      case 'trigger_loop':
        result = triggerHabitLoop(profile, context);
        break;
      case 'check_milestone':
        result = checkMilestone(profile, context);
        break;
      case 'check_reengagement':
        result = checkReengagement(profile);
        break;
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Update profile with changes
    if (result.engagement_state) {
      await base44.entities.UserProfile.update(profile.id, {
        engagement_state: result.engagement_state
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Engagement management error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function initializeEngagement(profile) {
  const engagement_state = {
    stage: 'onboarded',
    activation_path: profile.activation_state?.activated_path || 'balanced',
    milestones: {
      first_deal_viewed: false,
      first_deal_saved: false,
      portfolio_goal_created: false,
      community_joined: false,
      weekly_return_visit: false
    },
    habit_loops: {
      discovery: { active: true, triggered_count: 0, actions_taken: 0 },
      insight: { active: false, triggered_count: 0, insights_generated: 0 },
      social: { active: false, triggered_count: 0, joins: 0, follows: 0 }
    },
    weekly_engagement: {
      visits_this_week: 1,
      streak_weeks: 1,
      total_compounding_actions: 0,
      last_visit_at: new Date().toISOString()
    },
    digest: {
      opted_in: false,
      frequency: 'weekly',
      preferred_day: 'monday',
      preferred_time_utc: '09:00',
      last_sent_at: null
    },
    reengagement: {
      last_active_at: new Date().toISOString(),
      inactivity_tier: 0,
      messages_sent: 0,
      suppressed_until: null
    },
    personalization: {
      preferences_refined_count: 0,
      auto_adjustments: [],
      preference_version: 1
    }
  };

  return { engagement_state, success: true };
}

function triggerHabitLoop(profile, context) {
  const { loop_type, action } = context;
  const state = profile.engagement_state || {};
  const loop = state.habit_loops?.[loop_type];

  if (!loop) return { error: 'Loop not found' };

  loop.triggered_count = (loop.triggered_count || 0) + 1;
  loop.last_triggered_at = new Date().toISOString();

  if (['save', 'view', 'dismiss'].includes(action)) {
    loop.actions_taken = (loop.actions_taken || 0) + 1;
  }

  return {
    engagement_state: state,
    loop_triggered: loop_type,
    guidance: generateLoopGuidance(profile, loop_type, action)
  };
}

function checkMilestone(profile, context) {
  const { milestone_type } = context;
  const state = profile.engagement_state || {};

  if (state.milestones?.[milestone_type]) {
    return { already_achieved: true };
  }

  state.milestones[milestone_type] = true;

  // Check if activated (≥1 milestone achieved)
  const achieved = Object.values(state.milestones).filter(Boolean).length;
  if (achieved >= 1 && state.stage === 'onboarded') {
    state.stage = 'activated';
    state.activated_at = new Date().toISOString();
  }

  return { engagement_state: state, milestone_achieved: milestone_type };
}

function checkReengagement(profile) {
  const state = profile.engagement_state || {};
  const lastActive = new Date(state.reengagement?.last_active_at || profile.updated_date);
  const now = new Date();
  const daysSinceActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

  if (daysSinceActive <= 1) return { reengagement_needed: false };

  const tier = daysSinceActive >= 14 ? 3 : daysSinceActive >= 7 ? 2 : daysSinceActive >= 3 ? 1 : 0;

  if (tier > 0) {
    state.reengagement.inactivity_tier = tier;
    state.reengagement.messages_sent = (state.reengagement.messages_sent || 0) + 1;
    state.reengagement.last_message_at = now.toISOString();
    state.reengagement.suppressed_until = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
  }

  return { engagement_state: state, reengagement_tier: tier, days_inactive: daysSinceActive };
}

function generateLoopGuidance(profile, loopType, action) {
  const templates = {
    discovery: {
      save: { title: 'Deal Added', body: 'Your feed just got smarter.' },
      view: { title: 'Why This Matches', body: 'Based on your criteria.' }
    },
    insight: {
      view_analytics: { title: 'You\'re on Track', body: 'Projected ROI looking good.' }
    },
    social: {
      join: { title: 'Welcome!', body: 'See what peers are discussing.' },
      follow: { title: 'Following Expert', body: 'Their posts in your feed.' }
    }
  };

  return templates[loopType]?.[action] || null;
}