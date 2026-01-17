import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Lightbulb, AlertTriangle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

const INSIGHT_ICONS = {
  opportunity: Lightbulb,
  warning: AlertTriangle,
  achievement: CheckCircle2,
  trend: TrendingUp,
  recommendation: Sparkles
};

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const data = await base44.entities.AIInsight.list('-created_date', 10);
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }
  };

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateAIInsights', {});
      if (response.success) {
        fetchInsights();
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'opportunity':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'achievement':
        return 'border-green-200 bg-green-50';
      case 'trend':
        return 'border-purple-200 bg-purple-50';
      case 'recommendation':
        return 'border-pink-200 bg-pink-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI-Driven Insights</h2>
        <Button onClick={generateInsights} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {insights.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              <p>No insights generated yet. Click "Generate Insights" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          insights.map(insight => {
            const IconComponent = INSIGHT_ICONS[insight.type] || Lightbulb;
            return (
              <Card key={insight.id} className={`border-2 ${getInsightColor(insight.type)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                </CardHeader>
                {insight.recommendation && (
                  <CardContent>
                    <div className="bg-white/70 p-3 rounded border-l-2 border-blue-500">
                      <p className="text-sm font-medium text-gray-900">Recommended Action:</p>
                      <p className="text-sm text-gray-700 mt-1">{insight.recommendation}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}