import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, TrendingUp, RotateCcw, Eye } from 'lucide-react';

/**
 * Unified Lifecycle Dashboard
 * Shows current state, churn risk, active interventions, and state history
 */

const STATE_ICONS = {
  new: Eye,
  activated: TrendingUp,
  engaged: TrendingUp,
  power_user: TrendingUp,
  at_risk: AlertCircle,
  dormant: RotateCcw,
  returning: RotateCcw
};

const STATE_COLORS = {
  new: 'blue',
  activated: 'green',
  engaged: 'purple',
  power_user: 'gold',
  at_risk: 'orange',
  dormant: 'red',
  returning: 'teal'
};

export default function LifecycleDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLifecycleData();
  }, []);

  const fetchLifecycleData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      setProfile(profiles[0]);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!profile) return <div className="p-8">No profile found</div>;

  const lifecycle = profile.lifecycle_state || {};
  const churnRisk = lifecycle.churn_risk || {};
  const Icon = STATE_ICONS[lifecycle.current_state] || Eye;

  const riskColor =
    churnRisk.tier === 'low' ? 'green' :
    churnRisk.tier === 'medium' ? 'yellow' : 'red';

  return (
    <div className="space-y-8 p-8">
      {/* Header: Current State */}
      <div className={`bg-${STATE_COLORS[lifecycle.current_state]}-50 p-6 rounded-lg border border-${STATE_COLORS[lifecycle.current_state]}-200`}>
        <div className="flex items-center gap-4">
          <Icon className="w-8 h-8" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{lifecycle.current_state}</h1>
            <p className="text-gray-600 text-sm mt-1">Current lifecycle stage</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Churn Risk Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Churn Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold text-${riskColor}-600`}>
                {churnRisk.score || 0}
              </div>
              <Badge className={`mt-2 bg-${riskColor}-600`}>
                {churnRisk.tier || 'low'} Risk
              </Badge>
            </div>

            {churnRisk.components && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Engagement Velocity:</span>
                  <span className="font-bold">{churnRisk.components.engagement_velocity}%</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Habit Loop Health:</span>
                  <span className="font-bold">{churnRisk.components.habit_loop_health}%</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Nudge Dismissal:</span>
                  <span className="font-bold">{churnRisk.components.nudge_dismissal_rate}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Signals */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Sessions Last 7 Days:</span>
              <span className="font-bold">{lifecycle.engagement_signals?.sessions_last_7_days || 0}</span>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Active Loops:</p>
              <div className="flex flex-wrap gap-1">
                {lifecycle.engagement_signals?.active_habit_loops?.length > 0 ? (
                  lifecycle.engagement_signals.active_habit_loops.map(loop => (
                    <Badge key={loop} className="bg-green-600">{loop}</Badge>
                  ))
                ) : (
                  <Badge variant="outline">None</Badge>
                )}
              </div>
            </div>
            {lifecycle.engagement_signals?.inactive_habit_loops?.length > 0 && (
              <div>
                <p className="text-gray-600 mb-1">Inactive Loops:</p>
                <div className="flex flex-wrap gap-1">
                  {lifecycle.engagement_signals.inactive_habit_loops.map(loop => (
                    <Badge key={loop} variant="outline" className="text-gray-600">{loop}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Interventions */}
      {lifecycle.interventions?.active_interventions?.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Active Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lifecycle.interventions.active_interventions.map((intervention, i) => (
                <div key={i} className="p-3 bg-white rounded border border-orange-200">
                  <p className="font-medium text-sm text-gray-900">{intervention.intervention_id}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Playbook: <Badge variant="outline">{intervention.playbook}</Badge>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Experience Adaptation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {lifecycle.experience_settings && Object.entries(lifecycle.experience_settings).map(([key, value]) => {
              if (key === 'suppress_upsells') return null;
              return (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}:</p>
                  <Badge variant="outline">{value}</Badge>
                </div>
              );
            })}
          </div>
          {lifecycle.experience_settings?.suppress_upsells && (
            <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
              <p className="text-xs text-red-800">⚠ Upsells suppressed due to churn risk or state</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* State History Timeline */}
      {lifecycle.state_history?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>State Transition History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...lifecycle.state_history].reverse().map((entry, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge className="capitalize">{entry.state}</Badge>
                    <span className="text-xs text-gray-600">
                      {new Date(entry.entered_at).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.trigger_signal && (
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Trigger:</strong> {entry.trigger_signal}
                    </p>
                  )}
                  {entry.duration_days && (
                    <p className="text-xs text-gray-600">
                      Duration: {entry.duration_days} days
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}