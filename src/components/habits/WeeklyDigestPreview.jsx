import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Zap, TrendingUp, Users } from 'lucide-react';

const COMPONENT_ICONS = {
  update_summary: Zap,
  curated_deal: TrendingUp,
  social_signal: Users,
  insight_summary: TrendingUp,
  suggestion: Bell
};

export default function WeeklyDigestPreview({
  digest,
  digestPrefs,
  onOptIn,
  onOptOut,
  onCustomize
}) {
  const [expanded, setExpanded] = useState(false);

  if (!digest || digest.components.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Your Weekly Digest
          </CardTitle>
          {digestPrefs?.opted_in && (
            <Badge className="bg-blue-600">Subscribed</Badge>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Personalized summary of deals, insights, and community activity
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preview of first 3 components */}
        {digest.components.slice(0, 3).map((comp, idx) => {
          const Icon = COMPONENT_ICONS[comp.type] || Bell;
          return (
            <div key={idx} className="p-2 bg-white rounded border border-blue-100">
              <div className="flex items-start gap-2">
                <Icon className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900">{comp.title}</p>
                  {comp.data && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {JSON.stringify(comp.data).substring(0, 50)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {digest.components.length > 3 && (
          <p className="text-xs text-gray-600 text-center">
            +{digest.components.length - 3} more sections
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {digestPrefs?.opted_in ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onCustomize}
                className="flex-1 text-xs h-7"
              >
                Customize
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onOptOut}
                className="flex-1 text-xs h-7 text-gray-600"
              >
                Unsubscribe
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={onOptIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-7"
            >
              Subscribe to Weekly Digest
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          {digestPrefs?.frequency} on {digestPrefs?.preferred_day}s at {digestPrefs?.preferred_time_utc}
        </p>
      </CardContent>
    </Card>
  );
}