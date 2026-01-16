import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, RefreshCw, Check, Loader2 } from "lucide-react";

export default function AIDescriptionGenerator({
  product,
  brandKit,
  onSelect,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [descriptions, setDescriptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const generateDescriptions = async () => {
    setIsGenerating(true);
    try {
      const user = await base44.auth.me();

      if (user.credits_remaining < 50) {
        alert("Insufficient credits. You need at least 50 credits.");
        setIsGenerating(false);
        return;
      }

      const brandContext = brandKit
        ? `
Brand: ${brandKit.name}
Voice: ${brandKit.voice_guide || "professional and engaging"}
Colors: ${brandKit.colors?.join(", ") || "N/A"}
Tagline: ${brandKit.tagline || "N/A"}`
        : "";

      const prompt = `Generate 3 unique, compelling product descriptions for this e-commerce product:

Product: ${product.title}
Category: ${product.category || "General"}
Price: $${product.price}
${product.short_description ? `Brief: ${product.short_description}` : ""}
${brandContext}

For EACH description (3 total), create:
1. A unique writing style and tone (e.g., professional, casual, storytelling)
2. 150-250 words highlighting benefits and features
3. A call-to-action
4. Incorporate SEO naturally

Make each description distinctly different in approach and style.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            descriptions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  style: { type: "string" },
                  content: { type: "string" },
                  tone: { type: "string" },
                },
              },
            },
          },
        },
      });

      setDescriptions(result.descriptions || []);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 50,
      });

      await base44.entities.UsageLog.create({
        feature: "AIDescriptionGenerator",
        credits_used: 50,
        details: `Generated descriptions for: ${product.title}`,
      });
    } catch (error) {
      console.error("Failed to generate descriptions:", error);
      alert("Failed to generate descriptions. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    const selected = descriptions[index];
    if (selected && onSelect) {
      onSelect(selected.content);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Description Generator
          </h3>
          <p className="text-sm text-gray-400">
            Generate multiple description options with AI
          </p>
        </div>
        <Badge>50 credits</Badge>
      </div>

      {descriptions.length === 0 ? (
        <Button
          onClick={generateDescriptions}
          disabled={isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating 3 Options...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Descriptions
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <Tabs
            value={String(selectedIndex)}
            onValueChange={(v) => setSelectedIndex(Number(v))}
          >
            <TabsList className="bg-gray-900 w-full">
              {descriptions.map((desc, i) => (
                <TabsTrigger key={i} value={String(i)} className="flex-1">
                  Option {i + 1}
                  {selectedIndex === i && <Check className="w-3 h-3 ml-2" />}
                </TabsTrigger>
              ))}
            </TabsList>

            {descriptions.map((desc, i) => (
              <TabsContent key={i} value={String(i)} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{desc.style}</Badge>
                  <Badge variant="outline">{desc.tone}</Badge>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {desc.content}
                  </p>
                </div>

                <Button
                  onClick={() => handleSelect(i)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use This Description
                </Button>
              </TabsContent>
            ))}
          </Tabs>

          <Button
            onClick={generateDescriptions}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate All
          </Button>
        </div>
      )}
    </Card>
  );
}
