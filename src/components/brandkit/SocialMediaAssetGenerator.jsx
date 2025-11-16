import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Instagram, Facebook, Loader2, Download, 
  Image as ImageIcon, MessageSquare, Video 
} from "lucide-react";

const assetTypes = [
  { id: "instagram_post", name: "Instagram Post", platform: "Instagram", size: "1080x1080" },
  { id: "instagram_story", name: "Instagram Story", platform: "Instagram", size: "1080x1920" },
  { id: "facebook_post", name: "Facebook Post", platform: "Facebook", size: "1200x630" },
  { id: "facebook_cover", name: "Facebook Cover", platform: "Facebook", size: "820x312" },
  { id: "twitter_post", name: "Twitter Post", platform: "Twitter", size: "1200x675" },
  { id: "linkedin_post", name: "LinkedIn Post", platform: "LinkedIn", size: "1200x627" },
  { id: "tiktok_cover", name: "TikTok Profile", platform: "TikTok", size: "1080x1080" },
  { id: "youtube_thumbnail", name: "YouTube Thumbnail", platform: "YouTube", size: "1280x720" }
];

export default function SocialMediaAssetGenerator({ brandKit }) {
  const [selectedType, setSelectedType] = useState("instagram_post");
  const [messageText, setMessageText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState([]);

  const handleGenerate = async () => {
    if (!messageText.trim()) return;

    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      
      if (user.credits_remaining < 150) {
        alert("Insufficient credits. You need at least 150 credits to generate social media assets.");
        setIsGenerating(false);
        return;
      }

      const assetType = assetTypes.find(t => t.id === selectedType);
      
      const prompt = `Create a social media ${assetType.name} graphic design concept for a brand with these details:

Brand: ${brandKit.name}
Colors: ${brandKit.colors?.join(", ") || "Not specified"}
Fonts: Heading - ${brandKit.fonts?.heading || "Sans-serif"}, Body - ${brandKit.fonts?.body || "Sans-serif"}
Voice: ${brandKit.voice_guide || "Professional"}
Tagline: ${brandKit.tagline || ""}

Message: ${messageText}

Platform: ${assetType.platform}
Size: ${assetType.size}px

Describe in detail:
1. The visual layout and composition
2. How to use the brand colors effectively
3. Text placement and hierarchy
4. Visual elements or graphics to include
5. Call-to-action placement
6. Overall mood and style

Make it eye-catching and on-brand.`;

      const description = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            layout_description: { type: "string" },
            color_usage: { type: "string" },
            text_elements: { type: "string" },
            visual_elements: { type: "string" },
            call_to_action: { type: "string" },
            style_notes: { type: "string" }
          }
        }
      });

      // Generate the actual image
      const imagePrompt = `Professional social media graphic for ${assetType.platform}:
${description.layout_description}
Colors: ${brandKit.colors?.join(", ")}
Style: Modern, clean, ${description.style_notes}
Text overlay: "${messageText}"
${description.visual_elements}
High quality, professional design, ${assetType.size}`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });

      const newAsset = {
        id: Date.now(),
        type: selectedType,
        typeName: assetType.name,
        message: messageText,
        imageUrl: url,
        description,
        size: assetType.size
      };

      setGeneratedAssets([newAsset, ...generatedAssets]);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 150
      });

      await base44.entities.UsageLog.create({
        feature: "SocialMediaAssetGenerator",
        credits_used: 150,
        details: `Generated ${assetType.name} for ${brandKit.name}`
      });

      setMessageText("");

    } catch (error) {
      console.error("Asset generation failed:", error);
      alert("Failed to generate asset. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleDownload = async (asset) => {
    try {
      const response = await fetch(asset.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandKit.name}_${asset.typeName.replace(/\s+/g, '_')}_${asset.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download asset. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-pink-400" />
          <h3 className="text-xl font-semibold">Social Media Asset Generator</h3>
          <Badge className="ml-auto">150 credits</Badge>
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
                    {type.name} ({type.size})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message / Caption</label>
            <Input
              placeholder="e.g., New collection launching soon! Stay tuned..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !messageText.trim()}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Asset...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Generate Social Media Asset
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedAssets.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Generated Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedAssets.map((asset) => (
              <Card key={asset.id} className="bg-gray-800 border-gray-700 overflow-hidden">
                <img 
                  src={asset.imageUrl} 
                  alt={asset.typeName}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{asset.typeName}</h4>
                      <p className="text-xs text-gray-400">{asset.size}px</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(asset)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </div>
                  <p className="text-sm text-gray-300">{asset.message}</p>
                  <div className="text-xs text-gray-400">
                    <p><strong>Layout:</strong> {asset.description.layout_description?.substring(0, 100)}...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}