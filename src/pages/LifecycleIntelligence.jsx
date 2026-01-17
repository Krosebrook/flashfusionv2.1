"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Users, Zap, RotateCcw, LogIn, Eye } from 'lucide-react';

/**
 * LIFECYCLE INTELLIGENCE SYSTEM
 * 
 * Continuously adapts experience across user lifecycle:
 * Detects intent shifts → Predicts churn → Delivers timely interventions
 */

const LIFECYCLE_STATES = {
  new: {
    name: 'New',
    icon: Eye,
    color: 'blue',
    description: 'User completed onboarding <7 days ago',
    characteristics: [
      'Onboarding path selected but not yet activated',
      'Still exploring features with high guidance needs',
      'Expected to transition to Activated within 7 days'
    ],
    triggers_in: 'Immediately upon onboarding completion',
    duration_typical: '1-7 days',
    experience: {
      tutorial_density: 'high',
      complexity_reduction: 'aggressive',
      messaging_tone: 'supportive_guidance',
      upsell_frequency: 'none'
    }
  },
  activated: {
    name: 'Activated',
    icon: Zap,
    color: 'green',
    description: 'User achieved ≥1 activation milestone',
    characteristics: [
      'Completed first meaningful action (saved deal, created goal, joined community)',
      'Establishing first habit loop',
      'High momentum, low churn risk'
    ],
    triggers_in: 'When milestone achieved',
    duration_typical: '7-30 days',
    experience: {
      tutorial_density: 'medium',
      complexity_reduction: 'moderate',
      messaging_tone: 'encouraging',
      upsell_frequency: 'low'
    }
  },
  engaged: {
    name: 'Engaged',
    icon: TrendingUp,
    color: 'purple',
    description: '≥2 sessions/week for ≥2 weeks',
    characteristics: [
      'Consistent weekly engagement established',
      'Multiple habit loops active',
      'Demonstrating power-user behaviors',
      'Ready for capability tier unlocks'
    ],
    triggers_in: 'After 2+ weeks of consistent use',
    duration_typical: '30+ days',
    experience: {
      tutorial_density: 'low',
      complexity_reduction: 'minimal',
      messaging_tone: 'partnership',
      upsell_frequency: 'contextual'
    }
  },
  power_user: {
    name: 'Power User',
    icon: Users,
    color: 'gold',
    description: 'Capability tier unlocked or paid tier active',
    characteristics: [
      'Premium features in active use',
      'High signal scores (≥70 across multiple dimensions)',
      'Demonstrating leverage and strategic approach',
      'Valuable for expansion and network effects'
    ],
    triggers_in: 'When tier_1/2/3 unlocked or subscription active',
    duration_typical: '60+ days',
    experience: {
      tutorial_density: 'minimal',
      complexity_reduction: 'none',
      messaging_tone: 'partnership_premium',
      upsell_frequency: 'feature_expansion'
    }
  },
  at_risk: {
    name: 'At-Risk',
    icon: AlertCircle,
    color: 'orange',
    description: 'Churn risk score ≥60, declining engagement',
    characteristics: [
      'Engagement frequency dropped ≥40% in 14 days',
      '≥2 habit loops inactive',
      '≥1 nudge dismissed without action',
      'Recently stopped meaningful usage patterns'
    ],
    triggers_in: 'When churn signals detected',
    duration_typical: '14-21 days before Dormant',
    experience: {
      tutorial_density: 'none',
      complexity_reduction: 'aggressive',
      messaging_tone: 'value_reminder_gentle',
      upsell_frequency: 'none'
    }
  },
  dormant: {
    name: 'Dormant',
    icon: RotateCcw,
    color: 'red',
    description: 'No meaningful activity for 21+ days',
    characteristics: [
      'Inactive for ≥21 days',
      'All habit loops stopped',
      'High likelihood of permanent churn',
      'Requires strong value signal to re-engage'
    ],
    triggers_in: 'After 21 days inactivity from At-Risk state',
    duration_typical: 'Until return or churn',
    experience: {
      tutorial_density: 'none',
      complexity_reduction: 'none',
      messaging_tone: 'high_signal_summary_only',
      upsell_frequency: 'none'
    }
  },
  returning: {
    name: 'Returning',
    icon: LogIn,
    color: 'teal',
    description: 'Re-entered after Dormant via win-back action',
    characteristics: [
      'Was dormant, now showing activity again',
      'Needs context restoration to avoid overwhelm',
      'High-signal summary + resume unfinished tasks',
      'Clean slate for new engagement patterns'
    ],
    triggers_in: 'When Dormant user takes any meaningful action',
    duration_typical: '7-14 days for re-activation or re-churn',
    experience: {
      tutorial_density: 'low',
      complexity_reduction: 'high',
      messaging_tone: 'welcome_back_contextual',
      upsell_frequency: 'none'
    }
  }
};

const STATE_TRANSITIONS = {
  new_to_activated: {
    from: 'New',
    to: 'Activated',
    trigger: 'Activation milestone achieved',
    examples: [
      'Saved first deal',
      'Created portfolio goal',
      'Joined community'
    ],
    timeframe: '≤7 days'
  },
  activated_to_engaged: {
    from: 'Activated',
    to: 'Engaged',
    trigger: '≥2 sessions/week for ≥2 weeks',
    signals: [
      'Weekly streak ≥2',
      'Sessions last 7 days ≥4',
      '≥2 different features used'
    ],
    timeframe: '7-30 days'
  },
  activated_to_at_risk: {
    from: 'Activated',
    to: 'At-Risk',
    trigger: 'Engagement drop ≥40% over 14 days',
    signals: [
      'Last session >7 days ago',
      'Habit loops stopped triggering',
      'Dismissals increasing'
    ],
    timeframe: 'When threshold exceeded'
  },
  engaged_to_power_user: {
    from: 'Engaged',
    to: 'Power User',
    trigger: 'Capability tier unlocked',
    signals: [
      'Tier 1+ unlocked',
      'OR subscription active',
      'Signal score ≥70 in ≥2 dimensions'
    ],
    timeframe: '30+ days into Engaged'
  },
  engaged_to_at_risk: {
    from: 'Engaged',
    to: 'At-Risk',
    trigger: 'Churn risk score ≥60',
    signals: [
      'Weekly sessions <1 for 2 weeks',
      'Habit loops inactive',
      'Nudge dismissal rate >50%'
    ],
    timeframe: 'When trend detected'
  },
  at_risk_to_dormant: {
    from: 'At-Risk',
    to: 'Dormant',
    trigger: '21+ days no meaningful activity',
    signals: [
      'Last session ≥21 days ago',
      'No logins or API calls',
      'All engagement metrics flat'
    ],
    timeframe: 'After 21 days in At-Risk'
  },
  dormant_to_returning: {
    from: 'Dormant',
    to: 'Returning',
    trigger: 'Any meaningful action from Dormant state',
    signals: [
      'Login after ≥21 days',
      'Deal saved/viewed',
      'Community action'
    ],
    timeframe: 'Immediate on action'
  },
  returning_to_engaged: {
    from: 'Returning',
    to: 'Engaged',
    trigger: '2+ sessions in 7 days + context engagement',
    signals: [
      'Sessions ≥2 in past 7 days',
      'Resumed unfinished flow',
      'Habit loop re-triggered'
    ],
    timeframe: '7-14 days'
  },
  returning_to_dormant: {
    from: 'Returning',
    to: 'Dormant',
    trigger: 'No activity for 7 days from Returning state',
    signals: [
      'Last session ≥7 days ago',
      'Context not consumed',
      'No follow-up actions'
    ],
    timeframe: '7+ days in Returning'
  }
};

const CHURN_RISK_MODEL = {
  description: 'Lightweight scoring based on behavior trends, not absolute silence',
  components: [
    {
      name: 'Engagement Velocity',
      weight: 0.4,
      formula: '(sessions_last_7_days - sessions_prior_7_days) / sessions_prior_7_days',
      interpretation: 'Rate of change in activity frequency. -40% = high risk.'
    },
    {
      name: 'Habit Loop Health',
      weight: 0.3,
      formula: 'loops_inactive / total_loops_ever_active',
      interpretation: 'What % of previously active loops have stopped?'
    },
    {
      name: 'Nudge Dismissal Rate',
      weight: 0.2,
      formula: 'nudges_dismissed_last_14_days / nudges_shown_last_14_days',
      interpretation: 'Is user ignoring all guidance? >50% = risk signal'
    },
    {
      name: 'Feature Abandonment',
      weight: 0.1,
      formula: 'incomplete_flows_last_14_days / total_flows_initiated',
      interpretation: 'Started but didn\'t finish usage. Suggests friction or lost interest.'
    }
  ],
  risk_tiers: [
    {
      score_range: '0-30',
      label: 'Low Risk',
      color: 'green',
      action: 'None. Monitor.'
    },
    {
      score_range: '31-60',
      label: 'Medium Risk',
      color: 'yellow',
      action: 'Gentle value reminder. Track closely.'
    },
    {
      score_range: '61-100',
      label: 'High Risk',
      color: 'red',
      action: 'At-Risk state trigger. Relevance reset intervention.'
    }
  ],
  example_calculation: {
    user: 'user_456',
    engagement_velocity: -45,
    habit_loop_health: 0.67,
    nudge_dismissal_rate: 0.55,
    feature_abandonment: 0.40,
    churn_risk_score: 62,
    classification: 'High Risk',
    triggered_at: '2026-01-17T10:00:00Z'
  }
};

const INTERVENTION_PLAYBOOKS = {
  at_risk: {
    name: 'At-Risk Intervention Playbook',
    goal: 'Re-establish relevance without overwhelming',
    tactics: [
      {
        name: 'Relevance Reset',
        timing: 'Immediately on At-Risk detection',
        action: 'Show "What\'s changed since you left" summary',
        content: '3 new deals matching criteria + 1 community highlight',
        frequency: 'Once per At-Risk period'
      },
      {
        name: 'Reduced Cognitive Load',
        timing: 'All UI interactions',
        action: 'Simplify: hide tutorials, reduce CTAs to 2 max',
        reasoning: 'Overwhelm → churn. Focus on core value only.',
        frequency: 'Every session'
      },
      {
        name: 'Gentle Value Reminder',
        timing: 'Day 7 of At-Risk (if not re-engaged)',
        action: 'Email: "You saved 5 deals in the past month—here are updates"',
        tone: 'Reference prior achievements, not criticism',
        frequency: 'Once'
      },
      {
        name: 'No Aggressive Upsells',
        timing: 'All moments',
        action: 'Suppress monetization prompts entirely',
        reasoning: 'Risk state demands focus on retention, not expansion',
        frequency: 'N/A'
      }
    ]
  },
  dormant: {
    name: 'Dormant Intervention Playbook',
    goal: 'High-signal re-entry without overwhelming',
    tactics: [
      {
        name: 'High-Signal Summary Email',
        timing: 'Day 21+ inactivity (trigger Dormant state)',
        action: 'Email: Top 3 changes (deals, experts, insights only)',
        content: 'Brief bullets. Max 3 items. No unread counts or urgency.',
        frequency: 'One email per dormant period'
      },
      {
        name: 'Optional Reactivation Path',
        timing: 'If user clicks email link',
        action: 'Land in simplified context page (deals + goals only)',
        reasoning: 'Don\'t reset onboarding. Show progress they made.',
        frequency: 'On-demand'
      },
      {
        name: 'Respectful Re-Entry Messaging',
        timing: 'First session back',
        action: 'Toast: "Welcome back! You were tracking these."',
        tone: 'No guilt. No "You haven\'t visited in..."',
        frequency: 'Once on return'
      },
      {
        name: 'Resume Unfinished Actions',
        timing: 'Context restoration on login',
        action: 'Show last incomplete flow (e.g., "Finish deal comparison")',
        reasoning: 'Provide momentum, not friction',
        frequency: 'Every session'
      }
    ]
  },
  returning: {
    name: 'Returning User Intervention Playbook',
    goal: 'Re-establish engagement momentum with grace',
    tactics: [
      {
        name: 'Context Restoration',
        timing: 'Immediately on login',
        action: 'Show "You were tracking these deals" + unfinished flows',
        content: 'Last 3 saved deals + incomplete comparisons',
        frequency: 'Every session first 7 days'
      },
      {
        name: 'Avoid Overwhelming Updates',
        timing: 'All notifications',
        action: 'Show only high-signal changes (no "32 new deals")',
        reasoning: 'Cognitive overload → re-churn',
        frequency: 'Every interaction'
      },
      {
        name: 'Resume Habit Loops',
        timing: 'Context page load',
        action: 'Trigger relevant loop (discovery/insight/social)',
        reasoning: 'Get momentum back quickly',
        frequency: 'Once per visit'
      },
      {
        name: 'No Onboarding Reset',
        timing: 'All moments',
        action: 'Never ask answered questions again',
        reasoning: 'Users know the platform. Build on prior knowledge.',
        frequency: 'N/A'
      }
    ]
  }
};

const ADAPTIVE_PERSONALIZATION = {
  as_users_mature: [
    {
      phase: 'New (Days 1-7)',
      tutorials: 'All (required)',
      insight_density: 'Low (1 insight/day)',
      messaging_style: 'Guided (step-by-step)',
      autonomy_level: 'Minimal'
    },
    {
      phase: 'Activated (Days 7-30)',
      tutorials: 'High-value only (feature-specific)',
      insight_density: 'Medium (2-3 insights/week)',
      messaging_style: 'Encouraging (nudges vs. steps)',
      autonomy_level: 'Moderate'
    },
    {
      phase: 'Engaged (30+ days)',
      tutorials: 'Optional (link to docs)',
      insight_density: 'High (insights on-demand)',
      messaging_style: 'Partnership (contextual only)',
      autonomy_level: 'High'
    },
    {
      phase: 'Power User (Tier 1+)',
      tutorials: 'None (API docs only)',
      insight_density: 'Premium (algorithmic feed)',
      messaging_style: 'Feature updates only',
      autonomy_level: 'Full autonomy'
    }
  ],
  never_reset: [
    'Answered onboarding questions',
    'Saved preferences (industries, goals, etc.)',
    'Customized settings (digest frequency, privacy)',
    'Completed milestones (no "redo" prompts)'
  ]
};

const LIFECYCLE_AWARE_MONETIZATION = {
  rules: [
    {
      rule: 'Never target At-Risk or Dormant users',
      reasoning: 'Monetization conversation when they\'re leaving = acceleration toward churn',
      implementation: 'Suppress all paid tier prompts if churn_risk_score ≥60'
    },
    {
      rule: 'Monetize when value momentum is high',
      reasoning: 'Upgrade prompts during high engagement = lower CAC, higher conversion',
      implementation: 'Only show upgrade prompts if engagement_velocity >0'
    },
    {
      rule: 'Frame as capability expansion, not restriction',
      reasoning: 'No "unlock feature" language. Say "expand your workflow"',
      implementation: 'Messaging: "Unlock advanced deal modeling" vs "Upgrade to access"'
    },
    {
      rule: 'Returning users exempt for first 7 days',
      reasoning: 'Let them re-establish habits before asking for payment',
      implementation: 'If state == Returning AND days_in_state ≤7: suppress upsells'
    }
  ],
  moments_by_state: {
    new: 'None',
    activated: 'None',
    engaged: 'Contextual (when using tier_1 capability boundary)',
    power_user: 'Feature expansion only',
    at_risk: 'Suppressed entirely',
    dormant: 'Suppressed entirely',
    returning: 'Suppressed (first 7 days), then contextual'
  }
};

export default function LifecycleIntelligence() {
  const [selectedState, setSelectedState] = useState('new');

  return (
    <div className="space-y-8 p-8 bg-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lifecycle Intelligence System</h1>
        <p className="text-gray-600 mt-2">Adapt experience across the entire user lifecycle by detecting intent shifts, predicting churn, and delivering timely interventions</p>
      </div>

      {/* Section 1: Lifecycle States */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Lifecycle State Model</h2>
        <Tabs value={selectedState} onValueChange={setSelectedState}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {Object.entries(LIFECYCLE_STATES).map(([key, state]) => {
              const Icon = state.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{state.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(LIFECYCLE_STATES).map(([key, state]) => {
            const Icon = state.icon;
            const colorBg = {
              blue: 'bg-blue-50 border-blue-200',
              green: 'bg-green-50 border-green-200',
              purple: 'bg-purple-50 border-purple-200',
              gold: 'bg-yellow-50 border-yellow-200',
              orange: 'bg-orange-50 border-orange-200',
              red: 'bg-red-50 border-red-200',
              teal: 'bg-teal-50 border-teal-200'
            }[state.color];

            return (
              <TabsContent key={key} value={key}>
                <Card className={`${colorBg} border`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <CardTitle className="text-base">{state.name}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">{state.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Characteristics:</h4>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        {state.characteristics.map((char, i) => <li key={i}>{char}</li>)}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-600"><strong>Triggers:</strong> {state.triggers_in}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-600"><strong>Typical Duration:</strong> {state.duration_typical}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Experience Adaptation:</h4>
                      <div className="space-y-1 text-xs">
                        {Object.entries(state.experience).map(([key, val]) => (
                          <div key={key} className="flex justify-between p-1">
                            <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                            <Badge variant="outline">{val}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </section>

      {/* Section 2: State Transitions */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. State Transition Rules & Signals</h2>
        <div className="space-y-3">
          {Object.entries(STATE_TRANSITIONS).map(([key, trans]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {trans.from} → {trans.to}
                  </CardTitle>
                  <Badge variant="outline">{trans.timeframe}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-gray-900"><strong>Trigger:</strong> {trans.trigger}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Measurable Signals:</p>
                  <ul className="text-gray-700 space-y-1 ml-4 list-disc">
                    {(trans.signals || trans.examples || []).map((sig, i) => (
                      <li key={i}>{sig}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 3: Churn Risk Model */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Churn Risk Detection Model</h2>
        <Card className="bg-red-50 border border-red-200 mb-4">
          <CardHeader>
            <CardTitle className="text-base">{CHURN_RISK_MODEL.description}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Risk Score Components:</h4>
              <div className="space-y-2">
                {CHURN_RISK_MODEL.components.map((comp, i) => (
                  <div key={i} className="p-3 bg-white rounded border border-red-100">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm text-gray-900">{comp.name}</p>
                      <Badge className="bg-red-600">w={comp.weight}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 font-mono mb-1">{comp.formula}</p>
                    <p className="text-xs text-gray-700">{comp.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Risk Tiers:</h4>
              <div className="space-y-2">
                {CHURN_RISK_MODEL.risk_tiers.map((tier, i) => {
                  const bgClass = {
                    green: 'bg-green-100 border-green-300',
                    yellow: 'bg-yellow-100 border-yellow-300',
                    red: 'bg-red-100 border-red-300'
                  }[tier.color];
                  return (
                    <div key={i} className={`p-3 rounded border ${bgClass}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{tier.label}</p>
                          <p className="text-xs text-gray-700 mt-1">Score: {tier.score_range}</p>
                        </div>
                        <p className="text-xs text-gray-700">{tier.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-white rounded border border-red-100">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Example Calculation:</h4>
              <div className="text-xs text-gray-700 space-y-1 font-mono">
                <div>Engagement Velocity: {CHURN_RISK_MODEL.example_calculation.engagement_velocity}% (-45 = rapid decline)</div>
                <div>Habit Loop Health: {CHURN_RISK_MODEL.example_calculation.habit_loop_health} (67% stopped)</div>
                <div>Nudge Dismissal: {(CHURN_RISK_MODEL.example_calculation.nudge_dismissal_rate * 100).toFixed(0)}% (high)</div>
                <div className="border-t pt-1 mt-1">
                  <strong>Churn Risk Score: {CHURN_RISK_MODEL.example_calculation.churn_risk_score}</strong> ({CHURN_RISK_MODEL.example_calculation.classification})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Intervention Playbooks */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Intervention Playbooks by State</h2>
        <div className="space-y-4">
          {Object.entries(INTERVENTION_PLAYBOOKS).map(([key, playbook]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{playbook.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1"><strong>Goal:</strong> {playbook.goal}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playbook.tactics.map((tactic, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="font-semibold text-sm text-gray-900">{tactic.name}</p>
                      <div className="mt-2 space-y-1 text-xs text-gray-700">
                        {Object.entries(tactic).map(([k, v]) => {
                          if (k === 'name') return null;
                          return (
                            <div key={k}>
                              <span className="text-gray-600"><strong>{k}:</strong></span> {v}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 5: Adaptive Personalization */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Adaptive Personalization Over Time</h2>
        <div className="space-y-3 mb-4">
          {ADAPTIVE_PERSONALIZATION.as_users_mature.map((phase, i) => (
            <Card key={i} className="border-gray-300">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">{phase.phase}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1"><strong>Tutorials:</strong></p>
                    <Badge variant="outline">{phase.tutorials}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1"><strong>Insights:</strong></p>
                    <Badge variant="outline">{phase.insight_density}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1"><strong>Messaging:</strong></p>
                    <Badge variant="outline">{phase.messaging_style}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1"><strong>Autonomy:</strong></p>
                    <Badge className="bg-blue-600">{phase.autonomy_level}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Never Reset (Even if User Returns)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
              {ADAPTIVE_PERSONALIZATION.never_reset.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Section 6: Lifecycle-Aware Monetization */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Lifecycle-Aware Monetization Rules</h2>
        <div className="space-y-3">
          {LIFECYCLE_AWARE_MONETIZATION.rules.map((rule, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <p className="font-semibold text-sm text-gray-900 mb-2">{i + 1}. {rule.rule}</p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p><strong>Reasoning:</strong> {rule.reasoning}</p>
                  <p><strong>Implementation:</strong> {rule.implementation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-4 bg-green-50 border border-green-200">
          <CardHeader>
            <CardTitle className="text-base">Monetization Moments by Lifecycle State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {Object.entries(LIFECYCLE_AWARE_MONETIZATION.moments_by_state).map(([state, moment]) => (
                <div key={state} className="p-3 bg-white rounded border border-gray-200">
                  <p className="font-semibold text-gray-900 capitalize mb-1">{state.replace(/_/g, ' ')}</p>
                  <p className="text-gray-700">{moment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 7: Implementation Roadmap */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Implementation Roadmap</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 1: State Tracking</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Create LifecycleState entity</div>
              <div>☐ Build state transition logic</div>
              <div>☐ Implement daily state recalculation</div>
              <div>☐ Build state dashboard</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 2: Churn Detection</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Calculate risk score components</div>
              <div>☐ Implement risk tier classification</div>
              <div>☐ Create risk dashboard + alerts</div>
              <div>☐ Test model accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 3: Interventions</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Build intervention rule engine</div>
              <div>☐ Implement at-risk playbook</div>
              <div>☐ Implement dormant playbook</div>
              <div>☐ Implement returning playbook</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 4: Personalization</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Build feature density controller</div>
              <div>☐ Implement adaptive tutorials</div>
              <div>☐ Create preference preservation logic</div>
              <div>☐ Monitor impact metrics</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Philosophy: Long-Term Partnership</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">✓ Design for Long-Term Value</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Detect subtle behavior shifts early</li>
              <li>• Intervene before churn, not after</li>
              <li>• Respect user autonomy as they mature</li>
              <li>• Build trust through consistent value delivery</li>
              <li>• Celebrate milestones together</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">✗ Never Do This</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Use "churn" language in user-facing UI</li>
              <li>• Reset preferences when user returns</li>
              <li>• Overwhelm returning users with updates</li>
              <li>• Monetize at-risk or dormant users</li>
              <li>• Make users re-answer known questions</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}