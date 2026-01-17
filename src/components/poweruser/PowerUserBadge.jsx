import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Zap, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

/**
 * Power-user status indicator showing unlocked tiers and signal strength.
 */

export default function PowerUserBadge({ powerUserState, compact = false }) {
  if (!powerUserState) return null;

  const { signal_scores, unlocked_tiers } = powerUserState;
  const unlockedCount = Object.values(unlocked_tiers || {}).filter(t => t.unlocked).length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {unlockedCount > 0 && (
          <Badge className="bg-yellow-500 text-white gap-1">
            <Zap className="w-3 h-3" />
            Power User {unlockedCount > 0 && `Tier ${unlockedCount}`}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            Power-User Status
          </h3>
          {unlockedCount > 0 && (
            <Badge className="bg-green-600">
              {unlockedCount} Tier{unlockedCount > 1 ? 's' : ''} Unlocked
            </Badge>
          )}
        </div>

        {/* Signal Scores */}
        <div className="space-y-2 mb-4">
          <SignalBar
            name="Deal Momentum"
            score={signal_scores?.deal_momentum || 0}
            icon={Zap}
          />
          <SignalBar
            name="Portfolio Engagement"
            score={signal_scores?.portfolio_engagement || 0}
            icon={TrendingUp}
          />
          <SignalBar
            name="Social Presence"
            score={signal_scores?.social_presence || 0}
            icon={Users}
          />
        </div>

        {/* Unlocked Tiers */}
        <div className="text-sm">
          <p className="text-gray-600 font-medium mb-2">Unlocked Capabilities:</p>
          <div className="space-y-1">
            {Object.entries(unlocked_tiers || {})
              .filter(([_, t]) => t.unlocked)
              .map(([tier, data]) => (
                <div key={tier} className="flex items-center gap-2 text-xs text-gray-700">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span>
                    <strong>Tier {tier.split('_')[1]}:</strong> {data.capabilities_enabled?.length || 0} capabilities
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SignalBar({ name, score, icon: Icon }) {
  const colorClass =
    score >= 70 ? 'bg-green-500' :
    score >= 50 ? 'bg-yellow-500' :
    'bg-gray-300';

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
      <span className="text-xs font-medium text-gray-700 w-32">{name}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-900 w-8 text-right">{score}</span>
    </div>
  );
}