"use client";
import { useState } from "react";
// Fixed: Import from integrations.js instead of non-existent @/integrations/Core
import { InvokeLLM } from "@/api/integrations";
// Fixed: Import base44 client instead of non-existent @/entities/all
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Wand2,
  Loader2,
  Code,
  Smartphone,
  Globe,
  ShoppingCart,
  FileText,
  Sparkles,
  Settings,
  Play,
  Eye,
} from "lucide-react";

const projectTypes = {
  web: {
    icon: Globe,
    name: "Web Application",
    description: "Responsive web apps with modern frameworks",
    frameworks: ["React", "Next.js", "Angular", "Vue.js"],
    baseCredits: 100,
  },
  mobile: {
    icon: Smartphone,
    name: "Mobile App",
    description: "Cross-platform mobile applications",
    frameworks: ["Flutter", "React Native"],
    baseCredits: 150,
  },
  desktop: {
    icon: Code,
    name: "Desktop App",
    description: "Native desktop applications",
    frameworks: ["Electron", "Tauri"],
    baseCredits: 120,
  },
  ecommerce: {
    icon: ShoppingCart,
    name: "E-commerce Store",
    description: "Full-featured online stores",
    frameworks: ["Next.js + Shopify", "React + Stripe"],
    baseCredits: 200,
  },
  content: {
    icon: FileText,
    name: "Content Platform",
    description: "Blogs, portfolios, and content sites",
    frameworks: ["Next.js", "Gatsby", "WordPress"],
    baseCredits: 80,
  },
};

const AgentStatus = ({ agents, activeAgents }) => {
  const allAgents = [
    "Orchestrator",
    "CodeGen",
    "Database",
    "Security",
    "Content",
    "Branding",
    "SEO",
    "Deployment",
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {allAgents.map((agent) => (
        <div
          key={agent}
          className={`p-3 rounded-lg border text-center transition-all ${
            activeAgents.includes(agent)
              ? "bg-blue-500/20 border-blue-500 text-blue-300"
              : "bg-gray-700/50 border-gray-600 text-gray-400"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mx-auto mb-2 ${
              activeAgents.includes(agent)
                ? "bg-blue-400 animate-pulse"
                : "bg-gray-500"
            }`}
          />
          <p className="text-xs font-medium">{agent}</p>
        </div>
      ))}
    </div>
  );
};

export default function UniversalGenerator() {
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    type: "",
    framework: "",
    features: [],
    customInstructions: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeAgents, setActiveAgents] = useState([]);
  const [generatedProject, setGeneratedProject] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const calculateCredits = () => {
    if (!projectData.type) return 0;
    const baseCredits = projectTypes[projectData.type].baseCredits;
    const featureMultiplier = projectData.features.length * 0.2 + 1;
    return Math.round(baseCredits * featureMultiplier);
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    const creditsToUse = calculateCredits();

    try {
      const user = await base44.auth.me();
      if (user.credits_remaining < creditsToUse) {
        setError(`Insufficient credits. You need ${creditsToUse} credits.`);
        setIsGenerating(false);
        return;
      }

      // Create project record
      const project = await base44.entities.Project.create({
        name: projectData.name,
        description: projectData.description,
        type: projectData.type,
        framework: projectData.framework,
        status: "generating",
        config: {
          features: projectData.features,
          customInstructions: projectData.customInstructions,
        },
      });

      // Simulate multi-agent orchestration
      const agentSequence = [
        "Orchestrator",
        "CodeGen",
        "Database",
        "Security",
        "Content",
        "Branding",
        "SEO",
        "Deployment",
      ];

      let progress = 0;
      for (const agent of agentSequence) {
        setActiveAgents([agent]);
        setGenerationProgress(progress);

        // Create agent task
        const task = await base44.entities.AgentTask.create({
          project_id: project.id,
          agent_type: agent,
          task_description: `Generate ${agent.toLowerCase()} for ${projectData.name}`,
          input_data: projectData,
          status: "in_progress",
        });

        // Simulate agent work with actual AI generation for key components
        if (agent === "CodeGen") {
          const codePrompt = `
            Generate a complete ${projectData.type} application using ${projectData.framework}.
            
            Project: ${projectData.name}
            Description: ${projectData.description}
            Features: ${projectData.features.join(", ")}
            
            Requirements:
            - Modern, responsive design
            - Clean, production-ready code
            - Proper file structure
            - Include all necessary dependencies
            - ${projectData.customInstructions || "Follow best practices"}
            
            Generate the complete codebase with file structure.
          `;

          const generatedCode = await InvokeLLM({ prompt: codePrompt });

          await base44.entities.AgentTask.update(task.id, {
            status: "completed",
            output_data: { code: generatedCode },
            credits_used: Math.round(creditsToUse * 0.6),
          });
        } else {
          // Simulate other agents
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await base44.entities.AgentTask.update(task.id, {
            status: "completed",
            output_data: { result: `${agent} completed successfully` },
            credits_used: Math.round(creditsToUse * 0.05),
          });
        }

        progress += 100 / agentSequence.length;
      }

      // Update project status
      await base44.entities.Project.update(project.id, {
        status: "ready",
        generated_code: "// Generated project code...",
        agents_used: agentSequence,
      });

      // Update user credits and log usage
      await base44.auth.updateMyUserData({
        credits_remaining: user.credits_remaining - creditsToUse,
      });

      await base44.entities.UsageLog.create({
        feature: "UniversalGenerator",
        credits_used: creditsToUse,
        details: `Generated ${projectData.type} project: ${projectData.name}`,
      });

      setGeneratedProject(project);
      setGenerationProgress(100);
      setActiveAgents([]);
    } catch (e) {
      console.error(e);
      setError("Project generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedType = projectTypes[projectData.type];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Wand2 className="w-8 h-8 text-purple-400" />
          Universal App Generator
        </h1>
        <p className="text-gray-400">
          Transform your ideas into production-ready applications with
          AI-powered multi-agent orchestration
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          {/* Project Configuration */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Project Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name *</Label>
                  <Input
                    placeholder="My Awesome App"
                    value={projectData.name}
                    onChange={(e) =>
                      setProjectData({ ...projectData, name: e.target.value })
                    }
                    className="bg-gray-900 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Type *</Label>
                  <Select
                    value={projectData.type}
                    onValueChange={(value) =>
                      setProjectData({
                        ...projectData,
                        type: value,
                        framework: "",
                      })
                    }
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(projectTypes).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="w-4 h-4" />
                            {config.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedType && (
                <div className="space-y-2">
                  <Label>Framework</Label>
                  <Select
                    value={projectData.framework}
                    onValueChange={(value) =>
                      setProjectData({ ...projectData, framework: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-600">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedType.frameworks.map((framework) => (
                        <SelectItem key={framework} value={framework}>
                          {framework}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Project Description *</Label>
                <Textarea
                  placeholder="Describe your project, its purpose, target audience, and key features..."
                  value={projectData.description}
                  onChange={(e) =>
                    setProjectData({
                      ...projectData,
                      description: e.target.value,
                    })
                  }
                  className="bg-gray-900 border-gray-600 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Instructions</Label>
                <Textarea
                  placeholder="Any specific requirements, design preferences, or technical constraints..."
                  value={projectData.customInstructions}
                  onChange={(e) =>
                    setProjectData({
                      ...projectData,
                      customInstructions: e.target.value,
                    })
                  }
                  className="bg-gray-900 border-gray-600 h-20"
                />
              </div>

              {/* Credit Cost Display */}
              {selectedType && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Estimated Credits</p>
                      <p className="text-sm text-gray-400">
                        {selectedType.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-400">
                        {calculateCredits()}
                      </p>
                      <p className="text-sm text-gray-400">credits</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={
                  !projectData.name ||
                  !projectData.description ||
                  !projectData.type ||
                  !projectData.framework
                }
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Configure Generation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Generation Preview */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Generation Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Project</p>
                  <p className="font-medium">{projectData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="font-medium">{selectedType?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Framework</p>
                  <p className="font-medium">{projectData.framework}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Credits</p>
                  <p className="font-medium text-blue-400">
                    {calculateCredits()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Orchestration */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>AI Agent Orchestration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgentStatus activeAgents={activeAgents} />

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generation Progress</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isGenerating}
                >
                  Back
                </Button>
                <Button
                  onClick={startGeneration}
                  disabled={isGenerating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Generation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
          <p className="font-medium">Generation Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Success State */}
      {generatedProject && (
        <Card className="bg-green-900/20 border-green-700">
          <CardHeader>
            <CardTitle className="text-green-400">
              Project Generated Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Your {selectedType?.name} has been generated and is ready for
              preview and deployment.
            </p>
            <div className="flex gap-3">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="mr-2 h-4 w-4" />
                Open in Editor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </CreateSuiteLayout>
  );
}