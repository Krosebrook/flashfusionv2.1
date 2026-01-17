import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, Users, Calendar, CheckCircle2 } from 'lucide-react';

/**
 * Unified Engagement Dashboard
 * Consolidates: Onboarding → Activation → Retention (Days 1-30+)
 */

const STAGE_CONFIG = {
  onboarded: {
    title: 'Welcome Aboard',
    description: 'Complete your first interaction to get activated',
    color: 'blue',
    icon: '🎯'
  },
  activated: {
    title: 'Active User',
    description: 'Building your first value-driven habit loop',
    color: 'green',
    icon: '⚡'
  },
  retained: {
    title: 'Retained Member',
    description: 'Compounding value from your habits',
    color: 'purple',
    icon: '✨'
  }
};

export default function EngagementDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email
      });
      setProfile(profiles[0]);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">No profile found</div>;

  const engagement = profile.engagement_state || {};
  const stageConfig = STAGE_CONFIG[engagement.stage] || STAGE_CONFIG.onboarded;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{stageConfig.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stageConfig.title}</h1>
            <p className="text-gray-600 text-sm mt-1">{stageConfig.description}</p>
          </div>
        </div>
        <Badge className="mt-4 capitalize">{engagement.activation_path} path</Badge>
      </div>

      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="loops">Habit Loops</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(engagement.milestones || {}).map(([key, achieved]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {achieved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Habit Loops Tab */}
        <TabsContent value="loops">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(engagement.habit_loops || {}).map(([key, loop]) => {
              const icons = { discovery: Zap, insight: TrendingUp, social: Users };
              const Icon = icons[key];
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>Triggered: <span className="font-bold">{loop.triggered_count || 0}x</span></div>
                    <div>Actions: <span className="font-bold">{loop.actions_taken || 0}</span></div>
                    <Badge variant={loop.active ? 'default' : 'outline'} className="mt-2">
                      {loop.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>Visits this week: <span className="font-bold">{engagement.weekly_engagement?.visits_this_week || 0}</span></div>
                <div>Streak: <span className="font-bold">{engagement.weekly_engagement?.streak_weeks || 0} weeks</span></div>
                <div>Total actions: <span className="font-bold">{engagement.weekly_engagement?.total_compounding_actions || 0}</span></div>
              </CardContent>
            </Card>

            {engagement.digest?.opted_in && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Digest</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>Frequency: <span className="font-bold capitalize">{engagement.digest.frequency}</span></div>
                  <div>Day: <span className="font-bold capitalize">{engagement.digest.preferred_day}</span></div>
                  <div>Time: <span className="font-bold">{engagement.digest.preferred_time_utc} UTC</span></div>
                </CardContent>
              </Card>
            )}

            {engagement.reengagement?.inactivity_tier > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-base text-orange-900">Inactive Since</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-orange-800">
                  Tier {engagement.reengagement.inactivity_tier} re-engagement active
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}