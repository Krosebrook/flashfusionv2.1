import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, RefreshCw, Loader2, TrendingUp, BarChart3 } from "lucide-react";

export default function ContentPreview({ content, onVariationsGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState(content.variations || []);
  const [selectedVariation, setSelectedVariation] = useState(0);

  const handleGenerateVariations = async () => {
    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      
      if (user.credits_remaining < 60) {
        alert("Insufficient credits. You need at least 60 credits to generate A/B test variations.");
        setIsGenerating(false);
        return;
      }

      const prompt = `Create 2 A/B testing variations for this ${content.type}:

Original Content:
Title: ${content.title}
Content: ${content.content}
Platform: ${content.platform}

Generate 2 distinct variations with different approaches:
1. Variation A: Different hook/angle
2. Variation B: Different tone/style

For each variation, provide:
- Modified title
- Modified content
- Key differences explained
- Predicted performance factors

Keep the core message but test different approaches.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  title: { type: "string" },
                  content: { type: "string" },
                  key_differences: { type: "string" },
                  predicted_performance: { type: "string" }
                }
              }
            }
          }
        }
      });

      const newVariations = [
        {
          name: "Original",
          title: content.title,
          content: content.content,
          key_differences: "Original version",
          predicted_performance: "Baseline"
        },
        ...result.variations
      ];

      setVariations(newVariations);

      // Update content with variations
      await base44.entities.ContentPiece.update(content.id, {
        variations: newVariations
      });

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 60
      });

      await base44.entities.UsageLog.create({
        feature: "ABTestingVariations",
        credits_used: 60,
        details: `Generated A/B variations for: ${content.title}`
      });

      onVariationsGenerated?.(newVariations);

    } catch (error) {
      console.error("Variation generation failed:", error);
      alert("Failed to generate variations. Please try again.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold">Content Preview & A/B Testing</h3>
          </div>
          {variations.length === 0 && (
            <Button
              onClick={handleGenerateVariations}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate A/B Variations (60 credits)
                </>
              )}
            </Button>
          )}
        </div>

        {variations.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-6">
            <h4 className="font-semibold text-lg mb-3">{content.title}</h4>
            <div className="flex items-center gap-2 mb-4">
              <Badge>{content.type}</Badge>
              <Badge variant="outline">{content.platform}</Badge>
            </div>
            <p className="text-gray-300 whitespace-pre-line">{content.content}</p>
          </div>
        ) : (
          <Tabs value={`variation-${selectedVariation}`} onValueChange={(v) => setSelectedVariation(parseInt(v.split('-')[1]))} className="w-full">
            <TabsList className="bg-gray-900 w-full justify-start">
              {variations.map((variation, index) => (
                <TabsTrigger key={index} value={`variation-${index}`} className="flex-1">
                  {variation.name}
                  {index === 0 && <Badge className="ml-2 bg-gray-600 text-xs">Control</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>

            {variations.map((variation, index) => (
              <TabsContent key={index} value={`variation-${index}`} className="space-y-4">
                <Card className="bg-gray-900 border-gray-700 p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{variation.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge>{content.type}</Badge>
                        <Badge variant="outline">{content.platform}</Badge>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-300 whitespace-pre-line">{variation.content}</p>
                    </div>

                    {index > 0 && (
                      <>
                        <div className="border-t border-gray-700 pt-4">
                          <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            Key Differences
                          </h5>
                          <p className="text-sm text-gray-400">{variation.key_differences}</p>
                        </div>

                        <div className="border-t border-gray-700 pt-4">
                          <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-green-400" />
                            Predicted Performance
                          </h5>
                          <p className="text-sm text-gray-400">{variation.predicted_performance}</p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {index > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                    <p className="text-sm text-blue-300">
                      💡 <strong>Testing Tip:</strong> Run both versions simultaneously on your platform and track engagement metrics like clicks, shares, and conversions to determine the winner.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </Card>

      {variations.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">A/B Testing Guide</h4>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              <p>Publish all variations to your platform at the same time</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              <p>Split your audience equally between variations</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              <p>Track key metrics: engagement rate, click-through rate, conversions</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">4.</span>
              <p>Run the test for at least 7 days or until statistical significance</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">5.</span>
              <p>Use the winning variation for future similar content</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}