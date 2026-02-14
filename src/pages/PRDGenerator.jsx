"use client";
import { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { base44 } from "@/api/base44Client";
import CreateSuiteLayout from "../components/layouts/CreateSuiteLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Loader2,
  Download,
  Copy,
  Sparkles,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

const PRD_SECTIONS = [
  { id: "executive_summary", title: "Executive Summary", icon: "📋" },
  { id: "problem_statement", title: "Problem Statement", icon: "❓" },
  {
    id: "target_audience",
    title: "Target Audience / User Personas",
    icon: "👥",
  },
  {
    id: "functional_requirements",
    title: "Functional Requirements",
    icon: "⚙️",
  },
  {
    id: "non_functional_requirements",
    title: "Non-Functional Requirements",
    icon: "📊",
  },
  {
    id: "user_stories",
    title: "User Stories & Acceptance Criteria",
    icon: "📝",
  },
  {
    id: "technical_architecture",
    title: "Technical Architecture Overview",
    icon: "🏗️",
  },
  { id: "api_design", title: "API Design", icon: "🔌" },
  { id: "ui_ux", title: "UI/UX Considerations", icon: "🎨" },
  { id: "security", title: "Security & Compliance", icon: "🔒" },
  { id: "testing_strategy", title: "Testing Strategy", icon: "🧪" },
  { id: "deployment", title: "Deployment & DevOps Plan", icon: "🚀" },
  { id: "risks", title: "Assumptions, Risks & Open Questions", icon: "⚠️" },
];

export default function PRDGenerator() {
  const [featureIdea, setFeatureIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPRD, setGeneratedPRD] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("input");

  const generatePRD = async () => {
    if (!featureIdea.trim()) {
      setError("Please enter a feature idea");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    const creditsToUse = 150; // Base credits for PRD generation

    try {
      const user = await base44.auth.me();
      if (user.credits_remaining < creditsToUse) {
        setError(`Insufficient credits. You need ${creditsToUse} credits.`);
        setIsGenerating(false);
        return;
      }

      setGenerationProgress(10);

      // Create the PRD generation prompt
      const prompt = `You are an expert technical product manager and senior full-stack developer. Generate a complete, spec-driven Product Requirements Document (PRD) based on the following feature idea:

**Feature Idea:**
${featureIdea}

Generate a comprehensive PRD with the following sections. Format each section clearly with markdown:

# 1. Executive Summary
Provide a high-level overview of the product/feature, including the business case and goals.

# 2. Problem Statement
Clearly articulate the problem being solved, who experiences this problem, and why it's critical.

# 3. Target Audience / User Personas
Define primary user roles, their pain points, and goals.

# 4. Functional Requirements
List all core features with clearly scoped feature behavior and edge cases where applicable.

# 5. Non-Functional Requirements
Address performance, scalability, uptime, localization, accessibility, etc.

# 6. User Stories & Acceptance Criteria
Use proper Gherkin-style format (Given/When/Then). Cover all personas and use cases.

# 7. Technical Architecture Overview
Provide high-level system design, services involved (frontend, backend, APIs, DBs, etc.), and sequence diagrams or flow descriptions if applicable.

# 8. API Design (if relevant)
Specify REST or GraphQL endpoint specs, request/response schema, and authentication/authorization notes.

# 9. UI/UX Considerations
Describe page/component layout, interaction expectations, and mobile responsiveness.

# 10. Security & Compliance
Detail data handling policies, role-based access control, encryption, and relevant compliance requirements (GDPR, SOC2, HIPAA if relevant).

# 11. Testing Strategy
Define unit, integration, and E2E test coverage, along with tooling and automation plan.

# 12. Deployment & DevOps Plan
Outline environments (dev, staging, prod), CI/CD strategy, and rollback plans.

# 13. Assumptions, Risks & Open Questions
List known unknowns, external dependencies, and risk mitigation strategies.

Generate a production-grade, comprehensive PRD that adheres to current best practices in software engineering and technical product management. Be specific, detailed, and actionable.`;

      setGenerationProgress(30);

      // Call the LLM to generate the PRD
      const result = await InvokeLLM({ prompt });

      setGenerationProgress(80);

      // Create a PRD record in the database
      const prdRecord = await base44.entities.PRD?.create({
        feature_idea: featureIdea,
        content: result,
        status: "completed",
        credits_used: creditsToUse,
      }).catch(() => null); // Gracefully handle if PRD entity doesn't exist

      setGenerationProgress(90);

      // Update user credits and log usage
      await base44.auth.updateMyUserData({
        credits_remaining: user.credits_remaining - creditsToUse,
      });

      await base44.entities.UsageLog?.create({
        feature: "PRDGenerator",
        credits_used: creditsToUse,
        details: `Generated PRD for: ${featureIdea.substring(0, 100)}`,
      }).catch(() => null); // Gracefully handle if UsageLog doesn't exist

      setGeneratedPRD({
        content: result,
        feature_idea: featureIdea,
        created_at: new Date().toISOString(),
        id: prdRecord?.id,
      });

      setGenerationProgress(100);
      setActiveTab("preview");
    } catch (e) {
      console.error(e);
      setError("PRD generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPRD?.content) {
      navigator.clipboard.writeText(generatedPRD.content);
      // You could add a toast notification here
    }
  };

  const downloadAsMarkdown = () => {
    if (!generatedPRD?.content) return;

    const blob = new Blob([generatedPRD.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PRD-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    if (!generatedPRD?.content) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(20);
    doc.text("Product Requirements Document", margin, margin + 10);

    // Feature Idea
    doc.setFontSize(12);
    doc.text(`Feature: ${generatedPRD.feature_idea}`, margin, margin + 20);

    // Content
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(generatedPRD.content, maxWidth);
    let y = margin + 30;

    lines.forEach((line) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 5;
    });

    doc.save(`PRD-${Date.now()}.pdf`);
  };

  return (
    <CreateSuiteLayout>
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-blue-400" />
          PRD Generator
        </h1>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Transform your product ideas into comprehensive, production-grade
          Product Requirements Documents. Generate complete PRDs with technical
          specifications, user stories, and implementation plans.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedPRD}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          {/* Input Form */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Feature Idea</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Describe Your Product or Feature *</Label>
                <Textarea
                  placeholder="Example: A mobile app that helps users track their daily water intake with reminders, achievements, and health insights. Target audience is health-conscious individuals aged 25-45..."
                  value={featureIdea}
                  onChange={(e) => setFeatureIdea(e.target.value)}
                  className="bg-gray-900 border-gray-600 min-h-[200px]"
                  disabled={isGenerating}
                />
                <p className="text-sm text-gray-400">
                  Be as detailed as possible. Include target audience, key
                  features, technical requirements, and business goals.
                </p>
              </div>

              {/* Credit Cost Display */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estimated Credits</p>
                    <p className="text-sm text-gray-400">
                      Comprehensive PRD with 13 sections
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-400">150</p>
                    <p className="text-sm text-gray-400">credits</p>
                  </div>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating PRD...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={generatePRD}
                disabled={isGenerating || !featureIdea.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PRD...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate PRD
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
              <p className="font-medium">Generation Failed</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Success Notification */}
          {generatedPRD && !isGenerating && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-400">
                      PRD Generated Successfully!
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      Your comprehensive Product Requirements Document is ready.
                      Switch to the Preview tab to view and download it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedPRD && (
            <>
              {/* Action Buttons */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                    <Button
                      onClick={downloadAsMarkdown}
                      variant="outline"
                      className="flex-1"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Download Markdown
                    </Button>
                    <Button
                      onClick={downloadAsPDF}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PRD Preview */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Generated PRD</CardTitle>
                  <p className="text-sm text-gray-400 mt-2">
                    {generatedPRD.feature_idea}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-gray-900 p-6 rounded-lg overflow-auto max-h-[800px]">
                      <ReactMarkdown>{generatedPRD.content}</ReactMarkdown>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate New PRD Button */}
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setGeneratedPRD(null);
                    setFeatureIdea("");
                    setActiveTab("input");
                  }}
                  variant="outline"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate New PRD
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Section Guide */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>PRD Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRD_SECTIONS.map((section) => (
              <div
                key={section.id}
                className="p-3 bg-gray-700 rounded-lg border border-gray-600"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <p className="text-sm font-medium">{section.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </CreateSuiteLayout>
  );
}