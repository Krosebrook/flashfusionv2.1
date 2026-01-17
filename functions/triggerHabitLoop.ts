import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Trigger a habit loop based on user action and context.
 * Handles: Discovery (deals), Insight (analytics), Social (community)
 * 
 * Called from:
 * - Frontend after deal save/view
 * - Frontend after portfolio update
 * - Frontend after community join/follow
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { loop_type, action, context } = body;

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

    const state = profile.retention_state || {};
    const loopData = state.active_habit_loops?.[loop_type] || {};

    // Generate loop-specific guidance based on action
    let guidance = null;

    if (loop_type === 'discovery') {
      guidance = generateDiscoveryGuidance(profile, action, context);
    } else if (loop_type === 'insight') {
      guidance = generateInsightGuidance(profile, action, context);
    } else if (loop_type === 'social') {
      guidance = generateSocialGuidance(profile, action, context);
    }

    // Update loop metrics
    loopData.triggered_count = (loopData.triggered_count || 0) + 1;
    loopData.last_triggered_at = new Date().toISOString();

    if (action === 'save' || action === 'view' || action === 'dismiss') {
      loopData.actions_taken = (loopData.actions_taken || 0) + 1;
    }

    // Update profile retention state
    await base44.entities.UserProfile.update(profile.id, {
      retention_state: {
        ...state,
        active_habit_loops: {
          ...state.active_habit_loops,
          [loop_type]: loopData
        },
        weekly_engagement: {
          ...state.weekly_engagement,
          last_visit_at: new Date().toISOString()
        }
      }
    });

    return Response.json({
      success: true,
      loop_type,
      action,
      guidance
    });
  } catch (error) {
    console.error('Habit loop trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Discovery Loop: Deal-centric guidance
 * Triggered: When user saves, views, or dismisses deals
 */
function generateDiscoveryGuidance(profile, action, context) {
  const criteria = profile.deal_sourcing_criteria || {};
  const industries = criteria.target_industries || [];

  if (action === 'save') {
    return {
      type: 'discovery_save_success',
      title: 'Deal Added to Watchlist',
      body: `Great! This deal matches your ${industries[0] || 'target'} criteria.`,
      next_action: 'Your feed just got smarter. Check out these similar opportunities.',
      cta: 'View Similar Deals',
      surface: 'toast'
    };
  } else if (action === 'view') {
    return {
      type: 'discovery_view_context',
      title: 'Why This Deal Matches You',
      body: `Industry: ${context?.industry || 'Tech'} | Size: $${context?.size || 'X'}M | Structure: ${context?.structure || 'Equity'}`,
      next_action: 'Save if interested or explore other deals.',
      surface: 'inline_explanation'
    };
  } else if (action === 'dismiss') {
    return {
      type: 'discovery_dismiss_feedback',
      body: 'Noted. We'll show you fewer deals like this.',
      surface: 'toast'
    };
  }

  return null;
}

/**
 * Insight Loop: Portfolio & analytics guidance
 * Triggered: When user views analytics or adjusts portfolio
 */
function generateInsightGuidance(profile, action, context) {
  const goals = profile.portfolio_goals || {};

  if (action === 'view_analytics') {
    return {
      type: 'insight_progress',
      title: 'You\'re on Track',
      body: `Projected ROI: ${context?.projected_roi || '+1.5'}% vs. goal of ${goals.target_annual_return || '15'}%`,
      next_action: 'These 3 deals would accelerate your target.',
      cta: 'Explore Aligned Deals',
      surface: 'card'
    };
  } else if (action === 'adjust_goal') {
    return {
      type: 'insight_goal_updated',
      title: 'Goal Updated',
      body: 'Your portfolio recommendations will adjust to match your new target.',
      surface: 'toast'
    };
  }

  return null;
}

/**
 * Social Proof Loop: Community engagement
 * Triggered: When user views, joins, or follows community members
 */
function generateSocialGuidance(profile, action, context) {
  if (action === 'join_community') {
    return {
      type: 'social_join_success',
      title: 'Welcome to the Community!',
      body: `You've joined [${context?.community_name || 'Group'}]. See what members are discussing.`,
      next_action: 'React to posts, bookmark deals, follow experts.',
      cta: 'Explore Discussions',
      surface: 'toast'
    };
  } else if (action === 'follow_expert') {
    return {
      type: 'social_follow_success',
      title: 'Following [Expert Name]',
      body: 'You\'ll see their posts and investment decisions in your feed.',
      surface: 'toast'
    };
  } else if (action === 'view_discussion') {
    return {
      type: 'social_discussion_hint',
      title: 'Join the Conversation',
      body: 'React to posts with your thoughts—boost credibility.',
      surface: 'inline_hint'
    };
  }

  return null;
}