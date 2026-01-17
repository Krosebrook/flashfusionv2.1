import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Smart Nudge Generation
 * Analyzes user profile, activation state, and behavioral signals
 * Generates contextual nudges to guide toward first moment of value
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile and activation state
    const profiles = await base44.entities.UserProfile.filter({
      created_by: user.email
    });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ nudges: [] });
    }

    const state = profile.activation_state || {};
    const signals = state.behavioral_signals || {};
    const dismissed = state.dismissed_nudges || [];
    const path = state.activated_path || 'balanced';
    const daysSinceOnboarding = Math.floor(
      (new Date() - new Date(profile.created_date)) / (1000 * 60 * 60 * 24)
    );

    const nudges = [];

    // ===== TIER 1: IMMEDIATE (Session 1) =====

    // Deal-First Path
    if (path === 'deal_first' && !dismissed.includes('deal_first_view')) {
      nudges.push({
        nudge_id: 'deal_first_view',
        tier: 'immediate',
        category: 'first_engagement',
        title: 'Your first deal is ready',
        body: `${profile.deal_sourcing_criteria?.target_industries?.join(', ') || 'Investment'} opportunities matching your criteria await.`,
        cta: 'View Deals',
        cta_url: '/deal-sourcer?sort=relevance',
        surface: 'inline_card',
        priority: 'high',
        trigger_condition: 'path === "deal_first"',
        timing: 'immediate'
      });
    }

    // Portfolio-First Path
    if (path === 'portfolio_first' && !dismissed.includes('portfolio_quick_setup')) {
      nudges.push({
        nudge_id: 'portfolio_quick_setup',
        tier: 'immediate',
        category: 'first_engagement',
        title: 'Set your first goal',
        body: 'Link your ${profile.portfolio_goals?.target_annual_return || "15"}% target to real opportunities.',
        cta: 'Create Goal',
        cta_url: '/portfolio?modal=create_goal',
        surface: 'inline_card',
        priority: 'high',
        trigger_condition: 'path === "portfolio_first"',
        timing: 'immediate'
      });
    }

    // Community-First Path
    if (path === 'community_first' && !dismissed.includes('community_first_view')) {
      const industries = profile.deal_sourcing_criteria?.target_industries?.[0] || 'your sector';
      nudges.push({
        nudge_id: 'community_first_view',
        tier: 'immediate',
        category: 'first_engagement',
        title: `Meet peers in ${industries}`,
        body: '200+ investors in your space — exclusive deal flow, monthly sessions.',
        cta: 'Explore Communities',
        cta_url: '/community',
        surface: 'inline_card',
        priority: 'high',
        trigger_condition: 'path === "community_first"',
        timing: 'immediate'
      });
    }

    // ===== TIER 2: ENGAGEMENT GAPS (Day 2-3) =====

    if (daysSinceOnboarding >= 2) {
      // Viewed deals but not saved
      if (
        signals.deals_viewed > 0 &&
        signals.deals_saved === 0 &&
        !dismissed.includes('save_first_deal')
      ) {
        nudges.push({
          nudge_id: 'save_first_deal',
          tier: 'engagement_gap',
          category: 'conversion',
          title: 'Save a deal to improve recommendations',
          body: 'Saved deals build a smarter feed just for you.',
          cta: 'Go to Deals',
          cta_url: '/deal-sourcer',
          surface: 'toast',
          priority: 'medium',
          trigger_condition: 'deals_viewed > 0 AND deals_saved === 0'
        });
      }

      // Portfolio goal viewed but not created
      if (
        state.activation_milestones?.portfolio_goal_created?.achieved === false &&
        signals.portfolio_interactions > 0 &&
        !dismissed.includes('create_first_goal')
      ) {
        nudges.push({
          nudge_id: 'create_first_goal',
          tier: 'engagement_gap',
          category: 'conversion',
          title: 'Your 5-year projection',
          body: `Target: ${profile.portfolio_goals?.target_annual_return}% → Requires ${Math.ceil(profile.portfolio_goals?.target_annual_return / 3)} deals/year`,
          cta: 'Create Goal',
          cta_url: '/portfolio?modal=create_goal',
          surface: 'card',
          priority: 'medium'
        });
      }

      // Viewed community but not joined
      if (
        signals.communities_viewed > 0 &&
        signals.communities_joined === 0 &&
        !dismissed.includes('join_first_community')
      ) {
        nudges.push({
          nudge_id: 'join_first_community',
          tier: 'engagement_gap',
          category: 'conversion',
          title: 'Get exclusive deal syndications',
          body: 'Members see 5-10 co-investment opportunities monthly.',
          cta: 'Browse Groups',
          cta_url: '/community',
          surface: 'toast',
          priority: 'medium'
        });
      }
    }

    // ===== TIER 3: INACTIVITY (Day 5+) =====

    if (daysSinceOnboarding >= 5) {
      // No deal saves
      if (
        signals.deals_saved === 0 &&
        !dismissed.includes('help_finding_deals')
      ) {
        const industry = profile.deal_sourcing_criteria?.target_industries?.[0] || 'your sector';
        nudges.push({
          nudge_id: 'help_finding_deals',
          tier: 'inactivity',
          category: 'reengagement',
          title: `Want help finding deals in ${industry}?`,
          body: 'Our AI can surface top matches based on your criteria.',
          cta: 'Get Recommendations',
          cta_url: '/deal-sourcer?ai_filter=true',
          surface: 'toast',
          priority: 'medium',
          trigger_condition: 'deals_saved === 0 after 5+ days'
        });
      }

      // No portfolio setup
      if (
        state.activation_milestones?.portfolio_goal_created?.achieved === false &&
        !dismissed.includes('portfolio_unlocks_insights')
      ) {
        nudges.push({
          nudge_id: 'portfolio_unlocks_insights',
          tier: 'inactivity',
          category: 'reengagement',
          title: 'Portfolio insights unlock with one goal',
          body: 'Set your target return and see which deals align.',
          cta: 'Create Goal',
          cta_url: '/portfolio?modal=create_goal',
          surface: 'banner',
          priority: 'low'
        });
      }

      // No community action
      if (
        signals.communities_joined === 0 &&
        !dismissed.includes('follow_expert')
      ) {
        nudges.push({
          nudge_id: 'follow_expert',
          tier: 'inactivity',
          category: 'reengagement',
          title: 'Follow deal experts in your sector',
          body: 'See real-time investment decisions from top investors.',
          cta: 'Discover Experts',
          cta_url: '/community?tab=experts',
          surface: 'toast',
          priority: 'low'
        });
      }
    }

    // ===== TIER 4: CROSS-PATH NUDGES (Day 7+) =====

    if (daysSinceOnboarding >= 7) {
      // Portfolio-First who hasn't viewed deals
      if (
        path === 'portfolio_first' &&
        signals.deals_viewed === 0 &&
        !dismissed.includes('deals_map_to_goals')
      ) {
        nudges.push({
          nudge_id: 'deals_map_to_goals',
          tier: 'cross_path',
          category: 'activation',
          title: 'Deals matching your return goal',
          body: 'We found ${count} opportunities aligned with your portfolio strategy.',
          cta: 'Explore Deals',
          cta_url: '/deal-sourcer?portfolio_aligned=true',
          surface: 'email_and_in_app',
          priority: 'high'
        });
      }

      // Deal-First who hasn't set goals
      if (
        path === 'deal_first' &&
        state.activation_milestones?.portfolio_goal_created?.achieved === false &&
        signals.deals_saved > 0 &&
        !dismissed.includes('analyze_deal_impact')
      ) {
        nudges.push({
          nudge_id: 'analyze_deal_impact',
          tier: 'cross_path',
          category: 'activation',
          title: 'Analyze saved deals vs. your portfolio',
          body: 'See how your watchlist impacts your long-term returns.',
          cta: 'View Impact',
          cta_url: '/analytics?source=saved_deals',
          surface: 'card',
          priority: 'medium'
        });
      }
    }

    // Store nudges in database
    for (const nudge of nudges) {
      try {
        await base44.entities.ActivationNudge.create({
          ...nudge,
          status: 'active',
          shown_at: new Date().toISOString(),
          shown_count: 1,
          created_by: user.email
        });
      } catch (e) {
        console.error('Failed to save nudge:', e);
      }
    }

    return Response.json({
      success: true,
      path,
      day: daysSinceOnboarding,
      nudges_generated: nudges.length,
      nudges
    });
  } catch (error) {
    console.error('Nudge generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});