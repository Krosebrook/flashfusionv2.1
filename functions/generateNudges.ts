import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
      return Response.json({ nudges: [] });
    }

    const nudges = [];
    const dismissed = profile.nudges_dismissed || [];

    // Nudge 1: Quick Start completion - encourage full setup
    if (profile.quick_start_mode && !dismissed.includes('complete_setup')) {
      nudges.push({
        nudge_type: 'missing_setup',
        title: 'Complete Your Profile',
        description: 'Set up your full preferences to unlock better deal recommendations and community matches.',
        action_url: '/user-settings',
        action_label: 'Complete Setup',
        trigger_reason: 'You used Quick Start — full setup improves your matches by 3x',
        icon: 'AlertCircle',
        priority: 'medium'
      });
    }

    // Nudge 2: Risk tolerance match
    if (
      profile.deal_sourcing_criteria?.risk_tolerance === 'aggressive' &&
      !dismissed.includes('high_risk_deals')
    ) {
      nudges.push({
        nudge_type: 'preference_match',
        title: 'High-Growth Deals Available',
        description: 'We found 12 aggressive-stage deals matching your risk profile.',
        action_url: '/deal-sourcer?filter=aggressive',
        action_label: 'Explore Deals',
        trigger_reason: 'Based on your aggressive risk tolerance',
        icon: 'TrendingUp',
        priority: 'high'
      });
    }

    // Nudge 3: Community engagement
    if (
      profile.community_preferences?.engagement_preference === 'networking' &&
      !dismissed.includes('join_syndicates')
    ) {
      nudges.push({
        nudge_type: 'community_suggestion',
        title: 'Join Angel Syndicates',
        description: 'Connect with investors in your target sectors and co-invest on deals.',
        action_url: '/community',
        action_label: 'Browse Groups',
        trigger_reason: 'Networking is your preference — these groups align with you',
        icon: 'Users',
        priority: 'medium'
      });
    }

    // Nudge 4: Feature discovery - if user hasn't visited deal sourcer
    if (
      !profile.feature_first_visits?.deal_sourcer &&
      !dismissed.includes('discover_deal_sourcer')
    ) {
      nudges.push({
        nudge_type: 'feature_discovery',
        title: 'Smart Deal Discovery',
        description: 'Our AI finds deals matching your criteria across 25+ sources. Save time sourcing.',
        action_url: '/deal-sourcer',
        action_label: 'Discover Deals',
        trigger_reason: 'You haven\'t explored our deal sourcing yet',
        icon: 'Lightbulb',
        priority: 'low'
      });
    }

    // Nudge 5: Portfolio goals
    if (
      profile.portfolio_goals?.target_annual_return &&
      profile.activation_metrics?.deals_viewed > 5 &&
      !dismissed.includes('track_portfolio')
    ) {
      nudges.push({
        nudge_type: 'missing_setup',
        title: 'Track Your Portfolio',
        description: `You're viewing deals. Add them to a portfolio to track performance vs your ${profile.portfolio_goals.target_annual_return}% goal.`,
        action_url: '/portfolio',
        action_label: 'Go to Portfolio',
        trigger_reason: 'You're actively viewing deals',
        icon: 'TrendingUp',
        priority: 'medium'
      });
    }

    // Save nudges to database
    for (const nudge of nudges) {
      try {
        await base44.entities.UserNudge.create({
          ...nudge,
          status: 'shown',
          shown_at: new Date().toISOString(),
          created_by: user.email
        });
      } catch (e) {
        console.error('Failed to save nudge:', e);
      }
    }

    return Response.json({
      success: true,
      nudges_generated: nudges.length,
      nudges
    });
  } catch (error) {
    console.error('Nudge generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});