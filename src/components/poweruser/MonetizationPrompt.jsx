import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, Lock } from 'lucide-react';

/**
 * Contextual monetization prompt.
 * Shown during relevant tasks with clear value statement and dismiss option.
 */

export default function MonetizationPrompt({
  moment,
  onUpgrade,
  onDismiss,
  onPreview
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 max-w-md z-50 animate-in slide-in-from-bottom-4">
      <Card className="shadow-lg border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base text-gray-900">{moment.headline}</CardTitle>
              <p className="text-xs text-gray-600 mt-1 italic">
                "We noticed you're ready for this upgrade"
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          <p className="text-sm text-gray-700">{moment.description}</p>

          {/* Value Statement (highlight) */}
          <div className="p-3 bg-green-100 rounded border border-green-300">
            <p className="text-sm font-semibold text-green-900">💡 {moment.value_statement}</p>
          </div>

          {/* What's Free / What Improves */}
          <div className="text-xs space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                <strong>Stays free:</strong> Basic [feature] always included
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                <strong>Upgrade unlocks:</strong> Unlimited usage + advanced options
              </span>
            </div>
          </div>

          {/* Pricing Badge */}
          <div className="p-2 bg-gray-100 rounded text-xs text-center">
            <Badge className="bg-blue-600">{moment.price}</Badge>
            <p className="text-gray-600 text-xs mt-1">or 14-day free trial</p>
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-sm"
            >
              {moment.ctaMain}
            </Button>
            <Button
              onClick={onDismiss}
              variant="outline"
              className="flex-1 h-8 text-sm"
            >
              {moment.ctaSecondary}
            </Button>
          </div>

          {/* Trust signals */}
          <p className="text-xs text-gray-500 text-center">
            ✓ Cancel anytime • No hidden fees • Money-back guarantee
          </p>
        </CardContent>
      </Card>
    </div>
  );
}