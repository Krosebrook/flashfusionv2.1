import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Lightbulb, Users, TrendingUp } from 'lucide-react';

const ICON_MAP = {
  preference_match: TrendingUp,
  missing_setup: AlertCircle,
  feature_discovery: Lightbulb,
  community_suggestion: Users
};

export default function NudgeCard({ nudge, onDismiss, onAction }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const Icon = ICON_MAP[nudge.nudge_type] || Lightbulb;
  const bgColor =
    nudge.priority === 'high'
      ? 'bg-red-50 border-red-200'
      : nudge.priority === 'medium'
      ? 'bg-blue-50 border-blue-200'
      : 'bg-gray-50 border-gray-200';

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss(nudge.id);
  };

  const handleAction = () => {
    setDismissed(true);
    onAction(nudge.id);
  };

  return (
    <Card className={`${bgColor} border p-4`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600 mt-1" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900">{nudge.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{nudge.description}</p>
          {nudge.trigger_reason && (
            <p className="text-xs text-gray-500 mt-2">
              💡 {nudge.trigger_reason}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {nudge.action_label && nudge.action_url && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button
            size="sm"
            onClick={handleAction}
            className="flex-1"
          >
            {nudge.action_label}
          </Button>
        </div>
      )}
    </Card>
  );
}