import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Update lifecycle state based on engagement signals and churn risk.
 * Should run daily on all users to detect state transitions and interventions.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { check_all_users } = body;

  try {
    let profiles = [];

    if (check_all_users) {
      profiles = await base44.entities.UserProfile.list('-updated_date', 1000);
    } else {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    }

    const results = [];

    for (const profile of profiles) {
      const engagement = profile.engagement_state || {};
      const powerUser = profile.power_user_state || {};
      const lifecycle = profile.lifecycle_state || {};

      // Calculate churn risk
      const churnRisk = calculateChurnRisk(engagement, lifecycle);

      // Determine new state
      const newState = determineLifecycleState(engagement, powerUser, churnRisk);

      // Detect state transition
      const transitioned = newState !== lifecycle.current_state;
      const triggerSignal = transitioned ? identifyTransitionSignal(lifecycle.current_state, newState, engagement) : null;

      // Build state history
      const stateHistory = lifecycle.state_history || [];
      if (transitioned && lifecycle.current_state) {
        const lastState = stateHistory[stateHistory.length - 1];
        if (lastState) {
          lastState.exited_at = new Date().toISOString();
          lastState.duration_days = Math.floor(
            (new Date() - new Date(lastState.entered_at)) / (1000 * 60 * 60 * 24)
          );
        }
        stateHistory.push({
          state: newState,
          entered_at: new Date().toISOString(),
          trigger_signal: triggerSignal
        });
      }

      // Determine experience settings based on state
      const experienceSettings = getExperienceSettings(newState, churnRisk);

      // Check for active interventions
      const activeInterventions = determineActiveInterventions(newState, churnRisk);

      // Update profile
      const newLifecycleState = {
        current_state: newState,
        state_history: stateHistory,
        churn_risk: churnRisk,
        engagement_signals: {
          sessions_last_7_days: engagement.weekly_engagement?.visits_this_week || 0,
          sessions_prior_7_days: engagement.weekly_engagement?.visits_this_week || 0,
          active_habit_loops: Object.entries(engagement.active_habit_loops || {})
            .filter(([_, loop]) => loop.active)
            .map(([name]) => name),
          inactive_habit_loops: Object.entries(engagement.active_habit_loops || {})
            .filter(([_, loop]) => !loop.active)
            .map(([name]) => name)
        },
        interventions: {
          active_interventions: activeInterventions,
          dismissed_interventions: lifecycle.interventions?.dismissed_interventions || []
        },
        experience_settings: experienceSettings,
        context: {
          last_activity_at: engagement.weekly_engagement?.last_visit_at || new Date().toISOString(),
          days_since_activity: calculateDaysSinceActivity(engagement),
          suppress_upsells: churnRisk.score >= 60 || newState === 'at_risk' || newState === 'dormant'
        }
      };

      try {
        await base44.entities.UserProfile.update(profile.id, {
          lifecycle_state: newLifecycleState
        });
        results.push({ user: profile.created_by, newState, churnRisk: churnRisk.score, transitioned });
      } catch (e) {
        console.error(`Failed to update lifecycle state for ${profile.created_by}:`, e);
      }
    }

    return Response.json({ success: true, updated: results.length, results });
  } catch (error) {
    console.error('Lifecycle state update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateChurnRisk(engagement, lifecycle) {
  const habits = engagement.active_habit_loops || {};
  const weekly = engagement.weekly_engagement || {};

  // Engagement Velocity (40% weight)
  const sessionsLast7 = weekly.visits_this_week || 0;
  const sessionsPrior7 = lifecycle.engagement_signals?.sessions_prior_7_days || sessionsLast7;
  const engagementVelocity = sessionsPrior7 > 0 
    ? ((sessionsLast7 - sessionsPrior7) / sessionsPrior7) * 100 
    : 0;
  const velocityScore = Math.max(-100, engagementVelocity) * 0.4;

  // Habit Loop Health (30% weight)
  const activeLoops = Object.values(habits).filter(h => h.active).length;
  const totalLoops = Object.keys(habits).length;
  const loopHealth = totalLoops > 0 ? activeLoops / totalLoops : 1;
  const loopScore = (1 - loopHealth) * 100 * 0.3;

  // Nudge Dismissal Rate (20% weight)
  const nudgesShown = lifecycle.engagement_signals?.nudges_shown_last_14_days || 1;
  const nudgesDismissed = lifecycle.engagement_signals?.nudges_dismissed_last_14_days || 0;
  const dismissalRate = nudgesShown > 0 ? (nudgesDismissed / nudgesShown) * 100 : 0;
  const dismissalScore = dismissalRate * 0.2;

  // Feature Abandonment (10% weight)
  const totalFlows = lifecycle.engagement_signals?.total_flows_last_14_days || 1;
  const incompleteFlows = lifecycle.engagement_signals?.incomplete_flows_last_14_days || 0;
  const abandonmentRate = totalFlows > 0 ? (incompleteFlows / totalFlows) * 100 : 0;
  const abandonmentScore = abandonmentRate * 0.1;

  const totalScore = Math.min(100, Math.max(0, velocityScore + loopScore + dismissalScore + abandonmentScore));

  return {
    score: Math.round(totalScore),
    tier: totalScore < 31 ? 'low' : totalScore < 61 ? 'medium' : 'high',
    components: {
      engagement_velocity: Math.round(engagementVelocity),
      habit_loop_health: Math.round(loopHealth * 100),
      nudge_dismissal_rate: Math.round(dismissalRate),
      feature_abandonment: Math.round(abandonmentRate)
    },
    last_calculated_at: new Date().toISOString()
  };
}

function determineLifecycleState(engagement, powerUser, churnRisk) {
  const habits = engagement.active_habit_loops || {};
  const weekly = engagement.weekly_engagement || {};

  // Power User
  if (Object.values(powerUser.unlocked_tiers || {}).some(t => t.unlocked)) {
    return 'power_user';
  }

  // Dormant (21+ days no activity)
  const daysSinceActivity = calculateDaysSinceActivity(engagement);
  if (daysSinceActivity >= 21) {
    return 'dormant';
  }

  // Returning (was dormant, now active)
  if (engagement.state_entered_at && daysSinceActivity <= 7) {
    return 'returning'; // Needs previous state context; simplify for demo
  }

  // At-Risk (churn score ≥60)
  if (churnRisk.score >= 60) {
    return 'at_risk';
  }

  // Engaged (2+ sessions/week for 2+ weeks)
  if (weekly.visits_this_week >= 2 && (weekly.streak_weeks || 0) >= 2) {
    return 'engaged';
  }

  // Activated (1+ milestone completed)
  if (engagement.stage === 'activated') {
    return 'activated';
  }

  return 'new';
}

function identifyTransitionSignal(fromState, toState, engagement) {
  if (toState === 'power_user') return 'Capability tier unlocked';
  if (toState === 'engaged') return 'Weekly engagement streak established';
  if (toState === 'at_risk') return 'Churn risk score ≥60';
  if (toState === 'dormant') return '21+ days no activity';
  if (toState === 'returning') return 'Activity resumed from dormant';
  return 'Automatic transition';
}

function getExperienceSettings(state, churnRisk) {
  const settings = {
    new: { tutorial_density: 'high', complexity_reduction: 'aggressive', messaging_tone: 'supportive_guidance', upsell_frequency: 'none' },
    activated: { tutorial_density: 'medium', complexity_reduction: 'moderate', messaging_tone: 'encouraging', upsell_frequency: 'low' },
    engaged: { tutorial_density: 'low', complexity_reduction: 'minimal', messaging_tone: 'partnership', upsell_frequency: 'contextual' },
    power_user: { tutorial_density: 'minimal', complexity_reduction: 'none', messaging_tone: 'partnership_premium', upsell_frequency: 'feature_expansion' },
    at_risk: { tutorial_density: 'none', complexity_reduction: 'aggressive', messaging_tone: 'value_reminder_gentle', upsell_frequency: 'none' },
    dormant: { tutorial_density: 'none', complexity_reduction: 'none', messaging_tone: 'high_signal_summary_only', upsell_frequency: 'none' },
    returning: { tutorial_density: 'low', complexity_reduction: 'high', messaging_tone: 'welcome_back_contextual', upsell_frequency: 'none' }
  };

  return { ...settings[state], suppress_upsells: churnRisk.score >= 60 };
}

function determineActiveInterventions(state, churnRisk) {
  const interventions = [];

  if (state === 'at_risk') {
    interventions.push({
      intervention_id: 'at_risk_relevance_reset',
      playbook: 'at_risk',
      activated_at: new Date().toISOString(),
      status: 'active'
    });
  }

  if (state === 'dormant') {
    interventions.push({
      intervention_id: 'dormant_high_signal_summary',
      playbook: 'dormant',
      activated_at: new Date().toISOString(),
      status: 'active'
    });
  }

  if (state === 'returning') {
    interventions.push({
      intervention_id: 'returning_context_restoration',
      playbook: 'returning',
      activated_at: new Date().toISOString(),
      status: 'active'
    });
  }

  return interventions;
}

function calculateDaysSinceActivity(engagement) {
  const lastVisit = engagement.weekly_engagement?.last_visit_at;
  if (!lastVisit) return 0;
  return Math.floor((new Date() - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
}