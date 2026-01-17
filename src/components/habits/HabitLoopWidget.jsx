import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Users, ChevronRight } from 'lucide-react';

const LOOP_ICONS = {
  discovery: Zap,
  insight: TrendingUp,
  social: Users
};

const LOOP_COLORS = {
  discovery: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  insight: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
  social: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' }
};

const LOOP_NAMES = {
  discovery: 'Discovery Loop',
  insight: 'Insight Loop',
  social: 'Social Loop'
};

export default function HabitLoopWidget({ retentionState, onLoopAction }) {
  const activeLoops = retentionState?.active_habit_loops || {};

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Active Habit Loops</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(activeLoops).map(([loopType, loopData]) => {
          if (!loopData.active) return null;

          const Icon = LOOP_ICONS[loopType];
          const colors = LOOP_COLORS[loopType];
          const loopName = LOOP_NAMES[loopType];

          return (
            <Card key={loopType} className={`${colors.bg} border ${colors.border}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <CardTitle className="text-sm">{loopName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-600">
                  <div>Triggered: <span className="font-semibold text-gray-900">{loopData.triggered_count || 0}x</span></div>
                  <div>Actions: <span className="font-semibold text-gray-900">{loopData.actions_taken || 0}</span></div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLoopAction?.(loopType)}
                  className="w-full text-xs gap-1 h-7"
                >
                  Explore <ChevronRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}