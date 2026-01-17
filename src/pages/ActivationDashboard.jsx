"use client";
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, Zap, Target, Users, TrendingUp } from 'lucide-react';

/**
 * POST-ONBOARDING ACTIVATION SYSTEM
 * 
 * Activation Milestones (Non-Negotiable):
 * 1. First Deal Engagement — view ≥1 deal & save ≥1 within 7 days
 * 2. Portfolio Configuration — create goal(s) or review metrics within 7 days
 * 3. Community Participation — follow/join/view ≥1 discussion within 7 days
 * 
 * Success = User achieves ≥1 milestone within first session or 7 days → "Activated"
 * 
 * Adaptive Paths:
 * - Deal-First: Strong sourcing preferences, specific industries/sizes
 * - Portfolio-First: Clear goals, returns-focused, long-term horizon
 * - Community-First: Values learning, networking, peer validation
 * - Balanced: No clear signal, rotate guides every 2 sessions
 */

const ACTIVATION_MILESTONES = {
  first_deal_viewed: {
    title: 'View Your First Deal',
    description: 'Explore an investment opportunity matching your criteria',
    icon: Zap,
    surface: 'DealSourcer page',
    trigger: 'Deal sourcing preferences strong'
  },
  first_deal_saved: {
    title: 'Save a Deal',
    description: 'Save a deal to your watchlist to improve recommendations',
    icon: Target,
    description_hint: 'Builds a better feed for you',
    trigger: 'After viewing first deal'
  },
  portfolio_goal_created: {
    title: 'Create a Portfolio Goal',
    description: 'Set your return target and time horizon',
    icon: TrendingUp,
    surface: 'Portfolio/Analytics',
    trigger: 'Portfolio setup preferences exist',
    contextual_prompt: 'When viewing analytics without goals'
  },
  community_joined: {
    title: 'Join a Community',
    description: 'Connect with peers in your sectors',
    icon: Users,
    surface: 'Community Hub',
    trigger: 'Community preferences indicate networking interest',
    contextual_prompt: 'When viewing community with no memberships'
  }
};

const ACTIVATION_PATHS = {
  deal_first: {
    label: 'Deal-First',
    trigger_logic: 'strong deal sourcing criteria (≥3 industries, investment sizes)',
    session_goal: '3-5 personalized deals viewed, ≥1 saved',
    guidance: [
      'Landing: "You have 47 deals matching your criteria"',
      'Session 1-2: Highlight save button, show relevance scores',
      'Detail page: "Why this matches you" (industries, size, structure)',
      'Progress: "1/3 deals saved" badges'
    ],
    nudges_timeline: {
      'Day 1 (no views)': 'Your first deal is ready — [View Now]',
      'Day 3 (viewed, not saved)': 'Save one to improve your recommendations',
      'Day 5 (inactive)': 'Want help finding deals in [Industry]?'
    }
  },
  portfolio_first: {
    label: 'Portfolio-First',
    trigger_logic: 'target annual return ≥15% OR long_term horizon',
    session_goal: '≥1 goal created, projected outcome reviewed',
    guidance: [
      'Landing: "Link your goals to real opportunities"',
      'Session 1-2: Quick goal setup (ROI %, time horizon, allocation)',
      'Show projected outcome (5-yr projection chart)',
      'Dashboard: Deals filtered to goal-aligned opportunities'
    ],
    nudges_timeline: {
      'Day 1': 'Create your first goal in 90 seconds — [Set Up]',
      'Day 3 (goals exist, no deals saved)': 'These 5 deals match your $X target',
      'Day 5 (low portfolio balance)': 'Explore portfolio templates for your strategy'
    }
  },
  community_first: {
    label: 'Community-First',
    trigger_logic: 'networking preference OR ≥2 peer group interests',
    session_goal: '≥1 group joined OR ≥1 expert followed',
    guidance: [
      'Landing: "Meet your peers in [Sector]"',
      'Session 1-2: Show best discussions, group previews',
      'CTA: "Preview as guest" or "Join now"',
      'Expert discovery: Show profiles with track record'
    ],
    nudges_timeline: {
      'Day 1': 'Join [Group] — 200+ investors in your space',
      'Day 3 (viewing feed, not joined)': 'Get exclusive deal flow + monthly sessions',
      'Day 5 (multiple groups viewed)': 'Join for real-time syndicate access'
    }
  },
  balanced: {
    label: 'Balanced (Default)',
    trigger_logic: 'no clear signal',
    session_goal: 'rotate through all paths, analyze first engagement',
    guidance: [
      'Session 1: Deal teaser',
      'Session 2: Portfolio brief',
      'Session 3: Community intro',
      'Then switch to strongest path based on engagement'
    ]
  }
};

const GUIDANCE_SURFACES = [
  {
    name: 'Inline Card',
    use_case: 'Hook (landing, first session)',
    dismissible: true,
    cooldown: '2h',
    example: 'Deal card: "You have 47 deals matching your criteria"'
  },
  {
    name: 'Spotlight + Tooltip',
    use_case: 'Feature introduction (first visit)',
    dismissible: true,
    cooldown: 'Never resurface',
    example: 'Highlight save button with "Saved deals improve your feed"'
  },
  {
    name: 'Progress Badge',
    use_case: 'Milestone tracking',
    dismissible: false,
    cooldown: '—',
    example: '"2/3 deals saved" counter'
  },
  {
    name: 'Nudge Toast',
    use_case: 'Reminder (inactivity nudge)',
    dismissible: true,
    cooldown: '24h',
    example: 'Day 5 toast: "Want help finding deals in Tech?"'
  },
  {
    name: 'Side Panel',
    use_case: 'Guided walkthrough (optional)',
    dismissible: true,
    cooldown: '1h',
    example: 'Portfolio setup panel'
  }
];

export default function ActivationDashboard() {
  const [activationData, setActivationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivationData();
  }, []);

  const fetchActivationData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email
      });
      if (profiles[0]) {
        setActivationData(profiles[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch activation data:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading activation status...</div>;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activation System Reference</h1>
        <p className="text-gray-600 mt-2">Post-onboarding guidance framework for reaching first moment of value</p>
      </div>

      {/* Activation Milestones */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Activation Milestones (Non-Negotiable)</h2>
        <p className="text-sm text-gray-600 mb-4">Users achieve ≥1 milestone within first session or 7 days → "Activated"</p>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(ACTIVATION_MILESTONES).map(([key, milestone]) => {
            const Icon = milestone.icon;
            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{milestone.title}</CardTitle>
                      <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {milestone.surface && (
                    <div><strong>Surface:</strong> {milestone.surface}</div>
                  )}
                  <div><strong>Trigger:</strong> {milestone.trigger}</div>
                  {milestone.contextual_prompt && (
                    <div className="p-2 bg-blue-50 rounded text-blue-900">
                      <strong>Contextual:</strong> {milestone.contextual_prompt}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Activation Paths */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Adaptive Activation Paths</h2>
        <div className="space-y-4">
          {Object.entries(ACTIVATION_PATHS).map(([key, path]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{path.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">Trigger Logic:</p>
                  <p className="text-xs text-gray-600">{path.trigger_logic}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Session Goal:</p>
                  <p className="text-xs text-gray-600">{path.session_goal}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Guidance Flow:</p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                    {path.guidance.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Nudge Timeline:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    {Object.entries(path.nudges_timeline).map(([timing, nudge]) => (
                      <div key={timing}><strong>{timing}:</strong> {nudge}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Guidance Surfaces */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Lightweight Interactive Guidance Surfaces</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-900">Surface</th>
                <th className="p-3 text-left font-semibold text-gray-900">Use Case</th>
                <th className="p-3 text-left font-semibold text-gray-900">Dismissible?</th>
                <th className="p-3 text-left font-semibold text-gray-900">Cooldown</th>
              </tr>
            </thead>
            <tbody>
              {GUIDANCE_SURFACES.map((surface, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-medium text-gray-900">{surface.name}</td>
                  <td className="p-3 text-gray-600">{surface.use_case}</td>
                  <td className="p-3"><Badge variant={surface.dismissible ? 'default' : 'outline'}>{surface.dismissible ? 'Yes' : 'No'}</Badge></td>
                  <td className="p-3 text-gray-600">{surface.cooldown}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-2">
          <p><strong>Rules:</strong></p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Never block core interaction</li>
            <li>Allow dismiss/snooze on all nudges</li>
            <li>Track dismissal → respect user preferences</li>
            <li>Resume only when contextually relevant</li>
          </ul>
        </div>
      </section>

      {/* Smart Nudges */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Smart Nudges & Timing Logic</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tier 1: Immediate (Session 1)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>📍 <strong>Deal-First:</strong> "You have 47 deals matching your criteria" (inline card, DealSourcer)</div>
              <div>📍 <strong>Portfolio-First:</strong> "Set your first goal in 90 seconds" (modal, dashboard)</div>
              <div>📍 <strong>Community-First:</strong> "Meet 200+ investors in [Sector]" (inline card, community hub)</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tier 2: Engagement Gaps (Day 2-3)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>⚠️ <strong>Viewed but not saved:</strong> "Save 1+ deal to improve recommendations" (toast)</div>
              <div>⚠️ <strong>Goal viewed but not created:</strong> "Projected outcome: $X → $Y over 5 years" (card)</div>
              <div>⚠️ <strong>Community viewed but not joined:</strong> "Join to access exclusive deal syndications" (toast)</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tier 3: Inactivity (Day 5+)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>🔔 <strong>No deal saves:</strong> "Want help finding deals in [Industry]?" (toast + sidebar)</div>
              <div>🔔 <strong>No portfolio setup:</strong> "Portfolio insights unlock when you set a goal" (banner)</div>
              <div>🔔 <strong>No community action:</strong> "Follow [Expert] — recent $X investment in [Sector]" (toast)</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cooldown Logic</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 font-mono">
              <div>IF nudge.dismissed → cooldown = 24h (respect user)</div>
              <div>ELSE IF shown_count ≥ 3 → retire nudge</div>
              <div>ELSE IF surface = toast → cooldown = 2h</div>
              <div>ELSE IF surface = card → cooldown = 4h</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Activation State */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Activation State Schema</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Activation Record (JSON)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded overflow-x-auto">
            <pre>{JSON.stringify({
              "activated": false,
              "activated_path": "deal_first",
              "activation_milestones": {
                "first_deal_viewed": { "achieved": true, "achieved_at": "2026-01-18T14:23Z" },
                "first_deal_saved": { "achieved": false },
                "portfolio_goal_created": { "achieved": false },
                "community_joined": { "achieved": false }
              },
              "active_nudges": [
                { "nudge_id": "deal_first_view", "shown_count": 1, "dismissed": false }
              ],
              "behavioral_signals": {
                "session_count": 1,
                "deals_viewed": 7,
                "deals_saved": 0,
                "time_in_app_minutes": 18
              }
            }, null, 2)}</pre>
          </CardContent>
        </Card>
      </section>

      {/* Implementation Checklist */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Implementation Checklist</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 1: Foundation</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Add activation_state field to UserProfile</div>
              <div>☐ Create ActivationNudge entity</div>
              <div>☐ Create ActivationSignal entity</div>
              <div>☐ Build nudge generation function</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 2: Path Logic</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Path selection algorithm</div>
              <div>☐ Deal-first guidance UI</div>
              <div>☐ Portfolio-first guidance UI</div>
              <div>☐ Community-first guidance UI</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 3: Tracking</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Event tracking (nudges, milestones)</div>
              <div>☐ Daily activation score calculation</div>
              <div>☐ Nudge performance analytics</div>
              <div>☐ A/B testing framework</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Phase 4: Personalization</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>☐ Cooldown logic (respect dismissals)</div>
              <div>☐ Contextual prompt injection</div>
              <div>☐ Path switching logic</div>
              <div>☐ Dynamic nudge generation</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Metrics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Success Metrics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">≥60%</div>
              <p className="text-sm text-gray-600 mt-1">Activation Rate by Day 7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">≤2 sessions</div>
              <p className="text-sm text-gray-600 mt-1">Time to First Milestone</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600">≥25%</div>
              <p className="text-sm text-gray-600 mt-1">Nudge CTR (high-relevance)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600">&lt;30%</div>
              <p className="text-sm text-gray-600 mt-1">Dismissal Rate (respect choice)</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* UX Principles */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Tone & UX Principles</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900">✓ Do This</h4>
            <ul className="text-gray-600 space-y-2 mt-2">
              <li>• Be a smart assistant (anticipate, don't ask)</li>
              <li>• Respect autonomy (suggest, never mandate)</li>
              <li>• Build confidence (celebrate wins early)</li>
              <li>• Use social proof ("200+ investors...")</li>
              <li>• Explain the why (transparency)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">✗ Avoid This</h4>
            <ul className="text-gray-600 space-y-2 mt-2">
              <li>• Blocking core interactions</li>
              <li>• Guilt-tripping ("You haven't...")</li>
              <li>• Fake urgency ("Only 3 spots left!")</li>
              <li>• Hidden defaults or dark patterns</li>
              <li>• Disrespecting dismissals (showing again)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}