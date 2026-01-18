import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertCircle, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';

export default function DealScoreCard({ deal, onSave, compact = false }) {
  const [scoring, setScoring] = useState(deal.ai_scoring || null);
  const [loading, setLoading] = useState(false);

  const scoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const scoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  const recommendationBadge = (rec) => {
    const config = {
      strong_match: { label: 'Strong Match', className: 'bg-green-600' },
      good_match: { label: 'Good Match', className: 'bg-blue-600' },
      moderate_match: { label: 'Moderate', className: 'bg-yellow-600' },
      weak_match: { label: 'Weak Match', className: 'bg-gray-600' }
    };
    return config[rec] || config.moderate_match;
  };

  const fetchScoring = async () => {
    if (scoring) return;
    setLoading(true);
    try {
      const response = await base44.functions.invoke('scoreDeal', {
        deal_id: deal.id,
        user_email: (await base44.auth.me()).email
      });
      setScoring(response.scoring);
    } catch (err) {
      console.error('Failed to score deal:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (deal.ai_scoring) {
      setScoring(deal.ai_scoring);
    }
  }, [deal]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          {scoring ? (
            <>
              <div className={`text-xl font-bold ${scoreColor(scoring.overall_score)}`}>
                {scoring.overall_score}
              </div>
              <Badge className={recommendationBadge(scoring.recommendation).className}>
                {recommendationBadge(scoring.recommendation).label}
              </Badge>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={fetchScoring} disabled={loading}>
              {loading ? 'Scoring...' : 'Get AI Score'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={scoring ? scoreBg(scoring.overall_score) : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Deal Analysis
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">{deal.company_name}</p>
          </div>
          {scoring && (
            <div className="text-right">
              <div className={`text-3xl font-bold ${scoreColor(scoring.overall_score)}`}>
                {scoring.overall_score}
              </div>
              <Badge className={`${recommendationBadge(scoring.recommendation).className} mt-1`}>
                {recommendationBadge(scoring.recommendation).label}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scoring && (
          <div className="text-center py-4">
            <Button onClick={fetchScoring} disabled={loading}>
              {loading ? 'Analyzing Deal...' : 'Analyze with AI'}
            </Button>
          </div>
        )}

        {scoring && (
          <>
            {/* Dimension Scores */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Fit Analysis</h4>
              <div className="space-y-2">
                {Object.entries(scoring.dimension_scores || {}).map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold">{score}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            {scoring.key_strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Key Strengths
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {scoring.key_strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {scoring.potential_concerns?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Considerations
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {scoring.potential_concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasoning */}
            <div className="p-3 bg-white rounded border border-gray-300">
              <p className="text-sm text-gray-700">{scoring.reasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => onSave?.(deal)} className="flex-1">
                Save Deal
              </Button>
              {deal.source_url && (
                <Button variant="outline" asChild>
                  <a href={deal.source_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>

            <div className="text-xs text-gray-500 text-center">
              Confidence: <Badge variant="outline">{scoring.confidence}</Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}