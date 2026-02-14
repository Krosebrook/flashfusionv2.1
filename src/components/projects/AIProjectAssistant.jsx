import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AIProjectAssistant({ open, onClose, onProjectCreated }) {
  const [keywords, setKeywords] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    type: '',
    framework: '',
    features: [],
    tech_stack: []
  });
  const [suggestions, setSuggestions] = useState(null);

  const generateDescription = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter some keywords');
      return;
    }

    setGeneratingDescription(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on these keywords: "${keywords}", generate a comprehensive, professional project description (2-3 paragraphs) that includes:
- What the project does
- Target audience
- Key value propositions
- Main features

Be specific and actionable. Write in a business/technical style.`,
      });

      setProjectData({ ...projectData, description: result });
      toast.success('Description generated!');
    } catch (error) {
      toast.error('Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateSuggestions = async () => {
    if (!projectData.description && !keywords) {
      toast.error('Add keywords or description first');
      return;
    }

    setGeneratingSuggestions(true);
    try {
      const context = projectData.description || keywords;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this project: "${context}"

Suggest the best technology stack and frameworks. Return JSON with:
- project_type: (web/mobile/desktop/ecommerce/api)
- recommended_framework: specific framework name
- tech_stack: array of 5-8 relevant technologies
- features: array of 6-10 suggested features
- estimated_complexity: (simple/moderate/complex)
- development_time_estimate: string like "2-4 weeks"

Be specific and practical.`,
        response_json_schema: {
          type: "object",
          properties: {
            project_type: { type: "string" },
            recommended_framework: { type: "string" },
            tech_stack: { type: "array", items: { type: "string" } },
            features: { type: "array", items: { type: "string" } },
            estimated_complexity: { type: "string" },
            development_time_estimate: { type: "string" }
          }
        }
      });

      setSuggestions(result);
      toast.success('Suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const applyAllSuggestions = () => {
    if (!suggestions) return;

    setProjectData({
      ...projectData,
      type: suggestions.project_type,
      framework: suggestions.recommended_framework,
      features: suggestions.features,
      tech_stack: suggestions.tech_stack
    });

    toast.success('Settings applied!');
  };

  const createProject = async () => {
    if (!projectData.name || !projectData.description) {
      toast.error('Name and description required');
      return;
    }

    try {
      const project = await base44.entities.Project.create({
        name: projectData.name,
        description: projectData.description,
        type: projectData.type || 'web',
        framework: projectData.framework || 'React',
        status: 'draft',
        metadata: {
          features: projectData.features,
          tech_stack: projectData.tech_stack,
          ai_assisted: true,
          complexity: suggestions?.estimated_complexity,
          estimated_time: suggestions?.development_time_estimate
        }
      });

      toast.success('Project created!');
      onProjectCreated?.(project);
      onClose();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Project Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Keywords */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-sm">1</span>
                Start with Keywords
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Keywords</Label>
                <Input
                  placeholder="e.g., AI chatbot, customer support, automation"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <Button
                onClick={generateDescription}
                disabled={generatingDescription}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {generatingDescription ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Description
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Project Details */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-sm">2</span>
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  placeholder="My Awesome Project"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="bg-gray-800 border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="AI-generated description will appear here..."
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="bg-gray-800 border-gray-600 min-h-[120px]"
                />
              </div>

              <Button
                onClick={generateSuggestions}
                disabled={generatingSuggestions || (!projectData.description && !keywords)}
                variant="outline"
                className="w-full"
              >
                {generatingSuggestions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: AI Suggestions */}
          {suggestions && (
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    AI Recommendations
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={applyAllSuggestions}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Apply All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Project Type</p>
                    <Badge className="bg-blue-600">{suggestions.project_type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Complexity</p>
                    <Badge className="bg-yellow-600">{suggestions.estimated_complexity}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Framework</p>
                    <Badge className="bg-green-600">{suggestions.recommended_framework}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Est. Time</p>
                    <Badge className="bg-purple-600">{suggestions.development_time_estimate}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.tech_stack.map((tech, i) => (
                      <Badge key={i} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Suggested Features</p>
                  <ul className="space-y-1">
                    {suggestions.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={createProject}
              disabled={!projectData.name || !projectData.description}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Create Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}