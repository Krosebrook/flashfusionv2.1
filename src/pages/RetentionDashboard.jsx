"use client";
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, Users, Calendar, AlertCircle, CheckCircle2, Award } from 'lucide-react';

/**
 * 30-DAY RETENTION & HABIT-LOOP SYSTEM
 * 
 * Transforms first-time activation into repeat, value-driven usage.
 * Built on: Onboarding preferences + Activation path + Early behavior signals
 * 
 * Success = Weekly return visits + Increasing personalization + Compounding actions
 */

const HABIT_LOOPS = {
  discovery: {
    name: 'Discovery Loop',
    icon: Zap,
    color: 'blue',
    trigger: 'When user saves or views deals',
    flow: [
      'Show new or updated deals aligned to preferences',
      'Explain "why this is relevant" (industries, size, structure)',
      'Encourage light action (save, compare, dismiss)',
      'Show improved recommendations as reward'
    ],
    reward: 'Visual feedback: "Your deal feed just got smarter"',
    frequency: 'Every session + algorithmic update',
    example_cta: 'View 3 new deals in your watchlist sectors'
  },
  insight: {
    name: 'Insight Loop',
    icon: TrendingUp,
    color: 'purple',
    trigger: 'When user views analytics or portfolio goals',
    flow: [
      'Surface 1-2 new insights or projections',
      'Tie insights to real deal opportunities',
      'Invite micro-adjustments (no heavy setup)',
      'Show progress indicators as reward'
    ],
    reward: 'Confidence-building: "You\'re on track for your $X goal"',
    frequency: 'On-demand (analytics page) + weekly digest',
    example_cta: 'Your projected ROI moved +2% — see why'
  },
  social: {
    name: 'Social Proof Loop',
    icon: Users,
    color: 'green',
    trigger: 'When user observes or joins communities',
    flow: [
      'Highlight high-signal discussions (expert replies, deal syndications)',
      'Recommend people/threads based on goals & sectors',
      'Encourage low-friction participation (react, bookmark, follow)',
      'Show social relevance as reward'
    ],
    reward: 'Social signal: "Expert investor [Name] liked your insight"',
    frequency: 'On community page + weekly digest',
    example_cta: '5 new discussions in Angel Syndicate — see trending'
  }
};

const RETENTION_PHASES = {
  phase_1: {
    name: 'Days 1-7: Activation Consolidation',
    goal: 'First compounding action established',
    focus: 'Reinforce initial activation path habit loop',
    tactics: [
      'Daily loop triggering (if user is active)',
      'Gentle contextual prompts for skipped milestones',
      'Early behavior reinforcement ("Great! You saved 3 deals")',
      'Digest preference collection (optional)'
    ]
  },
  phase_2: {
    name: 'Days 8-14: Cross-Loop Introduction',
    goal: 'User touches ≥2 habit loops',
    focus: 'Introduce secondary loops without overwhelm',
    tactics: [
      'Cross-recommend (e.g., "Your 3 saved deals map to your goal")',
      'Soft community invitations ("See what peers are discussing")',
      'Light personalization improvements',
      'Weekly digest introduction (opt-in)'
    ]
  },
  phase_3: {
    name: 'Days 15-21: Compounding Momentum',
    goal: 'Weekly engagement streak established',
    focus: 'Reinforce emerging habit loops with evidence',
    tactics: [
      'Surface habit progress ("You\'ve saved deals 4 weeks running")',
      'Advanced personalization (insights, benchmarks)',
      'Community encouragement (low-friction)',
      'Weekly digest delivery (auto-enabled if engaged)'
    ]
  },
  phase_4: {
    name: 'Days 22-30: Long-Term Value',
    goal: 'Self-reinforcing habit loops active',
    focus: 'Transition to user-driven engagement',
    tactics: [
      'Autonomy first (reduce system messages)',
      'Digest customization options',
      'Milestone celebrations (30-day anniversary)',
      'Preference refinement prompts (collect feedback)'
    ]
  }
};

const WEEKLY_CADENCE = {
  timing: 'Sent weekly, day & time based on user timezone + first active time',
  optional: true,
  adaptable: 'Frequency changes based on engagement level',
  components: [
    {
      title: 'What Changed Since Last Visit',
      example: '3 deals moved, 2 new experts, 1 portfolio adjustment',
      type: 'update_summary'
    },
    {
      title: 'Top Deal This Week',
      example: 'Ranked #1 for your criteria: TechStartup Series A',
      type: 'curated_deal'
    },
    {
      title: 'Community Highlights',
      example: '[Expert] closed $5M round — read the thread',
      type: 'social_signal'
    },
    {
      title: 'Your Portfolio Snapshot',
      example: 'On track: +2% toward your annual goal',
      type: 'insight_summary'
    },
    {
      title: 'What to Explore',
      example: 'New community: LP Network — 50 members in your space',
      type: 'suggestion'
    }
  ]
};

const REENGAGEMENT_RULES = {
  trigger: {
    condition: 'No meaningful interaction for X days',
    thresholds: {
      tier_1: '3 days',
      tier_2: '7 days',
      tier_3: '14 days'
    }
  },
  messaging: {
    value_first: 'Lead with what\'s new/relevant, not reminder of inactivity',
    examples: {
      tier_1: '[3 deals] moved this week matching your criteria — want the highlights?',
      tier_2: 'Your portfolio is tracking +1.5% vs goal — [Expert] did a webinar on risk management',
      tier_3: 'You\'ve been exploring [Sector] — here are 5 deals we found for you + 2 experts to follow'
    }
  },
  avoid: [
    'Guilt language ("You haven\'t visited in...")',
    'Fake urgency ("Only 2 spots left...")',
    'Repeat messaging (cooldown 48h between re-engagement attempts)',
    'Intra-session re-engagement (respect active sessions)'
  ],
  cooldown: {
    between_messages: '48 hours',
    after_dismissal: '7 days',
    max_per_week: '2 re-engagement attempts'
  }
};

const PERSONALIZATION_RULES = {
  auto_refine: [
    'Deal recommendations improve from save/view behavior',
    'Portfolio insights based on stated goals + recent deals viewed',
    'Community suggestions from interests + activity'
  ],
  never_ask_again: [
    'onboarding questions already answered',
    'deal criteria if user expressed 5+ preferences',
    'portfolio goals if clearly defined'
  ],
  feedback_triggers: [
    'Day 15: "Are our deal recommendations improving?" (optional)',
    'Day 25: "How\'s your portfolio tracking?" (optional)',
    'Day 30: "What would help you most?" (optional feedback survey)'
  ]
};

const RETENTION_STATE_SCHEMA = {
  structure: {
    user_id: 'string',
    retention_state: {
      phase: 'string (phase_1-4)',
      days_since_activation: 'number',
      activated_at: 'date-time',
      active_habit_loops: {
        discovery: {
          active: 'boolean',
          triggered_count: 'number',
          last_triggered_at: 'date-time',
          actions_taken: 'number (saves, views, dismissals)'
        },
        insight: {
          active: 'boolean',
          triggered_count: 'number',
          insights_generated: 'number'
        },
        social: {
          active: 'boolean',
          triggered_count: 'number',
          joins: 'number',
          follows: 'number'
        }
      },
      weekly_engagement: {
        visits_this_week: 'number',
        streak_weeks: 'number (consecutive weeks with ≥1 visit)',
        total_compounding_actions: 'number',
        last_visit_at: 'date-time'
      },
      digest_preferences: {
        opted_in: 'boolean',
        frequency: 'daily | weekly | biweekly',
        preferred_day: 'monday-sunday',
        preferred_time_utc: 'HH:MM',
        last_sent_at: 'date-time'
      },
      reengagement_tracking: {
        last_active_at: 'date-time',
        inactivity_tier: '0 | 1 | 2 | 3',
        reengage_messages_sent: 'number',
        last_reengagement_at: 'date-time',
        suppressed_until: 'date-time (cooldown)'
      },
      personalization_signals: {
        preferences_refined_count: 'number',
        feedback_provided: 'boolean',
        auto_adjustments: 'array of adjustments made',
        preference_version: 'number (incremented when refined)'
      }
    }
  },
  example: {
    user_id: 'user_456',
    retention_state: {
      phase: 'phase_2',
      days_since_activation: 9,
      activated_at: '2026-01-09T10:00:00Z',
      active_habit_loops: {
        discovery: {
          active: true,
          triggered_count: 7,
          last_triggered_at: '2026-01-17T14:30:00Z',
          actions_taken: 5
        },
        insight: {
          active: false,
          triggered_count: 1,
          insights_generated: 0
        },
        social: {
          active: false,
          triggered_count: 0,
          joins: 0,
          follows: 0
        }
      },
      weekly_engagement: {
        visits_this_week: 3,
        streak_weeks: 1,
        total_compounding_actions: 5,
        last_visit_at: '2026-01-17T14:30:00Z'
      },
      digest_preferences: {
        opted_in: false,
        frequency: 'weekly',
        preferred_day: 'monday',
        preferred_time_utc: '09:00',
        last_sent_at: null
      },
      reengagement_tracking: {
        last_active_at: '2026-01-17T14:30:00Z',
        inactivity_tier: 0,
        reengage_messages_sent: 0,
        last_reengagement_at: null,
        suppressed_until: null
      },
      personalization_signals: {
        preferences_refined_count: 0,
        feedback_provided: false,
        auto_adjustments: [],
        preference_version: 1
      }
    }
  }
};

export default function RetentionDashboard() {
  const [selectedLoop, setSelectedLoop] = useState('discovery');

  return (
    <div className="space-y-8 p-8 bg-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">30-Day Retention & Habit-Loop System</h1>
        <p className="text-gray-600 mt-2">Transform activation into repeat, value-driven usage through intelligent habit loops and progressive personalization</p>
      </div>

      {/* Retention Objectives */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Retention Objectives (Success Definition)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Weekly Return Visits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600">
              ≥1 meaningful session/week indicates habit formation and retention
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Increasing Personalization
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600">
              System refines recommendations from behavior signals; user sees improving accuracy
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600" />
                Compounding Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600">
              ≥1 of: saved deals, portfolio adjustments, community engagement maintained week-over-week
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Habit Loops */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Three Primary Habit Loops</h2>
        <Tabs value={selectedLoop} onValueChange={setSelectedLoop} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {Object.entries(HABIT_LOOPS).map(([key, loop]) => {
              const Icon = loop.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{loop.name.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(HABIT_LOOPS).map(([key, loop]) => {
            const Icon = loop.icon;
            const colorMap = {
              blue: 'bg-blue-50 border-blue-200',
              purple: 'bg-purple-50 border-purple-200',
              green: 'bg-green-50 border-green-200'
            };
            return (
              <TabsContent key={key} value={key}>
                <Card className={`${colorMap[loop.color]} border`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-1" />
                      <div className="flex-1">
                        <CardTitle>{loop.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-2">{loop.trigger}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Flow:</h4>
                      <ol className="space-y-1 text-sm text-gray-700">
                        {loop.flow.map((step, i) => (
                          <li key={i}>
                            <span className="font-medium">{i + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="p-3 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-600"><strong>Reward:</strong> {loop.reward}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2 bg-white rounded">
                        <strong>Frequency:</strong><br />{loop.frequency}
                      </div>
                      <div className="p-2 bg-white rounded">
                        <strong>Example CTA:</strong><br />{loop.example_cta}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </section>

      {/* 30-Day Phases */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 30-Day Retention Phases</h2>
        <div className="space-y-3">
          {Object.entries(RETENTION_PHASES).map(([key, phase]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{phase.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1"><strong>Goal:</strong> {phase.goal}</p>
                  </div>
                  <Badge className="capitalize">{phase.focus.split(' ')[0]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <div><strong className="text-gray-900">Focus:</strong> {phase.focus}</div>
                <div className="mt-3">
                  <strong className="text-gray-900 block mb-2">Tactics:</strong>
                  <ul className="space-y-1 text-gray-600 ml-4 list-disc">
                    {phase.tactics.map((tactic, i) => <li key={i}>{tactic}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Weekly Cadence */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Weekly Cadence (Non-Intrusive)</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personalized Weekly Digest</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{WEEKLY_CADENCE.timing}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong>Optional:</strong> User can opt in/out anytime
              </div>
              <div>
                <strong>Adaptive:</strong> Frequency adjusts based on engagement (daily → weekly → monthly)
              </div>
            </div>
            <div>
              <strong className="text-gray-900 block mb-3">Digest Components:</strong>
              <div className="space-y-2">
                {WEEKLY_CADENCE.components.map((comp, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-sm text-gray-900">{comp.title}</strong>
                        <p className="text-xs text-gray-600 mt-1">{comp.example}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{comp.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Re-Engagement */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Intelligent Re-Engagement (Value-First)</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Re-Engagement Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Trigger Thresholds:</h4>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <strong className="text-yellow-900">Tier 1:</strong> 3 days no activity
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <strong className="text-orange-900">Tier 2:</strong> 7 days no activity
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <strong className="text-red-900">Tier 3:</strong> 14 days no activity
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Messaging Pattern (Value-First):</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded border-l-4 border-yellow-500">
                  <strong>Tier 1:</strong> "[3 deals] moved this week matching your criteria — want the highlights?"
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-orange-500">
                  <strong>Tier 2:</strong> "Your portfolio is tracking +1.5% vs goal — [Expert] did a webinar on risk management"
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                  <strong>Tier 3:</strong> "You've been exploring [Sector] — here are 5 deals we found for you + 2 experts to follow"
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Never Do This:
              </h4>
              <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                {REENGAGEMENT_RULES.avoid.map((rule, i) => <li key={i}>{rule}</li>)}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Cooldown Logic:</h4>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <strong>Between messages:</strong> 48 hours
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <strong>After dismissal:</strong> 7 days
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <strong>Max per week:</strong> 2 attempts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Progressive Personalization */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Progressive Personalization (Auto-Refining)</h2>
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Auto-Refinement Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {PERSONALIZATION_RULES.auto_refine.map((rule, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Never Re-Ask Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {PERSONALIZATION_RULES.never_ask_again.map((rule, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded flex gap-2">
                  <Badge variant="outline" className="text-xs">Suppress</Badge>
                  <span>{rule}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback Triggers (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {PERSONALIZATION_RULES.feedback_triggers.map((trigger, i) => (
                <div key={i} className="p-2 bg-blue-50 rounded border border-blue-200">
                  {trigger}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Retention State Schema */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Retention State Schema (JSON)</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Retention Record Structure</CardTitle>
          </CardHeader>
          <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
            <pre>{JSON.stringify(RETENTION_STATE_SCHEMA.example, null, 2)}</pre>
          </CardContent>
        </Card>
      </section>

      {/* Implementation */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Implementation Roadmap</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 1: Foundation</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Add retention_state to UserProfile</div>
              <div>☐ Create HabitLoopEvent entity</div>
              <div>☐ Create WeeklyDigest entity</div>
              <div>☐ Initialize retention state function</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 2: Habit Loops</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Implement discovery loop triggers</div>
              <div>☐ Implement insight loop triggers</div>
              <div>☐ Implement social proof loop triggers</div>
              <div>☐ Build loop-specific UIs</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 3: Weekly Cadence</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Build weekly digest generator</div>
              <div>☐ Implement digest preferences UI</div>
              <div>☐ Schedule digest delivery</div>
              <div>☐ Track digest engagement</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 4: Re-Engagement</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Implement inactivity detection</div>
              <div>☐ Build re-engagement rules engine</div>
              <div>☐ Implement cooldown logic</div>
              <div>☐ Track re-engagement effectiveness</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Success Metrics (30-Day Target)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-3xl font-bold text-green-600">≥50%</div>
            <p className="text-sm text-gray-700 mt-1">Users with 4+ weeks of visits</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">≥2x</div>
            <p className="text-sm text-gray-700 mt-1">Compounding actions per week vs. first week</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">≥40%</div>
            <p className="text-sm text-gray-700 mt-1">Weekly digest opt-in rate</p>
          </div>
        </div>
      </section>

      {/* Tone & Philosophy */}
      <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Tone & Philosophy</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✓ Design for Trust</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Be a trusted analyst, not a pushy salesman</li>
              <li>• Reference prior actions ("You saved 5 deals...")</li>
              <li>• Show why recommendations matter (context)</li>
              <li>• Respect dismissals and preferences</li>
              <li>• Celebrate progress quietly ("You're on track")</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✗ Avoid</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Daily notifications (habit, not addiction)</li>
              <li>• Guilt language ("You missed...")</li>
              <li>• Fake scarcity ("Only 3 spots...")</li>
              <li>• Re-asking answered questions</li>
              <li>• Over-personalizing (maintain autonomy)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}