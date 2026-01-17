"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock, TrendingUp, Zap, Users, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * POWER-USER EXPANSION & MONETIZATION SYSTEM
 * 
 * Core premise: Unlock premium capabilities as consequence of demonstrated behavior,
 * not forced upsells. Monetize when value is clear and actively relevant.
 */

const POWER_USER_SIGNALS = {
  deal_momentum: {
    name: 'Deal Momentum',
    icon: Zap,
    description: 'User actively saving and comparing deals',
    thresholds: {
      tier_1: 'Saved ≥5 deals OR compared ≥3 deals',
      tier_2: 'Saved ≥15 deals OR compared ≥10 deals',
      tier_3: 'Saved ≥30 deals AND compared ≥20 deals'
    },
    signals: [
      { name: 'Deals Saved', metric: 'count', weight: 1 },
      { name: 'Deals Compared', metric: 'count', weight: 1.5 },
      { name: 'Comparison Depth', metric: 'avg_criteria_used', weight: 0.8 },
      { name: 'Save Rate', metric: 'save_view_ratio', weight: 0.6 }
    ]
  },
  portfolio_engagement: {
    name: 'Portfolio Engagement',
    icon: TrendingUp,
    description: 'User actively managing goals and viewing analytics',
    thresholds: {
      tier_1: 'Goals viewed/adjusted ≥2 times',
      tier_2: 'Goals viewed/adjusted ≥8 times, analytics visits ≥5',
      tier_3: 'Active goal management + scenario exploration ≥3'
    },
    signals: [
      { name: 'Goal Updates', metric: 'count', weight: 1 },
      { name: 'Analytics Sessions', metric: 'count', weight: 1 },
      { name: 'Scenario Explorations', metric: 'count', weight: 1.5 },
      { name: 'Insight Engagement', metric: 'insights_acted_on', weight: 0.8 }
    ]
  },
  social_presence: {
    name: 'Social Presence',
    icon: Users,
    description: 'User engaging with community and experts',
    thresholds: {
      tier_1: 'Community interactions ≥3 (join, bookmark, react)',
      tier_2: 'Following ≥5 experts, posts/comments ≥2',
      tier_3: 'Following ≥15 experts, content created ≥5, engagement rate >20%'
    },
    signals: [
      { name: 'Community Joins', metric: 'count', weight: 1 },
      { name: 'Expert Follows', metric: 'count', weight: 1.2 },
      { name: 'Posts/Comments', metric: 'count', weight: 1.3 },
      { name: 'Engagement Rate', metric: 'percentage', weight: 0.7 }
    ]
  },
  retention_consistency: {
    name: 'Retention Consistency',
    icon: TrendingUp,
    description: 'User showing sustained engagement over time',
    thresholds: {
      tier_1: 'Weekly engagement streak ≥3 weeks',
      tier_2: 'Weekly engagement streak ≥8 weeks, avg 2+ sessions/week',
      tier_3: 'Weekly engagement streak ≥20 weeks, active habit loops ≥2'
    },
    signals: [
      { name: 'Weekly Streak', metric: 'weeks', weight: 1.5 },
      { name: 'Sessions Per Week', metric: 'avg', weight: 1 },
      { name: 'Active Loops', metric: 'count', weight: 1 },
      { name: 'Days Since Inactive', metric: 'days', weight: 0.5 }
    ]
  }
};

const CAPABILITY_TIERS = {
  tier_1: {
    name: 'Advanced Discovery',
    icon: Zap,
    color: 'blue',
    unlockedAt: 'First 5 deals saved or 3 compared',
    capabilities: [
      {
        name: 'Deal Comparisons',
        description: 'Side-by-side comparison of ≤5 deals',
        value: 'Save 30+ minutes per analysis'
      },
      {
        name: 'Saved Collections',
        description: 'Organize deals into custom folders',
        value: 'Track deals by strategy or timeline'
      },
      {
        name: 'Strategy Fit Explanations',
        description: '"Why this deal matches your goals"',
        value: 'Faster confidence in decisions'
      },
      {
        name: 'Deal Alerts (Limited)',
        description: 'New deals matching criteria (3/month)',
        value: 'Never miss relevant opportunities'
      }
    ],
    messaging: 'You\'ve unlocked deeper deal analysis based on how you work.',
    unlockTrigger: {
      signals: ['deal_momentum'],
      threshold: 'tier_1'
    }
  },
  tier_2: {
    name: 'Portfolio Intelligence',
    icon: TrendingUp,
    color: 'purple',
    unlockedAt: 'After active goal management',
    capabilities: [
      {
        name: 'Scenario Modeling',
        description: 'Model "what-if" outcomes for different allocations',
        value: 'Test strategies before committing'
      },
      {
        name: 'Goal-to-Deal Mapping',
        description: 'Automatic recommendations tied to specific goals',
        value: 'Align every deal to your strategy'
      },
      {
        name: 'Performance Projections',
        description: 'AI-driven ROI forecasting (12/24/36-month)',
        value: 'Risk assessment + confidence metrics'
      },
      {
        name: 'Portfolio Benchmarking',
        description: 'Anonymous peer comparison (industry/strategy)',
        value: 'See how your allocations compare'
      }
    ],
    messaging: 'Your portfolio activity unlocked forecasting tools.',
    unlockTrigger: {
      signals: ['portfolio_engagement'],
      threshold: 'tier_1'
    }
  },
  tier_3: {
    name: 'Network & Signal Amplification',
    icon: Users,
    color: 'green',
    unlockedAt: 'After meaningful community engagement',
    capabilities: [
      {
        name: 'Expert Network Access',
        description: 'Follow 15+ vetted experts, see their deal activity',
        value: 'Learn from proven investors'
      },
      {
        name: 'Signal Boosting',
        description: 'Highlight your insights in premium feeds',
        value: 'Build credibility + visibility'
      },
      {
        name: 'Private Community Access',
        description: 'Invite-only syndicate discussions + deal sourcing',
        value: 'Access to co-investment opportunities'
      },
      {
        name: 'Notification Prioritization',
        description: 'VIP expert activity + high-signal deal alerts',
        value: 'First to know about quality opportunities'
      }
    ],
    messaging: 'You now have access to higher-signal conversations.',
    unlockTrigger: {
      signals: ['social_presence'],
      threshold: 'tier_1'
    }
  }
};

const MONETIZATION_MOMENTS = {
  unlimited_comparisons: {
    trigger: 'User hits 5-deal comparison limit in tier_1',
    tier: 'tier_1',
    moment: 'in_app_during_task',
    headline: 'Unlock Unlimited Deal Comparisons',
    description: 'Compare as many deals as you need to make confident decisions.',
    value_statement: 'Premium members compare 3x more deals and close faster.',
    ctaMain: 'Upgrade for Unlimited',
    ctaSecondary: 'Continue with 5 deals',
    price: '$29/month or $249/year',
    avoid: ['countdown_timer', 'scarcity_language', 'guilt_framing']
  },
  advanced_modeling: {
    trigger: 'User attempts second what-if scenario in tier_2',
    tier: 'tier_2',
    moment: 'in_app_during_task',
    headline: 'Unlock Advanced Scenario Modeling',
    description: 'Model unlimited scenarios and compare outcomes side-by-side.',
    value_statement: 'Premium members test strategies 5x more and reduce allocation errors by 60%.',
    ctaMain: 'Upgrade to Premium',
    ctaSecondary: 'Try Another Time',
    price: '$49/month or $499/year',
    avoid: ['countdown_timer', 'scarcity_language', 'guilt_framing']
  },
  syndicate_access: {
    trigger: 'User views private syndicate preview in tier_3',
    tier: 'tier_3',
    moment: 'in_app_contextual',
    headline: 'Join Premium Investment Syndicates',
    description: 'Access co-investment deals and expert networks (limit 20 members/syndicate).',
    value_statement: 'Premium members average 2.3 new deal sources + 8 co-investment opportunities/month.',
    ctaMain: 'Join Premium',
    ctaSecondary: 'Browse Public Deals',
    price: '$99/month or $999/year',
    avoid: ['countdown_timer', 'scarcity_language', 'guilt_framing']
  }
};

const TIER_PROGRESSION_RULES = {
  never_block_workflow: 'Never pause user mid-task to show paywall. Show after task completion or offer dismiss-and-continue.',
  value_preview_first: 'Always show value preview before paywall (e.g., "See what you\'ll unlock...").',
  dismiss_respects_timing: 'If user dismisses, wait 14 days before re-triggering same moment.',
  payment_removes_friction: 'Annual pricing 15% cheaper. Simple checkout, no hidden fees.',
  fallback_option_always: 'Always offer free alternative if user declines (e.g., "Continue with limited").'
};

const POWER_USER_STATE_SCHEMA = {
  structure: {
    user_id: 'string',
    power_user_state: {
      signal_scores: {
        deal_momentum: 'number (0-100)',
        portfolio_engagement: 'number (0-100)',
        social_presence: 'number (0-100)',
        retention_consistency: 'number (0-100)'
      },
      unlocked_tiers: {
        tier_1: {
          unlocked_at: 'date-time',
          reason: 'string (which signals triggered)',
          capabilities_enabled: 'array of capability names'
        }
      },
      monetization: {
        eligible_moments: 'array of moment IDs (ready to show)',
        shown_moments: 'array of { moment_id, shown_at, dismissed_at }',
        converted_tiers: 'array of tier names user paid for',
        ltv_estimate: 'number (monthly ARR estimate)',
        next_eligible_moment: {
          moment_id: 'string',
          eligible_at: 'date-time',
          expected_conversion_rate: 'number %'
        }
      },
      engagement_summary: {
        total_deals_saved: 'number',
        total_comparisons: 'number',
        weekly_streak: 'number',
        community_score: 'number',
        portfolio_depth: 'number (goals, scenarios, etc)'
      }
    }
  },
  example: {
    user_id: 'user_789',
    power_user_state: {
      signal_scores: {
        deal_momentum: 72,
        portfolio_engagement: 58,
        social_presence: 45,
        retention_consistency: 85
      },
      unlocked_tiers: {
        tier_1: {
          unlocked_at: '2026-01-12T10:00:00Z',
          reason: 'Saved 8 deals + compared 4 deals',
          capabilities_enabled: ['deal_comparisons', 'saved_collections', 'strategy_fit_explanations', 'deal_alerts_limited']
        }
      },
      monetization: {
        eligible_moments: ['unlimited_comparisons'],
        shown_moments: [
          {
            moment_id: 'unlimited_comparisons',
            shown_at: '2026-01-15T14:00:00Z',
            dismissed_at: null,
            converted: false
          }
        ],
        converted_tiers: [],
        ltv_estimate: 29,
        next_eligible_moment: {
          moment_id: 'advanced_modeling',
          eligible_at: '2026-01-20T10:00:00Z',
          expected_conversion_rate: 0.18
        }
      },
      engagement_summary: {
        total_deals_saved: 8,
        total_comparisons: 4,
        weekly_streak: 5,
        community_score: 22,
        portfolio_depth: 2
      }
    }
  }
};

export default function PowerUserExpansion() {
  const [selectedSignal, setSelectedSignal] = useState('deal_momentum');
  const [selectedTier, setSelectedTier] = useState('tier_1');

  return (
    <div className="space-y-8 p-8 bg-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Power-User Expansion System</h1>
        <p className="text-gray-600 mt-2">Convert engaged users into power users through progressive capability unlocks and contextual monetization</p>
      </div>

      {/* Section 1: Power-User Signals */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Power-User Signal Definitions</h2>
        <Tabs value={selectedSignal} onValueChange={setSelectedSignal}>
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(POWER_USER_SIGNALS).map(([key, signal]) => {
              const Icon = signal.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{signal.name.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(POWER_USER_SIGNALS).map(([key, signal]) => {
            const Icon = signal.icon;
            return (
              <TabsContent key={key} value={key}>
                <Card className="bg-blue-50 border border-blue-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <div>
                        <CardTitle>{signal.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{signal.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Unlock Thresholds:</h4>
                      <div className="space-y-2">
                        {Object.entries(signal.thresholds).map(([tier, threshold]) => (
                          <div key={tier} className="p-3 bg-white rounded border border-blue-100">
                            <Badge className="mb-2">{tier.replace('_', ' ')}</Badge>
                            <p className="text-sm text-gray-700">{threshold}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Tracked Signals:</h4>
                      <div className="space-y-2">
                        {signal.signals.map((sig, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100 text-sm">
                            <span>{sig.name}</span>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">{sig.metric}</div>
                              <div className="font-semibold">w={sig.weight}</div>
                            </div>
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

      {/* Section 2: Capability Tiers */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Progressive Capability Tiers</h2>
        <Tabs value={selectedTier} onValueChange={setSelectedTier}>
          <TabsList className="grid w-full grid-cols-3">
            {Object.entries(CAPABILITY_TIERS).map(([key, tier]) => {
              const Icon = tier.icon;
              return (
                <TabsTrigger key={key} value={key}>
                  <Icon className="w-4 h-4 mr-2" />
                  {tier.name.split(' ')[0]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(CAPABILITY_TIERS).map(([key, tier]) => {
            const Icon = tier.icon;
            const colorClass = {
              blue: 'bg-blue-50 border-blue-200',
              purple: 'bg-purple-50 border-purple-200',
              green: 'bg-green-50 border-green-200'
            }[tier.color];

            return (
              <TabsContent key={key} value={key}>
                <Card className={`${colorClass} border`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <CardTitle>{tier.name}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1 italic">"{tier.messaging}"</p>
                      </div>
                      <Unlock className="w-5 h-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-900">
                        <strong>Unlocked at:</strong> {tier.unlockedAt}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Capabilities:</h4>
                      <div className="space-y-2">
                        {tier.capabilities.map((cap, i) => (
                          <div key={i} className="p-3 bg-white rounded border border-gray-200">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">{cap.name}</p>
                                <p className="text-xs text-gray-600 mt-1">{cap.description}</p>
                                <p className="text-xs text-green-700 mt-1">💡 {cap.value}</p>
                              </div>
                            </div>
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

      {/* Section 3: Monetization Moments */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Monetization Triggers & Messaging</h2>
        <div className="space-y-3">
          {Object.entries(MONETIZATION_MOMENTS).map(([key, moment]) => (
            <Card key={key} className="border-gray-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{moment.headline}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{moment.tier}</Badge>
                      <Badge variant="outline" className="text-xs">{moment.moment}</Badge>
                    </div>
                  </div>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600"><strong>Trigger:</strong> {moment.trigger}</p>
                </div>

                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-gray-900">{moment.description}</p>
                </div>

                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-gray-700">
                    <strong>Value Statement:</strong> {moment.value_statement}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Button className="bg-green-600 hover:bg-green-700 text-white text-sm h-9">
                    {moment.ctaMain}
                  </Button>
                  <Button variant="outline" className="text-sm h-9">
                    {moment.ctaSecondary}
                  </Button>
                </div>

                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600"><strong>Price:</strong> {moment.price}</p>
                </div>

                <div className="p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-xs text-red-800">
                    <strong>❌ Avoid:</strong> {moment.avoid.join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 4: Progression Rules */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Tier Progression & Friction Rules</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(TIER_PROGRESSION_RULES).map(([key, rule]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-900">
                  <strong className="text-blue-600">📌 {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:</strong>
                </p>
                <p className="text-sm text-gray-700 mt-2">{rule}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 5: Feedback Loop */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Power-User Value Feedback Loop</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                Usage Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              "You saved 12 hours this month using deal comparisons"
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Compounding Value
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              "Your strategy precision improved 34% from scenario modeling"
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Network Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              "You've seen 5 expert-sourced deals this month"
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 6: JSON Schema */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Power-User State JSON Schema</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Power-User Record</CardTitle>
          </CardHeader>
          <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
            <pre>{JSON.stringify(POWER_USER_STATE_SCHEMA.example, null, 2)}</pre>
          </CardContent>
        </Card>
      </section>

      {/* Section 7: Implementation Roadmap */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Implementation Roadmap</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 1: Signal Tracking</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Add PowerUserState entity</div>
              <div>☐ Implement signal calculators</div>
              <div>☐ Create tier unlock logic</div>
              <div>☐ Build signal dashboard</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 2: Capability Unlocks</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Add tier flags to EngagementState</div>
              <div>☐ Implement capability gating</div>
              <div>☐ Build unlock notification UI</div>
              <div>☐ Test tier progression</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 3: Monetization Triggers</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Create monetization rule engine</div>
              <div>☐ Build upgrade modals</div>
              <div>☐ Implement dismissal cooldowns</div>
              <div>☐ Track conversion metrics</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 4: Value Feedback</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Create usage analytics module</div>
              <div>☐ Generate value summaries</div>
              <div>☐ Build ROI calculator</div>
              <div>☐ Surface value insights monthly</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tone & Philosophy */}
      <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Design Philosophy</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✓ Design for Partnership</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Unlock capabilities as reward for demonstrated behavior</li>
              <li>• Show ROI before introducing premium features</li>
              <li>• Value precision over velocity</li>
              <li>• Celebrate milestones together</li>
              <li>• Make pricing transparent and fair</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✗ Never Do This</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Block users mid-task with paywalls</li>
              <li>• Use countdown timers or fake scarcity</li>
              <li>• Re-ask answered questions</li>
              <li>• Show different prices to different users</li>
              <li>• Hide feature costs until checkout</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}