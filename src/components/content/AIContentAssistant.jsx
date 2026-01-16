import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Lightbulb, Loader2 } from "lucide-react";

export default function AIContentAssistant({
  brandKit,
  recentContent,
  onSuggestionSelect,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();

      // Get recent analytics
      const usageLogs = await base44.entities.UsageLog.list(
        "-created_date",
        10
      );
      const contentPieces = await base44.entities.ContentPiece.list(
        "-created_date",
        20
      );

      const prompt = `As an AI content strategist, analyze the following data and provide 5 actionable content suggestions:

Brand Info:
- Brand: ${brandKit?.name || "Brand"}
- Voice: ${brandKit?.voice_guide || "Professional"}
- Colors: ${brandKit?.colors?.join(", ") || "Various"}

Recent Content Performance:
${contentPieces
  .slice(0, 5)
  .map(
    (c) => `- ${c.type}: "${c.title}" (${c.performance_data?.views || 0} views)`
  )
  .join("\n")}

Recent Activity:
- Total content pieces: ${contentPieces.length}
- Most used features: ${usageLogs
        .slice(0, 3)
        .map((l) => l.feature)
        .join(", ")}

Provide content suggestions that:
1. Align with the brand voice and identity
2. Fill gaps in current content strategy
3. Leverage trending formats
4. Target high engagement opportunities
5. Build on successful past content`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  rationale: { type: "string" },
                  potential_impact: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                },
              },
            },
          },
        },
      });

      setSuggestions(result.suggestions || []);

      await base44.entities.UsageLog.create({
        feature: "AIContentAssistant",
        credits_used: 50,
        details: "Generated content suggestions",
      });
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (brandKit) {
      generateSuggestions();
    }
  }, [brandKit?.id]);

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">AI Content Assistant</h3>
        </div>
        <Button onClick={generateSuggestions} size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {isLoading && suggestions.length === 0 ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 p-4 rounded-lg animate-pulse h-24"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-gray-900 p-4 rounded-lg hover:bg-gray-850 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                    <Badge
                      className={
                        suggestion.priority === "high"
                          ? "bg-red-500/20 text-red-400"
                          : suggestion.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                      }
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {suggestion.rationale}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>{suggestion.potential_impact}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSuggestionSelect?.(suggestion)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
