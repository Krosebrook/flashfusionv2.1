import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Loader2, Download, RefreshCw } from "lucide-react";

const memeTemplates = [
  {
    id: "custom",
    name: "Custom Image",
    description: "Generate a unique meme image",
  },
  {
    id: "text_based",
    name: "Text-Based Meme",
    description: "Bold text format, no image",
  },
  {
    id: "corporate",
    name: "Corporate Meme",
    description: "Office humor style",
  },
  {
    id: "relatable",
    name: "Relatable Moment",
    description: "Everyday situations",
  },
  {
    id: "trending",
    name: "Trending Format",
    description: "Current viral formats",
  },
];

export default function MemeGenerator({ onMemeGenerated, brandKitId }) {
  const [formData, setFormData] = useState({
    topic: "",
    template: "custom",
    style: "funny",
    platform: "Instagram",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState(null);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return;

    setIsGenerating(true);
    try {
      const user = await base44.auth.me();

      if (user.credits_remaining < 80) {
        alert(
          "Insufficient credits. You need at least 80 credits to generate a meme."
        );
        setIsGenerating(false);
        return;
      }

      const template = memeTemplates.find((t) => t.id === formData.template);

      // Generate meme concept and text
      const conceptPrompt = `Create a viral meme about: ${formData.topic}

Template: ${template.name}
Style: ${formData.style}
Platform: ${formData.platform}

Generate:
1. Main text/caption that's funny, relatable, and shareable
2. Top text (if applicable)
3. Bottom text (if applicable)
4. Description of the visual concept
5. Hashtags for maximum reach

Make it trendy, shareable, and platform-optimized.`;

      const concept = await base44.integrations.Core.InvokeLLM({
        prompt: conceptPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            main_caption: { type: "string" },
            top_text: { type: "string" },
            bottom_text: { type: "string" },
            visual_description: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            style_notes: { type: "string" },
          },
        },
      });

      let imageUrl = null;

      // Generate image if not text-based
      if (formData.template !== "text_based") {
        const imagePrompt = `${concept.visual_description}
Meme format, internet culture style, ${formData.style} humor
High contrast, bold text readable, social media optimized
Professional meme design`;

        const { url } = await base44.integrations.Core.GenerateImage({
          prompt: imagePrompt,
        });
        imageUrl = url;
      }

      const meme = {
        title: formData.topic,
        type: "meme",
        platform: formData.platform,
        content: concept.main_caption,
        metadata: {
          top_text: concept.top_text,
          bottom_text: concept.bottom_text,
          visual_description: concept.visual_description,
          hashtags: concept.hashtags,
          template: formData.template,
          style: formData.style,
          image_url: imageUrl,
        },
        brand_kit_id: brandKitId,
        status: "draft",
      };

      setGeneratedMeme(meme);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 80,
      });

      await base44.entities.UsageLog.create({
        feature: "MemeGenerator",
        credits_used: 80,
        details: `Generated meme: ${formData.topic}`,
      });
    } catch (error) {
      console.error("Meme generation failed:", error);
      alert("Failed to generate meme. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleRegenerate = async () => {
    await handleGenerate();
  };

  const handleSave = async () => {
    try {
      const saved = await base44.entities.ContentPiece.create(generatedMeme);
      onMemeGenerated?.(saved);
      setGeneratedMeme(null);
      setFormData({
        topic: "",
        template: "custom",
        style: "funny",
        platform: "Instagram",
      });
    } catch (error) {
      console.error("Failed to save meme:", error);
      alert("Failed to save meme. Please try again.");
    }
  };

  const handleDownload = async () => {
    if (generatedMeme.metadata.image_url) {
      try {
        const response = await fetch(generatedMeme.metadata.image_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${generatedMeme.title.replace(/\s+/g, "_")}_Meme.png`;
        a.click();
      } catch (error) {
        console.error("Download failed:", error);
      }
    } else {
      // Download as text for text-based memes
      const content = `${generatedMeme.metadata.top_text}\n\n${generatedMeme.content}\n\n${generatedMeme.metadata.bottom_text}\n\n${generatedMeme.metadata.hashtags.map((h) => `#${h}`).join(" ")}`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedMeme.title.replace(/\s+/g, "_")}_Meme.txt`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Smile className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-semibold">
            Meme & Social Graphic Generator
          </h3>
          <Badge className="ml-auto">80 credits</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Meme Topic *
            </label>
            <Input
              placeholder="e.g., When developers find a bug in production..."
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template</label>
              <Select
                value={formData.template}
                onValueChange={(value) =>
                  setFormData({ ...formData, template: value })
                }
              >
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {memeTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-400">
                          {template.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <Select
                value={formData.style}
                onValueChange={(value) =>
                  setFormData({ ...formData, style: value })
                }
              >
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funny">Funny & Lighthearted</SelectItem>
                  <SelectItem value="sarcastic">Sarcastic & Witty</SelectItem>
                  <SelectItem value="wholesome">
                    Wholesome & Positive
                  </SelectItem>
                  <SelectItem value="relatable">Relatable & Real</SelectItem>
                  <SelectItem value="absurd">Absurd & Random</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData({ ...formData, platform: value })
                }
              >
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.topic.trim()}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Meme...
              </>
            ) : (
              <>
                <Smile className="w-4 h-4 mr-2" />
                Generate Meme
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedMeme && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{generatedMeme.title}</h3>
            <div className="flex gap-3">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                size="sm"
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                Save Meme
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {generatedMeme.metadata.image_url && (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={generatedMeme.metadata.image_url}
                  alt={generatedMeme.title}
                  className="w-full max-w-2xl mx-auto"
                />
              </div>
            )}

            <div className="space-y-4">
              {generatedMeme.metadata.top_text && (
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white uppercase tracking-wider">
                    {generatedMeme.metadata.top_text}
                  </p>
                </div>
              )}

              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Caption</h4>
                <p className="text-lg text-gray-300">{generatedMeme.content}</p>
              </div>

              {generatedMeme.metadata.bottom_text && (
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white uppercase tracking-wider">
                    {generatedMeme.metadata.bottom_text}
                  </p>
                </div>
              )}

              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedMeme.metadata.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.template === "text_based" && (
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Visual Concept</h4>
                  <p className="text-sm text-gray-400">
                    {generatedMeme.metadata.visual_description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
