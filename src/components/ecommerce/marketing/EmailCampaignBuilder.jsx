import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Send, Save } from "lucide-react";

export default function EmailCampaignBuilder({ campaign, onSave, onCancel }) {
  const [segments, setSegments] = useState([]);
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    subject_line: campaign?.subject_line || "",
    email_content: campaign?.email_content || "",
    target_segment: campaign?.target_segment || "",
    personalization_enabled: campaign?.personalization_enabled ?? true,
    scheduled_date: campaign?.scheduled_date || "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const data = await base44.entities.CustomerSegment.list();
      setSegments(data);
    } catch (error) {
      console.error("Failed to fetch segments:", error);
    }
  };

  const generateContent = async () => {
    if (!formData.name) {
      alert("Please enter a campaign name first");
      return;
    }

    setIsGenerating(true);
    try {
      const selectedSegment = segments.find(s => s.id === formData.target_segment);
      
      const prompt = `Create a compelling marketing email campaign for:

Campaign: ${formData.name}
Target Audience: ${selectedSegment ? `${selectedSegment.name} - ${selectedSegment.description}` : "All customers"}

Generate:
1. An attention-grabbing subject line (max 60 chars)
2. Professional HTML email content with:
   - Engaging opening
   - Clear value proposition
   - Call-to-action button
   - Professional closing
   - Personalization placeholders: {{customer_name}}, {{product_recommendations}}

Make it conversion-focused and mobile-responsive.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject_line: { type: "string" },
            email_html: { type: "string" },
          },
        },
      });

      setFormData({
        ...formData,
        subject_line: result.subject_line,
        email_content: result.email_html,
      });
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("Failed to generate content. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSave = async (status = "draft") => {
    if (!formData.name || !formData.subject_line || !formData.email_content) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const campaignData = {
        ...formData,
        type: "email",
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
        <h2 className="text-2xl font-bold mb-6">Email Campaign Builder</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Campaign Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Sale 2026"
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Segment</label>
            <Select
              value={formData.target_segment}
              onValueChange={(value) =>
                setFormData({ ...formData, target_segment: value })
              }
            >
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue placeholder="All customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Customers</SelectItem>
                {segments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name} ({segment.customer_count} customers)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
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
            {formData.personalization_enabled && (
              <Badge className="bg-purple-500/20 text-purple-400">
                AI Personalization Enabled
              </Badge>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Subject Line *
            </label>
            <Input
              value={formData.subject_line}
              onChange={(e) =>
                setFormData({ ...formData, subject_line: e.target.value })
              }
              placeholder="Your amazing subject line..."
              className="bg-gray-900 border-gray-600"
              maxLength={60}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.subject_line.length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Content (HTML) *
            </label>
            <Textarea
              value={formData.email_content}
              onChange={(e) =>
                setFormData({ ...formData, email_content: e.target.value })
              }
              placeholder="Enter HTML email content..."
              className="bg-gray-900 border-gray-600 min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use placeholders: {"{"}
              {"{"}customer_name{"}"}{"}"}
              , {"{"}
              {"{"}product_recommendations{"}"}{"}"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Schedule Send (Optional)
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
              {formData.scheduled_date ? "Schedule Campaign" : "Activate Campaign"}
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      {formData.email_content && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="bg-white p-6 rounded-lg">
            <div
              dangerouslySetInnerHTML={{
                __html: formData.email_content
                  .replace(/\{\{customer_name\}\}/g, "John Doe")
                  .replace(/\{\{product_recommendations\}\}/g, "Recommended products based on your interests"),
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}