import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check } from "lucide-react";

const platformSpecs = {
  Twitter: { maxLength: 280, tone: "concise and punchy", icon: "🐦" },
  LinkedIn: {
    maxLength: 3000,
    tone: "professional and insightful",
    icon: "💼",
  },
  Instagram: { maxLength: 2200, tone: "engaging and visual", icon: "📸" },
};

export default function SocialMediaCopyGenerator({
  brandKitId,
  onCopyGenerated,
}) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Twitter");
  const [context, setContext] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const spec = platformSpecs[platform];
      const prompt = `Generate ${platform} post copy about: ${topic}

${context ? `Additional context: ${context}` : ""}

Requirements:
- Maximum ${spec.maxLength} characters
- Tone: ${spec.tone}
- Include relevant hashtags (3-5)
- Make it engaging and shareable
- ${platform === "Instagram" ? "Include emoji where appropriate" : ""}
- ${platform === "LinkedIn" ? "Professional but personable" : ""}
- ${platform === "Twitter" ? "Concise with strong hook" : ""}

Return JSON with structure:
{
  "copy": "the post content",
  "hashtags": ["tag1", "tag2", "tag3"]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            copy: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
          },
        },
      });

      setGeneratedCopy(result.copy);
      setHashtags(result.hashtags || []);

      // Save to database
      await base44.entities.ContentPiece.create({
        title: `${platform} Post: ${topic.substring(0, 50)}`,
        type: "social_post",
        platform,
        content: result.copy,
        brand_kit_id: brandKitId,
        metadata: {
          hashtags: result.hashtags,
          topic,
        },
      });

      if (onCopyGenerated) onCopyGenerated();
    } catch (error) {
      console.error("Failed to generate copy:", error);
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    const fullCopy = `${generatedCopy}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(fullCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Social Media Copy Generator
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(platformSpecs).map(([name, spec]) => (
                  <SelectItem key={name} value={name}>
                    {spec.icon} {name} (max {spec.maxLength} chars)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Topic or Key Message
            </label>
            <Input
              placeholder="E.g., Launching our new product feature"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Context (Optional)
            </label>
            <Textarea
              placeholder="Add any additional details, target audience, or specific angles you want to emphasize..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="bg-gray-900 border-gray-600 h-24"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Copy"}
          </Button>
        </div>
      </Card>

      {generatedCopy && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Generated {platform} Copy</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <p className="whitespace-pre-wrap">{generatedCopy}</p>
          </div>

          {hashtags.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Suggested Hashtags:</p>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, i) => (
                  <Badge key={i} className="bg-blue-500/20 text-blue-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Character count: {generatedCopy.length} /{" "}
            {platformSpecs[platform].maxLength}
          </div>
        </Card>
      )}
    </div>
  );
}
