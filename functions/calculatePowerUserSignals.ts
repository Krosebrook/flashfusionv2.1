import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Calculate power-user signal scores based on engagement behavior.
 * Runs on a daily automation to update all users' signal profiles.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { user_email, calculate_all } = body;

  try {
    let profiles = [];

    if (calculate_all) {
      profiles = await base44.entities.UserProfile.list('-updated_date', 1000);
    } else {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    }

    const results = [];

    for (const profile of profiles) {
      const engagement = profile.engagement_state || {};
      const signals = calculateSignalScores(profile, engagement);

      // Check for tier unlocks
      const powerUserState = profile.power_user_state || {};
      const tiersUnlocked = checkTierUnlocks(signals, powerUserState.unlocked_tiers || {});

      // Update power user state
      const newPowerUserState = {
        signal_scores: signals,
        unlocked_tiers: tiersUnlocked,
        engagement_summary: {
          total_deals_saved: engagement.active_habit_loops?.discovery?.actions_taken || 0,
          total_comparisons: 0, // Would track from DealComparison events
          weekly_streak: engagement.weekly_engagement?.streak_weeks || 0,
          community_score: engagement.active_habit_loops?.social?.triggered_count || 0,
          portfolio_depth: engagement.active_habit_loops?.insight?.triggered_count || 0
        },
        monetization: powerUserState.monetization || {
          eligible_moments: [],
          shown_moments: [],
          converted_tiers: [],
          ltv_estimate: 0
        }
      };

      // Check for monetization eligibility
      newPowerUserState.monetization = checkMonetizationEligibility(signals, newPowerUserState.monetization);

      try {
        await base44.entities.UserProfile.update(profile.id, {
          power_user_state: newPowerUserState
        });
        results.push({ user: profile.created_by, signals, tiersUnlocked });
      } catch (e) {
        console.error(`Failed to update power user state for ${profile.created_by}:`, e);
      }
    }

    return Response.json({
      success: true,
      users_processed: results.length,
      results
    });
  } catch (error) {
    console.error('Signal calculation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateSignalScores(profile, engagement) {
  const habit_loops = engagement.active_habit_loops || {};

  // Deal Momentum: Saves + comparisons
  const dealMomentum = Math.min(100,
    (habit_loops.discovery?.actions_taken || 0) * 12 +
    (habit_loops.discovery?.triggered_count || 0) * 5
  );

  // Portfolio Engagement: Goals, analytics, scenarios
  const portfolioEngagement = Math.min(100,
    (habit_loops.insight?.triggered_count || 0) * 15 +
    (habit_loops.insight?.insights_generated || 0) * 10
  );

  // Social Presence: Joins, follows, engagement
  const socialPresence = Math.min(100,
    (habit_loops.social?.joins || 0) * 20 +
    (habit_loops.social?.follows || 0) * 15 +
    (habit_loops.social?.triggered_count || 0) * 5
  );

  // Retention Consistency: Weekly streak + activity consistency
  const weeklyEngagement = engagement.weekly_engagement || {};
  const retentionConsistency = Math.min(100,
    (weeklyEngagement.streak_weeks || 0) * 12 +
    (weeklyEngagement.visits_this_week || 0) * 25
  );

  return {
    deal_momentum: Math.round(dealMomentum),
    portfolio_engagement: Math.round(portfolioEngagement),
    social_presence: Math.round(socialPresence),
    retention_consistency: Math.round(retentionConsistency)
  };
}

function checkTierUnlocks(scores, currentTiers) {
  const unlocks = { ...currentTiers };

  // Tier 1: Deal momentum >= 50 OR portfolio >= 40
  if ((scores.deal_momentum >= 50 || scores.portfolio_engagement >= 40) && !unlocks.tier_1?.unlocked) {
    unlocks.tier_1 = {
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      trigger_signal: scores.deal_momentum > scores.portfolio_engagement ? 'deal_momentum' : 'portfolio_engagement',
      capabilities_enabled: ['deal_comparisons', 'saved_collections', 'strategy_fit_explanations', 'deal_alerts_limited']
    };
  }

  // Tier 2: Portfolio engagement >= 60 AND retention consistency >= 70
  if (scores.portfolio_engagement >= 60 && scores.retention_consistency >= 70 && !unlocks.tier_2?.unlocked) {
    unlocks.tier_2 = {
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      trigger_signal: 'portfolio_engagement',
      capabilities_enabled: ['scenario_modeling', 'goal_to_deal_mapping', 'performance_projections', 'portfolio_benchmarking']
    };
  }

  // Tier 3: Social presence >= 60 AND deal momentum >= 70
  if (scores.social_presence >= 60 && scores.deal_momentum >= 70 && !unlocks.tier_3?.unlocked) {
    unlocks.tier_3 = {
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      trigger_signal: 'social_presence',
      capabilities_enabled: ['expert_network_access', 'signal_boosting', 'private_community_access', 'notification_prioritization']
    };
  }

  return unlocks;
}

function checkMonetizationEligibility(scores, currentMonetization) {
  const eligible = [];
  const now = new Date().toISOString();

  // Eligible for unlimited comparisons if deal momentum >= 60
  if (scores.deal_momentum >= 60) {
    if (!eligible.includes('unlimited_comparisons')) {
      eligible.push('unlimited_comparisons');
    }
  }

  // Eligible for advanced modeling if portfolio engagement >= 70
  if (scores.portfolio_engagement >= 70) {
    if (!eligible.includes('advanced_modeling')) {
      eligible.push('advanced_modeling');
    }
  }

  // Eligible for syndicate access if social presence >= 70
  if (scores.social_presence >= 70) {
    if (!eligible.includes('syndicate_access')) {
      eligible.push('syndicate_access');
    }
  }

  return {
    ...currentMonetization,
    eligible_moments: eligible,
    ltv_estimate: estimateLTV(scores)
  };
}

function estimateLTV(scores) {
  // Simple LTV model based on signal strength
  let ltv = 0;

  if (scores.deal_momentum >= 50) ltv += 29; // Tier 1
  if (scores.portfolio_engagement >= 60) ltv += 49; // Tier 2
  if (scores.social_presence >= 70) ltv += 99; // Tier 3

  return ltv;
}