import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { GitBranch, Loader2, CheckCircle2 } from "lucide-react";

export default function ABTestingGenerator({ baseContent, onVariationsGenerated }) {
  const [numVariations, setNumVariations] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState([]);

  const handleGenerateVariations = async () => {
    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      
      const creditsNeeded = numVariations * 40;
      if (user.credits_remaining < creditsNeeded) {
        alert(`Insufficient credits. You need ${creditsNeeded} credits to generate ${numVariations} variations.`);
        setIsGenerating(false);
        return;
      }

      const prompt = `Create ${numVariations} distinct A/B testing variations for this content:

Original Title: ${baseContent.title}
Original Content: ${baseContent.content}
Type: ${baseContent.type}
Platform: ${baseContent.platform}

Generate ${numVariations} variations that test different approaches:
1. Different hooks/openings
2. Different tones (casual vs formal, urgent vs calm)
3. Different structures (storytelling vs direct)
4. Different CTAs
5. Different lengths

For each variation, provide:
- Modified title
- Modified content
- What's being tested
- Expected impact
- Best for (audience type)`;

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
                  title: { type: "string" },
                  content: { type: "string" },
                  test_focus: { type: "string" },
                  expected_impact: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            }
          }
        }
      });

      const allVariations = [
        {
          title: baseContent.title,
          content: baseContent.content,
          test_focus: "Original (Control)",
          expected_impact: "Baseline performance",
          best_for: "Current audience",
          isOriginal: true
        },
        ...(result.variations || []).map((v, i) => ({
          ...v,
          variationLabel: String.fromCharCode(65 + i) // A, B, C, etc.
        }))
      ];

      setVariations(allVariations);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - creditsNeeded
      });

      await base44.entities.UsageLog.create({
        feature: "ABTestingGenerator",
        credits_used: creditsNeeded,
        details: `Generated ${numVariations} A/B test variations for: ${baseContent.title}`
      });

      onVariationsGenerated?.(allVariations);

    } catch (error) {
      console.error("Variation generation failed:", error);
      alert("Failed to generate variations. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSaveAll = async () => {
    try {
      for (const variation of variations) {
        if (variation.isOriginal) continue;

        await base44.entities.ContentPiece.create({
          title: `${variation.title} [${variation.variationLabel}]`,
          type: baseContent.type,
          platform: baseContent.platform,
          content: variation.content,
          metadata: {
            ...baseContent.metadata,
            ab_test_group: variation.variationLabel,
            test_focus: variation.test_focus,
            expected_impact: variation.expected_impact,
            source_content_id: baseContent.id
          },
          brand_kit_id: baseContent.brand_kit_id,
          status: "draft"
        });
      }

      alert("All variations saved successfully!");
      setVariations([]);
    } catch (error) {
      console.error("Failed to save variations:", error);
      alert("Failed to save some variations. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch className="w-5 h-5 text-orange-400" />
          <h3 className="text-xl font-semibold">A/B Testing Variation Generator</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Variations (40 credits each)
            </label>
            <Input
              type="number"
              min="2"
              max="5"
              value={numVariations}
              onChange={(e) => setNumVariations(parseInt(e.target.value) || 2)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <Button
            onClick={handleGenerateVariations}
            disabled={isGenerating}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating {numVariations} Variations...
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4 mr-2" />
                Generate {numVariations} A/B Test Variations ({numVariations * 40} credits)
              </>
            )}
          </Button>
        </div>
      </Card>

      {variations.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              Generated {variations.length} Variations
            </h3>
            <Button
              onClick={handleSaveAll}
              className="bg-green-600 hover:bg-green-700"
            >
              Save All Variations
            </Button>
          </div>

          <Tabs defaultValue="0" className="w-full">
            <TabsList className="bg-gray-900 w-full justify-start overflow-x-auto">
              {variations.map((variation, index) => (
                <TabsTrigger key={index} value={String(index)}>
                  {variation.isOriginal ? "Original" : `Variation ${variation.variationLabel}`}
                </TabsTrigger>
              ))}
            </TabsList>

            {variations.map((variation, index) => (
              <TabsContent key={index} value={String(index)} className="space-y-4">
                <Card className={`p-6 ${variation.isOriginal ? 'bg-blue-900/20 border-blue-700' : 'bg-gray-900 border-gray-700'}`}>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">Title</h4>
                        {!variation.isOriginal && (
                          <Badge className="bg-orange-500/20 text-orange-400">
                            {variation.variationLabel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300">{variation.title}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Content</h4>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-300 whitespace-pre-line">{variation.content}</p>
                      </div>
                    </div>

                    {!variation.isOriginal && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <p className="text-gray-400 mb-1">Testing</p>
                            <p className="font-medium text-purple-400">{variation.test_focus}</p>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <p className="text-gray-400 mb-1">Expected Impact</p>
                            <p className="font-medium text-green-400">{variation.expected_impact}</p>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <p className="text-gray-400 mb-1">Best For</p>
                            <p className="font-medium text-blue-400">{variation.best_for}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>Testing Guide:</strong> Deploy all variations simultaneously, split your audience equally, and track engagement metrics for at least 7 days before declaring a winner.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}