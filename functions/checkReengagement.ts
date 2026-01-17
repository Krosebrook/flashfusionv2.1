import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Intelligent re-engagement engine.
 * Detects inactivity and generates value-first re-engagement messages.
 * 
 * Should run on a daily automation to check all users for re-engagement triggers.
 * Only generates nudges; delivery is handled separately by email/notification system.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { check_all_users } = body;

  try {
    let profiles = [];

    if (check_all_users) {
      // For scheduled automation: check all users
      profiles = await base44.entities.UserProfile.list('-updated_date', 1000);
    } else {
      // For direct call: check current user
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      profiles = await base44.entities.UserProfile.filter({
        created_by: user.email
      });
    }

    const reengagementMessages = [];

    for (const profile of profiles) {
      const state = profile.retention_state || {};
      const signals = profile.activation_state?.behavioral_signals || {};
      const lastActive = new Date(state.reengagement_tracking?.last_active_at || profile.updated_date);
      const now = new Date();
      const daysSinceActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

      // Skip if user is actively using the app
      if (daysSinceActive <= 1) continue;

      // Skip if suppressed (cooldown)
      const suppressedUntil = state.reengagement_tracking?.suppressed_until;
      if (suppressedUntil && new Date(suppressedUntil) > now) continue;

      // Determine tier and generate message
      let message = null;

      if (daysSinceActive >= 3 && daysSinceActive < 7) {
        message = generateTier1Reengagement(profile, signals);
      } else if (daysSinceActive >= 7 && daysSinceActive < 14) {
        message = generateTier2Reengagement(profile, signals);
      } else if (daysSinceActive >= 14) {
        message = generateTier3Reengagement(profile, signals);
      }

      if (message) {
        message.user_id = profile.id;
        message.user_email = profile.created_by;
        message.inactivity_days = daysSinceActive;
        reengagementMessages.push(message);

        // Update profile with reengagement message sent
        try {
          await base44.entities.UserProfile.update(profile.id, {
            retention_state: {
              ...state,
              reengagement_tracking: {
                ...state.reengagement_tracking,
                reengage_messages_sent: (state.reengagement_tracking?.reengage_messages_sent || 0) + 1,
                last_reengagement_at: now.toISOString(),
                suppressed_until: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString() // 48h cooldown
              }
            }
          });
        } catch (e) {
          console.error('Failed to update reengagement tracking:', e);
        }
      }
    }

    return Response.json({
      success: true,
      messages_generated: reengagementMessages.length,
      messages: reengagementMessages
    });
  } catch (error) {
    console.error('Re-engagement check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Tier 1: 3-6 days inactive
 * High-signal activity recency
 */
function generateTier1Reengagement(profile, signals) {
  const criteria = profile.deal_sourcing_criteria || {};
  const industries = criteria.target_industries || [];
  const recentCount = signals.deals_viewed || 0;

  if (recentCount > 0) {
    return {
      tier: 1,
      type: 'value_highlight',
      title: '[3 deals] moved this week matching your criteria',
      body: `In ${industries[0] || 'your sectors'}, we found opportunities you might have missed.`,
      cta: 'See This Week\'s Deals',
      cta_url: '/deal-sourcer?filter=new_this_week',
      surface: 'email_and_toast',
      priority: 'medium'
    };
  }

  return null;
}

/**
 * Tier 2: 7-13 days inactive
 * Tie to portfolio or expert activity
 */
function generateTier2Reengagement(profile, signals) {
  const goalRoi = profile.portfolio_goals?.target_annual_return || 15;

  return {
    tier: 2,
    type: 'portfolio_insight',
    title: 'Your portfolio is tracking well',
    body: `Current trajectory: +1.5% vs. your ${goalRoi}% annual goal. [Expert Name] just shared their risk management approach.`,
    cta: 'Watch the Expert Session',
    cta_url: '/community?tab=sessions',
    surface: 'email',
    priority: 'medium'
  };
}

/**
 * Tier 3: 14+ days inactive
 * Last-ditch effort with concrete opportunities
 */
function generateTier3Reengagement(profile, signals) {
  const primaryIndustry = profile.deal_sourcing_criteria?.target_industries?.[0] || 'Tech';
  const secondaryIndustry = profile.deal_sourcing_criteria?.target_industries?.[1] || 'FinTech';

  return {
    tier: 3,
    type: 'comprehensive_value',
    title: `We found 5 deals in ${primaryIndustry} + ${secondaryIndustry}`,
    body: `These match your investment profile. Plus: 2 experts to follow who focus on your sectors.`,
    cta: 'Explore Opportunities',
    cta_url: '/deal-sourcer?auto_filter=true',
    secondary_cta: 'Discover Experts',
    secondary_cta_url: '/community?tab=experts&filter=relevant',
    surface: 'email_and_in_app',
    priority: 'high'
  };
}