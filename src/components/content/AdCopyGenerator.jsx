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
import { Sparkles, Target, Copy, Check } from "lucide-react";

const adPlatforms = {
  google: {
    name: "Google Ads",
    specs: {
      headline1: 30,
      headline2: 30,
      headline3: 30,
      description1: 90,
      description2: 90,
    },
  },
  facebook: {
    name: "Facebook Ads",
    specs: {
      headline: 40,
      primaryText: 125,
      description: 30,
    },
  },
};

export default function AdCopyGenerator({ brandKitId, onAdGenerated }) {
  const [platform, setPlatform] = useState("google");
  const [product, setProduct] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [offer, setOffer] = useState("");
  const [generatedAd, setGeneratedAd] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const handleGenerate = async () => {
    if (!product.trim()) return;

    setIsGenerating(true);
    try {
      const platformSpecs = adPlatforms[platform];
      const prompt = `Generate ${platformSpecs.name} ad copy.

Product/Service: ${product}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${keyBenefits ? `Key Benefits: ${keyBenefits}` : ""}
${offer ? `Special Offer: ${offer}` : ""}

Requirements for ${platformSpecs.name}:
${
  platform === "google"
    ? `
- Headline 1 (max ${platformSpecs.specs.headline1} chars) - Most attention-grabbing
- Headline 2 (max ${platformSpecs.specs.headline2} chars) - Supporting headline
- Headline 3 (max ${platformSpecs.specs.headline3} chars) - Additional context
- Description 1 (max ${platformSpecs.specs.description1} chars) - Primary description with CTA
- Description 2 (max ${platformSpecs.specs.description2} chars) - Additional details
`
    : `
- Headline (max ${platformSpecs.specs.headline} chars) - Attention-grabbing
- Primary Text (max ${platformSpecs.specs.primaryText} chars) - Main ad copy
- Description (max ${platformSpecs.specs.description} chars) - Supporting text
`
}

Focus on:
- Compelling, benefit-driven language
- Clear call-to-action
- Urgency and value proposition
- Keywords for relevance

Return JSON with the appropriate structure for ${platform}.`;

      const schema =
        platform === "google"
          ? {
              type: "object",
              properties: {
                headline1: { type: "string" },
                headline2: { type: "string" },
                headline3: { type: "string" },
                description1: { type: "string" },
                description2: { type: "string" },
              },
            }
          : {
              type: "object",
              properties: {
                headline: { type: "string" },
                primaryText: { type: "string" },
                description: { type: "string" },
              },
            };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema,
      });

      setGeneratedAd(result);

      // Save to database
      await base44.entities.ContentPiece.create({
        title: `${platformSpecs.name} Ad: ${product.substring(0, 50)}`,
        type: "ad_copy",
        platform: platformSpecs.name,
        content: JSON.stringify(result),
        brand_kit_id: brandKitId,
        metadata: {
          product,
          targetAudience,
          keyBenefits,
          offer,
          ad_platform: platform,
        },
      });

      if (onAdGenerated) onAdGenerated();
    } catch (error) {
      console.error("Failed to generate ad:", error);
    }
    setIsGenerating(false);
  };

  const handleCopy = (field, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const renderGoogleAd = () => (
    <div className="space-y-4">
      {["headline1", "headline2", "headline3"].map((field, idx) => (
        <Card key={field} className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-400">
                Headline {idx + 1}
              </h4>
              <Badge variant="outline" className="text-xs">
                {generatedAd[field].length}/{adPlatforms.google.specs[field]}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(field, generatedAd[field])}
            >
              {copiedField === field ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-blue-400 font-semibold">{generatedAd[field]}</p>
        </Card>
      ))}

      {["description1", "description2"].map((field, idx) => (
        <Card key={field} className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-400">
                Description {idx + 1}
              </h4>
              <Badge variant="outline" className="text-xs">
                {generatedAd[field].length}/{adPlatforms.google.specs[field]}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(field, generatedAd[field])}
            >
              {copiedField === field ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-gray-300">{generatedAd[field]}</p>
        </Card>
      ))}
    </div>
  );

  const renderFacebookAd = () => (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-400">Headline</h4>
            <Badge variant="outline" className="text-xs">
              {generatedAd.headline.length}/
              {adPlatforms.facebook.specs.headline}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopy("headline", generatedAd.headline)}
          >
            {copiedField === "headline" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-blue-400 font-semibold">{generatedAd.headline}</p>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-400">
              Primary Text
            </h4>
            <Badge variant="outline" className="text-xs">
              {generatedAd.primaryText.length}/
              {adPlatforms.facebook.specs.primaryText}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopy("primaryText", generatedAd.primaryText)}
          >
            {copiedField === "primaryText" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-gray-300">{generatedAd.primaryText}</p>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-400">Description</h4>
            <Badge variant="outline" className="text-xs">
              {generatedAd.description.length}/
              {adPlatforms.facebook.specs.description}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopy("description", generatedAd.description)}
          >
            {copiedField === "description" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-gray-300">{generatedAd.description}</p>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Ad Copy Generator
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ad Platform
            </label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(adPlatforms).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Product/Service
            </label>
            <Input
              placeholder="E.g., Premium CRM software for small businesses"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Target Audience (Optional)
            </label>
            <Input
              placeholder="E.g., Small business owners, 30-50 years old"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Key Benefits (Optional)
            </label>
            <Textarea
              placeholder="List the main benefits or features to highlight..."
              value={keyBenefits}
              onChange={(e) => setKeyBenefits(e.target.value)}
              className="bg-gray-900 border-gray-600 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Special Offer (Optional)
            </label>
            <Input
              placeholder="E.g., 30% off first month, Free trial"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !product.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Ad Copy"}
          </Button>
        </div>
      </Card>

      {generatedAd && (
        <div>
          <h4 className="text-lg font-semibold mb-4">
            Generated {adPlatforms[platform].name} Copy
          </h4>
          {platform === "google" ? renderGoogleAd() : renderFacebookAd()}
        </div>
      )}
    </div>
  );
}
