import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, TrendingDown, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowPerformanceInsights({ workflow, executionHistory }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzePerformance = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('analyzeWorkflowPerformance', {
        workflow_id: workflow.id,
        execution_history: executionHistory || []
      });

      if (data.success) {
        setInsights(data.analysis);
        toast.success('Performance analysis complete');
      }
    } catch (error) {
      toast.error('Failed to analyze performance');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (workflow && executionHistory?.length > 0) {
      analyzePerformance();
    }
  }, [workflow?.id]);

  if (!workflow) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">Select a workflow to view performance insights</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-400">Analyzing workflow performance...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 mb-4">No performance data available</p>
          <Button onClick={analyzePerformance} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="w-4 h-4 mr-2" />
            Analyze Performance
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Health Status</p>
                <Badge className={`mt-2 ${getHealthColor(insights.health_status)}`}>
                  {insights.health_status?.toUpperCase()}
                </Badge>
              </div>
              <Activity className="w-12 h-12 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Performance Score</p>
                <p className="text-3xl font-bold mt-1">{insights.performance_score}/100</p>
              </div>
              <TrendingDown className={`w-12 h-12 ${
                insights.performance_score >= 80 ? 'text-green-400' :
                insights.performance_score >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottlenecks */}
      {insights.bottlenecks?.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Performance Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.bottlenecks.map((bottleneck, idx) => (
              <Card key={idx} className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{bottleneck.step_name}</h4>
                      <p className="text-xs text-gray-400">{bottleneck.step_id}</p>
                    </div>
                    <Badge className={getImpactColor(bottleneck.impact)}>
                      {bottleneck.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{bottleneck.issue}</p>
                  <div className="bg-gray-600 p-3 rounded-md">
                    <p className="text-xs font-medium text-gray-300 mb-1">Average Duration:</p>
                    <p className="text-sm font-bold text-yellow-400">{bottleneck.avg_duration}ms</p>
                  </div>
                  <div className="bg-gray-600 p-3 rounded-md mt-2">
                    <p className="text-xs font-medium text-green-300 mb-1">Recommendation:</p>
                    <p className="text-sm">{bottleneck.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Error Patterns */}
      {insights.error_patterns?.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Error Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.error_patterns.map((pattern, idx) => (
              <Card key={idx} className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{pattern.pattern}</h4>
                    <Badge variant="outline">{pattern.frequency}</Badge>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="bg-gray-600 p-2 rounded">
                      <p className="text-xs text-gray-400">Root Cause:</p>
                      <p className="text-sm">{pattern.root_cause}</p>
                    </div>
                    <div className="bg-gray-600 p-2 rounded">
                      <p className="text-xs text-green-300">Solution:</p>
                      <p className="text-sm">{pattern.solution}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations?.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Predicted Improvements */}
      {insights.predicted_improvements && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Predicted Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Speed</p>
                <p className="text-lg font-bold text-green-400 mt-1">
                  {insights.predicted_improvements.speed}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Reliability</p>
                <p className="text-lg font-bold text-green-400 mt-1">
                  {insights.predicted_improvements.reliability}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={analyzePerformance} variant="outline" className="w-full">
        <Zap className="w-4 h-4 mr-2" />
        Re-analyze Performance
      </Button>
    </div>
  );
}