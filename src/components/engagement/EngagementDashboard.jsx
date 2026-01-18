import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye, Zap, TrendingUp, Users, AlertCircle, RotateCcw, LogIn,
  ChevronDown, ChevronRight, Target, Award, Calendar, CheckCircle2
} from 'lucide-react';
import MonetizationPrompt from '../poweruser/MonetizationPrompt';
import PowerUserBadge from '../poweruser/PowerUserBadge';

const STATE_CONFIG = {
  new: { icon: Eye, color: 'bg-blue-50 border-blue-200 text-blue-900', badge: 'bg-blue-600' },
  activated: { icon: Zap, color: 'bg-green-50 border-green-200 text-green-900', badge: 'bg-green-600' },
  engaged: { icon: TrendingUp, color: 'bg-purple-50 border-purple-200 text-purple-900', badge: 'bg-purple-600' },
  power_user: { icon: Award, color: 'bg-yellow-50 border-yellow-200 text-yellow-900', badge: 'bg-yellow-600' },
  at_risk: { icon: AlertCircle, color: 'bg-orange-50 border-orange-200 text-orange-900', badge: 'bg-orange-600' },
  dormant: { icon: RotateCcw, color: 'bg-red-50 border-red-200 text-red-900', badge: 'bg-red-600' },
  returning: { icon: LogIn, color: 'bg-teal-50 border-teal-200 text-teal-900', badge: 'bg-teal-600' }
};

const HABIT_LOOPS = {
  discovery: { name: 'Discovery Loop', icon: Zap, color: 'text-blue-600' },
  insight: { name: 'Insight Loop', icon: TrendingUp, color: 'text-purple-600' },
  social: { name: 'Social Loop', icon: Users, color: 'text-green-600' }
};

export default function EngagementDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('overview');
  const [showMonetization, setShowMonetization] = useState(false);
  const [eligibleMoment, setEligibleMoment] = useState(null);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles[0]) {
        setProfile(profiles[0]);
        checkMonetizationEligibility(profiles[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setLoading(false);
    }
  };

  const checkMonetizationEligibility = (profile) => {
    try {
      const powerUser = profile.power_user_state || {};
      const lifecycle = profile.lifecycle_state || {};
      
      // Don't show monetization for at-risk or dormant users
      if (lifecycle.current_state === 'at_risk' || lifecycle.current_state === 'dormant') {
        return;
      }

      // Don't show if already converted
      if (powerUser.monetization?.converted_tiers?.length > 0) {
        return;
      }

      const eligible = powerUser.monetization?.eligible_moments || [];
      if (eligible.length === 0) {
        return;
      }

      // Check if we should show (not recently dismissed)
      const shown = powerUser.monetization?.shown_moments || [];
      const recentlyShown = shown.some(m => {
        try {
          return m.dismissed_at && (new Date() - new Date(m.shown_at) < 14 * 24 * 60 * 60 * 1000);
        } catch {
          return false;
        }
      });
      
      if (!recentlyShown) {
        setEligibleMoment({
          moment_id: eligible[0],
          headline: 'Unlock Advanced Deal Analysis',
          description: 'Compare unlimited deals and access strategic insights.',
          value_statement: 'Power users analyze 3x more deals and make faster decisions.',
          ctaMain: 'Upgrade to Premium',
          ctaSecondary: 'Maybe Later',
          price: '$49/month or $499/year'
        });
        setShowMonetization(true);
      }
    } catch (error) {
      console.error('Monetization check error:', error);
    }
  };

  if (loading) return <div className="p-8">Loading engagement status...</div>;
  if (!profile) return <div className="p-8">No profile found</div>;

  const engagement = profile.engagement_state || {};
  const lifecycle = profile.lifecycle_state || {};
  const powerUser = profile.power_user_state || {};
  const currentState = lifecycle.current_state || engagement.stage || 'new';
  const config = STATE_CONFIG[currentState] || STATE_CONFIG.new;
  const Icon = config.icon;

  const activeLoops = Object.entries(engagement.active_habit_loops || {})
    .filter(([_, loop]) => loop.active)
    .map(([name]) => name);

  const milestones = engagement.milestones || {};
  const churnRisk = lifecycle.churn_risk || {};

  return (
    <div className="space-y-6 p-6">
      {/* Journey Header */}
      <Card className={`${config.color} border-2`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold capitalize">{currentState.replace(/_/g, ' ')}</h1>
                <p className="text-sm opacity-80 mt-1">Your current lifecycle stage</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {engagement.weekly_engagement?.streak_weeks || 0}
              </div>
              <p className="text-sm opacity-80">Week Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{activeLoops.length}</div>
                <div className="text-xs text-gray-600">Active Loops</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(milestones).filter(m => m === true).length}
                </div>
                <div className="text-xs text-gray-600">Milestones</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 ${churnRisk.tier === 'high' ? 'text-red-600' : 'text-green-600'}`} />
              <div>
                <div className="text-2xl font-bold">{churnRisk.score || 0}</div>
                <div className="text-xs text-gray-600">Churn Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(powerUser.unlocked_tiers || {}).filter(t => t.unlocked).length}
                </div>
                <div className="text-xs text-gray-600">Tiers Unlocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={expandedSection} onValueChange={setExpandedSection}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loops">Habit Loops</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="poweruser">Power User</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lifecycle Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Current Stage:</span>
                  <Badge className={config.badge}>{currentState.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Activation Path:</span>
                  <Badge variant="outline">{engagement.activation_path || 'balanced'}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Sessions This Week:</span>
                  <span className="font-bold">{engagement.weekly_engagement?.visits_this_week || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Compounding Actions:</span>
                  <span className="font-bold">{engagement.weekly_engagement?.total_compounding_actions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {lifecycle.state_history?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">State History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...lifecycle.state_history].reverse().slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{entry.state}</Badge>
                        {entry.trigger_signal && (
                          <span className="text-xs text-gray-600">{entry.trigger_signal}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.entered_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Habit Loops Tab */}
        <TabsContent value="loops" className="space-y-4">
          {Object.entries(HABIT_LOOPS).map(([key, loop]) => {
            const loopData = engagement.active_habit_loops?.[key] || {};
            const LoopIcon = loop.icon;
            const isActive = loopData.active || false;

            return (
              <Card key={key} className={isActive ? 'border-2 border-green-200' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LoopIcon className={`w-5 h-5 ${loop.color}`} />
                      <CardTitle className="text-base">{loop.name}</CardTitle>
                    </div>
                    <Badge className={isActive ? 'bg-green-600' : 'bg-gray-400'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">Triggered</div>
                      <div className="text-lg font-bold">{loopData.triggered_count || 0}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">Actions</div>
                      <div className="text-lg font-bold">
                        {loopData.actions_taken || loopData.insights_generated || loopData.joins || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">Last Active</div>
                      <div className="text-xs font-medium">
                        {loopData.last_triggered_at
                          ? new Date(loopData.last_triggered_at).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activation Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries({
                  first_deal_viewed: 'View Your First Deal',
                  first_deal_saved: 'Save a Deal',
                  portfolio_goal_created: 'Create Portfolio Goal',
                  community_joined: 'Join a Community',
                  weekly_return_visit: 'Weekly Return Visit'
                }).map(([key, title]) => {
                  const achieved = milestones[key] === true;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded ${
                        achieved ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      {achieved ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{title}</div>
                      </div>
                      {achieved && <Badge className="bg-green-600">Complete</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-4">
          {lifecycle.interventions?.active_interventions?.length > 0 ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-900">Active Interventions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lifecycle.interventions.active_interventions.map((intervention, i) => (
                  <div key={i} className="p-4 bg-white rounded border border-orange-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm capitalize">
                        {intervention.intervention_id?.replace(/_/g, ' ')}
                      </div>
                      <Badge variant="outline">{intervention.playbook}</Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      Activated: {new Date(intervention.activated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No active interventions. You're on track!</p>
              </CardContent>
            </Card>
          )}

          {churnRisk.score > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Churn Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${
                      churnRisk.tier === 'high'
                        ? 'text-red-600'
                        : churnRisk.tier === 'medium'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {churnRisk.score}
                  </div>
                  <Badge
                    className={`mt-2 ${
                      churnRisk.tier === 'high'
                        ? 'bg-red-600'
                        : churnRisk.tier === 'medium'
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                  >
                    {churnRisk.tier} Risk
                  </Badge>
                </div>

                {churnRisk.components && (
                  <div className="space-y-2 text-sm">
                    {Object.entries(churnRisk.components).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-bold">{value}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Experience Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {lifecycle.experience_settings &&
                  Object.entries(lifecycle.experience_settings).map(([key, value]) => (
                    <div key={key} className="p-2 bg-gray-50 rounded">
                      <div className="text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}:</div>
                      <Badge variant="outline">{String(value)}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Power User Tab */}
        <TabsContent value="poweruser" className="space-y-4">
          <PowerUserBadge powerUserState={powerUser} />

          {powerUser.signal_scores && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signal Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(powerUser.signal_scores).map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold">{score}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {powerUser.unlocked_tiers && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unlocked Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(powerUser.unlocked_tiers).map(([tier, data]) => (
                    <div
                      key={tier}
                      className={`p-3 rounded border ${
                        data.unlocked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm capitalize">
                          {tier.replace(/_/g, ' ')}
                        </span>
                        {data.unlocked && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      </div>
                      {data.unlocked && (
                        <div className="text-xs text-gray-600">
                          <div>Unlocked: {new Date(data.unlocked_at).toLocaleDateString()}</div>
                          <div className="mt-1">
                            Capabilities: {data.capabilities_enabled?.length || 0}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Monetization Prompt */}
      {showMonetization && eligibleMoment && (
        <MonetizationPrompt
          moment={eligibleMoment}
          onUpgrade={() => {
            console.log('Upgrade clicked');
            setShowMonetization(false);
          }}
          onDismiss={() => {
            setShowMonetization(false);
          }}
        />
      )}
    </div>
  );
}