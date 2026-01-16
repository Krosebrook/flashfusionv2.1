import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Tag,
  Image as ImageIcon,
  Loader2,
  TrendingUp,
} from "lucide-react";

export default function AIProductGenerator({ onProductGenerated, brandKitId }) {
  const [productIdea, setProductIdea] = useState("");
  const [category, setCategory] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProduct, setGeneratedProduct] = useState(null);

  const handleGenerate = async () => {
    if (!productIdea.trim()) return;

    setIsGenerating(true);
    try {
      const user = await base44.auth.me();

      if (user.credits_remaining < 100) {
        alert(
          "Insufficient credits. You need at least 100 credits to generate a product."
        );
        setIsGenerating(false);
        return;
      }

      const prompt = `Generate a comprehensive e-commerce product based on this idea: "${productIdea}"
      
Category: ${category || "general"}
Target Audience: ${targetAudience || "general consumers"}
Price Range: ${priceRange.min && priceRange.max ? `$${priceRange.min}-$${priceRange.max}` : "flexible"}

Create a complete product listing with:
1. A catchy, SEO-friendly product title (max 80 chars)
2. A detailed product description (200-300 words) highlighting benefits, features, and use cases
3. A short description (50-80 words) for quick overview
4. Suggested optimal price with reasoning
5. 10 relevant product tags
6. SEO-optimized meta title and description
7. 10 high-impact SEO keywords
8. 5 marketing angles or selling points
9. Suggested image concepts (describe 3-4 product photos)

Consider market trends, competitive pricing, and conversion optimization.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            short_description: { type: "string" },
            suggested_price: { type: "number" },
            pricing_reasoning: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            seo_title: { type: "string" },
            seo_description: { type: "string" },
            seo_keywords: { type: "array", items: { type: "string" } },
            marketing_angles: { type: "array", items: { type: "string" } },
            image_concepts: { type: "array", items: { type: "string" } },
          },
        },
      });

      const product = {
        ...result,
        category: category || "General",
        price: result.suggested_price,
        brand_kit_id: brandKitId,
        status: "draft",
        platforms: [],
        marketing_copy: {
          angles: result.marketing_angles,
          pricing_reasoning: result.pricing_reasoning,
        },
      };

      setGeneratedProduct(product);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 100,
      });

      await base44.entities.UsageLog.create({
        feature: "AIProductGenerator",
        credits_used: 100,
        details: `Generated product: ${result.title}`,
      });
    } catch (error) {
      console.error("Product generation failed:", error);
      alert("Failed to generate product. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSaveProduct = async () => {
    if (!generatedProduct) return;

    try {
      const saved =
        await base44.entities.EcommerceProduct.create(generatedProduct);
      onProductGenerated?.(saved);
      setGeneratedProduct(null);
      setProductIdea("");
      setCategory("");
      setTargetAudience("");
      setPriceRange({ min: "", max: "" });
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold">AI Product Generator</h3>
          <Badge className="ml-auto">100 credits</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Idea *
            </label>
            <Textarea
              placeholder="e.g., Handcrafted ceramic coffee mugs with minimalist designs..."
              value={productIdea}
              onChange={(e) => setProductIdea(e.target.value)}
              className="bg-gray-900 border-gray-600 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                placeholder="e.g., Home & Kitchen"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-900 border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Target Audience
              </label>
              <Input
                placeholder="e.g., Coffee enthusiasts, millennials"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="bg-gray-900 border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Price Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Min price"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
                className="bg-gray-900 border-gray-600"
              />
              <Input
                type="number"
                placeholder="Max price"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
                className="bg-gray-900 border-gray-600"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !productIdea.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Product...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Product
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedProduct && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {generatedProduct.title}
                </h3>
                <p className="text-gray-400">
                  {generatedProduct.short_description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  ${generatedProduct.suggested_price}
                </div>
                <Badge className="mt-2 bg-green-500/20 text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  AI Optimized
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {generatedProduct.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedProduct.tags?.map((tag, i) => (
                  <Badge key={i} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">SEO Optimization</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">SEO Title:</span>
                  <p className="text-gray-300">{generatedProduct.seo_title}</p>
                </div>
                <div>
                  <span className="text-gray-400">Meta Description:</span>
                  <p className="text-gray-300">
                    {generatedProduct.seo_description}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Keywords:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {generatedProduct.seo_keywords?.map((keyword, i) => (
                      <Badge
                        key={i}
                        className="bg-blue-500/20 text-blue-400 text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Marketing Angles</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                {generatedProduct.marketing_copy?.angles?.map((angle, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    {angle}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Suggested Images
              </h4>
              <ul className="space-y-1 text-sm text-gray-300">
                {generatedProduct.image_concepts?.map((concept, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">{i + 1}.</span>
                    {concept}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveProduct}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Save Product
              </Button>
              <Button
                onClick={() => setGeneratedProduct(null)}
                variant="outline"
                className="flex-1"
              >
                Generate Another
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
