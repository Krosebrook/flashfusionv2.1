import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Loader2, Download, Share2 } from "lucide-react";

import SocialPublisher from "./SocialPublisher";

const assetTypes = [
  { id: "instagram_post", name: "Instagram Post", platform: "Instagram", dimensions: "1080x1080" },
  { id: "instagram_story", name: "Instagram Story", platform: "Instagram", dimensions: "1080x1920" },
  { id: "facebook_post", name: "Facebook Post", platform: "Facebook", dimensions: "1200x630" },
  { id: "twitter_header", name: "Twitter Header", platform: "Twitter", dimensions: "1500x500" },
  { id: "linkedin_post", name: "LinkedIn Post", platform: "LinkedIn", dimensions: "1200x627" }
];

export default function SocialMediaAssetGenerator({ brandKit, onAssetGenerated }) {
  const [selectedType, setSelectedType] = useState("instagram_post");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [publishingAsset, setPublishingAsset] = useState(null);

  const handleGenerate = async () => {
    if (!message.trim() || !brandKit) return;

    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      
      if (user.credits_remaining < 100) {
        alert("Insufficient credits. You need at least 100 credits to generate social assets.");
        setIsGenerating(false);
        return;
      }

      const assetType = assetTypes.find(t => t.id === selectedType);

      const prompt = `Create a social media graphic for ${assetType.platform}:

Message: "${message}"
Brand Colors: ${brandKit.colors?.join(", ") || "modern colors"}
Brand Fonts: ${brandKit.fonts?.heading || "modern"} (heading), ${brandKit.fonts?.body || "sans-serif"} (body)
Brand Voice: ${brandKit.voice_guide || "professional and engaging"}

Design a ${assetType.dimensions} graphic that:
- Uses the brand colors harmoniously
- Has the message prominently displayed
- Includes brand elements if applicable
- Is visually engaging and platform-optimized
- Professional, modern design`;

      const { url } = await base44.integrations.Core.GenerateImage({ prompt });

      const captionPrompt = `Write an engaging caption for this ${assetType.platform} post about: "${message}"
      
Brand voice: ${brandKit.voice_guide || "professional and engaging"}
Include relevant hashtags and call-to-action.`;

      const { caption, hashtags } = await base44.integrations.Core.InvokeLLM({
        prompt: captionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } }
          }
        }
      });

      const asset = {
        type: selectedType,
        platform: assetType.platform,
        message,
        image_url: url,
        caption,
        hashtags,
        dimensions: assetType.dimensions
      };

      setGeneratedAssets([asset, ...generatedAssets]);
      onAssetGenerated?.(asset);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 100
      });

      await base44.entities.UsageLog.create({
        feature: "SocialMediaAssetGenerator",
        credits_used: 100,
        details: `Generated ${assetType.name}: ${message}`
      });

    } catch (error) {
      console.error("Asset generation failed:", error);
      alert("Failed to generate social asset. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleDownload = async (asset) => {
    try {
      const response = await fetch(asset.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.platform}_${asset.type}_${Date.now()}.png`;
      a.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (publishingAsset) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setPublishingAsset(null)}
          variant="outline"
        >
          ← Back to Assets
        </Button>
        <SocialPublisher
          asset={publishingAsset}
          brandKit={brandKit}
          onPublished={() => {
            setPublishingAsset(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold">Social Media Asset Generator</h3>
          <Badge className="ml-auto">100 credits</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Asset Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} ({type.dimensions})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message / Content</label>
            <Input
              placeholder="e.g., New product launch announcement"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !message.trim() || !brandKit}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Asset...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate Social Asset
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedAssets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedAssets.map((asset, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden">
              <img 
                src={asset.image_url} 
                alt={asset.type}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{asset.platform}</Badge>
                  <span className="text-xs text-gray-400">{asset.dimensions}</span>
                </div>
                <p className="text-sm text-gray-300">{asset.message}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(asset)}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPublishingAsset(asset)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Share2 className="w-3 h-3 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}