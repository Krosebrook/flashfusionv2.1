import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Send, Save } from "lucide-react";

const platforms = [
  { id: "LinkedIn", name: "LinkedIn", color: "text-blue-400" },
  { id: "TikTok", name: "TikTok", color: "text-pink-400" },
  { id: "Facebook", name: "Facebook", color: "text-blue-500" },
  { id: "Instagram", name: "Instagram", color: "text-purple-400" },
  { id: "Twitter", name: "Twitter / X", color: "text-gray-400" },
];

export default function SocialMediaCampaign({ campaign, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    social_content: campaign?.social_content || "",
    social_platforms: campaign?.social_platforms || [],
    scheduled_date: campaign?.scheduled_date || "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const togglePlatform = (platformId) => {
    setFormData({
      ...formData,
      social_platforms: formData.social_platforms.includes(platformId)
        ? formData.social_platforms.filter(p => p !== platformId)
        : [...formData.social_platforms, platformId],
    });
  };

  const generateContent = async () => {
    if (!formData.name) {
      alert("Please enter a campaign name first");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create engaging social media content for:

Campaign: ${formData.name}
Platforms: ${formData.social_platforms.join(", ") || "All platforms"}

Generate:
- Compelling post copy (max 280 chars for cross-platform compatibility)
- Include 3-5 relevant hashtags
- Add emoji for engagement
- Include a clear call-to-action

Make it shareable and conversion-focused.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            post_content: { type: "string" },
          },
        },
      });

      setFormData({
        ...formData,
        social_content: result.post_content,
      });
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("Failed to generate content. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSave = async (status = "draft") => {
    if (!formData.name || !formData.social_content || formData.social_platforms.length === 0) {
      alert("Please fill in all required fields and select at least one platform");
      return;
    }

    setIsSaving(true);
    try {
      const campaignData = {
        ...formData,
        type: "social",
        status,
      };

      if (campaign) {
        await base44.entities.MarketingCampaign.update(campaign.id, campaignData);
      } else {
        await base44.entities.MarketingCampaign.create(campaignData);
      }

      onSave();
    } catch (error) {
      console.error("Failed to save campaign:", error);
      alert("Failed to save campaign. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6">Social Media Campaign</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Campaign Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Product Launch Announcement"
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Select Platforms *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.social_platforms.includes(platform.id)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <Checkbox
                    checked={formData.social_platforms.includes(platform.id)}
                    className="pointer-events-none"
                  />
                  <span className={platform.color}>{platform.name}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={generateContent}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>

          <div>
            <label className="block text-sm font-medium mb-2">
              Post Content *
            </label>
            <Textarea
              value={formData.social_content}
              onChange={(e) =>
                setFormData({ ...formData, social_content: e.target.value })
              }
              placeholder="Write your post content..."
              className="bg-gray-900 border-gray-600 min-h-[200px]"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.social_content.length} characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Schedule Post (Optional)
            </label>
            <Input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(formData.scheduled_date ? "scheduled" : "active")}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {formData.scheduled_date ? "Schedule Post" : "Publish Now"}
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      {formData.social_content && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-200 whitespace-pre-wrap">{formData.social_content}</p>
          </div>
        </Card>
      )}
    </div>
  );
}