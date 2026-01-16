import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Recycle,
  Languages,
  Scissors,
  Copy,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const languages = [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
];

export default function ContentRepurposingTool({ content, onRepurposed }) {
  const [activeTab, setActiveTab] = useState("summarize");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Summarization
  const [summaryLength, setSummaryLength] = useState("medium");

  // Translation
  const [targetLanguage, setTargetLanguage] = useState("Spanish");

  // Repurposing
  const [targetFormat, setTargetFormat] = useState("social_post");

  const handleSummarize = async () => {
    setIsProcessing(true);
    try {
      const lengthMap = {
        short: "1-2 sentences",
        medium: "3-5 sentences",
        long: "1-2 paragraphs",
      };

      const prompt = `Summarize the following content into ${lengthMap[summaryLength]}. Keep the key message and tone.

Content: ${content.content}

Provide a concise, engaging summary that captures the essence.`;

      const { summary } = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
          },
        },
      });

      setResult({ type: "summary", content: summary });

      await base44.entities.UsageLog.create({
        feature: "ContentSummarization",
        credits_used: 30,
        details: `Summarized: ${content.title}`,
      });
    } catch (error) {
      console.error("Summarization failed:", error);
      alert("Failed to summarize content. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleTranslate = async () => {
    setIsProcessing(true);
    try {
      const prompt = `Translate the following content to ${targetLanguage}. Maintain the tone, style, and formatting.

Original Content:
Title: ${content.title}
Content: ${content.content}

Provide a natural, culturally appropriate translation.`;

      const { translated_title, translated_content } =
        await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              translated_title: { type: "string" },
              translated_content: { type: "string" },
            },
          },
        });

      setResult({
        type: "translation",
        title: translated_title,
        content: translated_content,
        language: targetLanguage,
      });

      await base44.entities.UsageLog.create({
        feature: "ContentTranslation",
        credits_used: 50,
        details: `Translated to ${targetLanguage}: ${content.title}`,
      });
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Failed to translate content. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleRepurpose = async () => {
    setIsProcessing(true);
    try {
      const formatInstructions = {
        social_post:
          "Convert to a social media post (150-200 words) with hooks and hashtags",
        email:
          "Transform into an email newsletter format with subject line and clear sections",
        blog: "Expand into a full blog post (500+ words) with introduction, body, and conclusion",
        video_script:
          "Adapt into a video script with scene directions and voiceover",
        infographic:
          "Break down into key points suitable for an infographic (5-7 bullet points)",
      };

      const prompt = `Repurpose the following content into a ${targetFormat.replace(/_/g, " ")}:

Original:
${content.content}

Instructions: ${formatInstructions[targetFormat]}

Maintain the core message but optimize for the new format.`;

      const { repurposed_content, format_specific_data } =
        await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              repurposed_content: { type: "string" },
              format_specific_data: { type: "object" },
            },
          },
        });

      setResult({
        type: "repurposed",
        content: repurposed_content,
        format: targetFormat,
        metadata: format_specific_data,
      });

      await base44.entities.UsageLog.create({
        feature: "ContentRepurposing",
        credits_used: 60,
        details: `Repurposed to ${targetFormat}: ${content.title}`,
      });
    } catch (error) {
      console.error("Repurposing failed:", error);
      alert("Failed to repurpose content. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleSaveResult = async () => {
    if (!result) return;

    try {
      const newContent = {
        title: result.title || `${content.title} (${result.type})`,
        type: result.format || content.type,
        platform: content.platform,
        content: result.content,
        metadata: {
          ...content.metadata,
          source_content_id: content.id,
          repurposed_type: result.type,
          ...(result.metadata || {}),
        },
        brand_kit_id: content.brand_kit_id,
        status: "draft",
      };

      await base44.entities.ContentPiece.create(newContent);
      onRepurposed?.(newContent);
      setResult(null);
      alert("Repurposed content saved successfully!");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save repurposed content.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Recycle className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold">Content Repurposing Tools</h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900">
            <TabsTrigger value="summarize">
              <Scissors className="w-4 h-4 mr-2" />
              Summarize
            </TabsTrigger>
            <TabsTrigger value="translate">
              <Languages className="w-4 h-4 mr-2" />
              Translate
            </TabsTrigger>
            <TabsTrigger value="repurpose">
              <Copy className="w-4 h-4 mr-2" />
              Repurpose
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summarize" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Summary Length
              </label>
              <Select value={summaryLength} onValueChange={setSummaryLength}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium">Medium (3-5 sentences)</SelectItem>
                  <SelectItem value="long">Long (1-2 paragraphs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSummarize}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Scissors className="w-4 h-4 mr-2" />
              )}
              Generate Summary (30 credits)
            </Button>
          </TabsContent>

          <TabsContent value="translate" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Language
              </label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleTranslate}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Languages className="w-4 h-4 mr-2" />
              )}
              Translate Content (50 credits)
            </Button>
          </TabsContent>

          <TabsContent value="repurpose" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Format
              </label>
              <Select value={targetFormat} onValueChange={setTargetFormat}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_post">Social Media Post</SelectItem>
                  <SelectItem value="email">Email Newsletter</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="video_script">Video Script</SelectItem>
                  <SelectItem value="infographic">
                    Infographic Points
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleRepurpose}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Repurpose Content (60 credits)
            </Button>
          </TabsContent>
        </Tabs>
      </Card>

      {result && (
        <Card className="bg-gray-800 border-green-900/50 border-2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-green-400">
              {result.type === "summary" && "Summary Generated"}
              {result.type === "translation" &&
                `Translated to ${result.language}`}
              {result.type === "repurposed" &&
                `Repurposed as ${result.format.replace(/_/g, " ")}`}
            </h3>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            {result.title && (
              <h4 className="font-semibold text-lg mb-2">{result.title}</h4>
            )}
            <Textarea
              value={result.content}
              onChange={(e) =>
                setResult({ ...result, content: e.target.value })
              }
              className="bg-gray-800 border-gray-600 min-h-[200px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveResult}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Save as New Content
            </Button>
            <Button onClick={() => setResult(null)} variant="outline">
              Discard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
