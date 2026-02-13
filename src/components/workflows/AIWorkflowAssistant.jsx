import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Wand2, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIWorkflowAssistant({ onWorkflowGenerated, currentWorkflow, onOptimizationApplied }) {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizations, setOptimizations] = useState(null);
  const [showOptimizations, setShowOptimizations] = useState(false);

  const handleGenerateWorkflow = async () => {
    if (!description.trim()) {
      toast.error('Please enter a workflow description');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateWorkflowFromDescription', {
        description
      });

      if (data.success) {
        toast.success('Workflow template generated!');
        onWorkflowGenerated?.(data.workflow);
        setDescription('');
      }
    } catch (error) {
      toast.error('Failed to generate workflow');
    }
    setGenerating(false);
  };

  const handleAnalyzeWorkflow = async () => {
    if (!currentWorkflow) {
      toast.error('No workflow selected');
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await base44.functions.invoke('optimizeWorkflow', {
        workflow_id: currentWorkflow.id,
        workflow_config: currentWorkflow.config || currentWorkflow
      });

      if (data.success) {
        setOptimizations(data.analysis);
        setShowOptimizations(true);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      toast.error('Failed to analyze workflow');
    }
    setAnalyzing(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate from Description */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              Generate from Description
            </CardTitle>
            <p className="text-sm text-gray-400">
              Describe your workflow in plain English and let AI create it
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., Send an email notification when a new product is added to the catalog, then update the inventory and post to Slack"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-700 border-gray-600 min-h-[120px]"
            />
            <Button
              onClick={handleGenerateWorkflow}
              disabled={generating || !description.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Optimize Existing */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Optimize Current Workflow
            </CardTitle>
            <p className="text-sm text-gray-400">
              Get AI-powered suggestions to improve performance and reliability
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentWorkflow ? (
              <>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm font-medium">{currentWorkflow.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentWorkflow.description || 'No description'}
                  </p>
                </div>
                <Button
                  onClick={handleAnalyzeWorkflow}
                  disabled={analyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze & Optimize
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a workflow to analyze</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optimizations Dialog */}
      <Dialog open={showOptimizations} onOpenChange={setShowOptimizations}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Workflow Optimization Analysis
            </DialogTitle>
          </DialogHeader>
          {optimizations && (
            <div className="space-y-6 mt-4">
              {/* Overall Score */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge className={`text-lg ${
                    optimizations.overall_score >= 80 ? 'bg-green-600' :
                    optimizations.overall_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    {optimizations.overall_score}/100
                  </Badge>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      optimizations.overall_score >= 80 ? 'bg-green-500' :
                      optimizations.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${optimizations.overall_score}%` }}
                  />
                </div>
              </div>

              {/* Priority Actions */}
              {optimizations.priority_actions?.length > 0 && (
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg">Priority Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {optimizations.priority_actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Optimizations */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Recommended Optimizations</h3>
                {optimizations.optimizations?.map((opt, idx) => (
                  <Card key={idx} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            opt.severity === 'critical' ? 'destructive' :
                            opt.severity === 'high' ? 'default' : 'outline'
                          }>
                            {opt.severity}
                          </Badge>
                          <Badge variant="outline">{opt.category}</Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{opt.title}</h4>
                      <p className="text-sm text-gray-300 mb-2">{opt.description}</p>
                      <div className="bg-gray-600 p-3 rounded-md mt-3">
                        <p className="text-xs font-medium text-blue-300 mb-1">Recommendation:</p>
                        <p className="text-sm">{opt.recommendation}</p>
                      </div>
                      <div className="bg-gray-600 p-3 rounded-md mt-2">
                        <p className="text-xs font-medium text-green-300 mb-1">Expected Impact:</p>
                        <p className="text-sm">{opt.impact}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Estimated Improvements */}
              {optimizations.estimated_improvement && (
                <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Estimated Improvements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-300">Speed</p>
                        <p className="text-lg font-bold text-green-400">
                          {optimizations.estimated_improvement.speed}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">Reliability</p>
                        <p className="text-lg font-bold text-green-400">
                          {optimizations.estimated_improvement.reliability}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">Cost</p>
                        <p className="text-lg font-bold text-green-400">
                          {optimizations.estimated_improvement.cost}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}