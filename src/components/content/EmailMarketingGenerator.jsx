import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Mail, Copy, Check } from "lucide-react";

const emailTypes = {
  promotional: "Promotional - Sales and offers",
  newsletter: "Newsletter - Updates and content",
  welcome: "Welcome - Onboarding new subscribers",
  announcement: "Announcement - Product/company news"
};

export default function EmailMarketingGenerator({ brandKitId, onEmailGenerated }) {
  const [emailType, setEmailType] = useState("promotional");
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const handleGenerate = async () => {
    if (!purpose.trim()) return;

    setIsGenerating(true);
    try {
      const prompt = `Generate email marketing copy for a ${emailType} email.

Purpose: ${purpose}
${audience ? `Target Audience: ${audience}` : ''}
${keyPoints ? `Key Points to Include: ${keyPoints}` : ''}

Requirements:
- Compelling subject line (under 50 characters, attention-grabbing)
- Preview text (under 100 characters)
- Email body (well-structured with clear sections)
- Strong call-to-action (CTA)
- Professional and engaging tone
- Mobile-friendly formatting

Return JSON with structure:
{
  "subject_line": "email subject",
  "preview_text": "preview snippet",
  "body": "email body content with proper formatting",
  "cta": "call to action text",
  "cta_button": "button text"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject_line: { type: "string" },
            preview_text: { type: "string" },
            body: { type: "string" },
            cta: { type: "string" },
            cta_button: { type: "string" }
          }
        }
      });

      setGeneratedEmail(result);

      // Save to database
      await base44.entities.ContentPiece.create({
        title: `Email: ${result.subject_line}`,
        type: "email",
        platform: "Email",
        content: result.body,
        brand_kit_id: brandKitId,
        metadata: {
          subject_line: result.subject_line,
          preview_text: result.preview_text,
          cta: result.cta,
          cta_button: result.cta_button,
          email_type: emailType
        }
      });

      if (onEmailGenerated) onEmailGenerated();
    } catch (error) {
      console.error("Failed to generate email:", error);
    }
    setIsGenerating(false);
  };

  const handleCopy = (field, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-400" />
          Email Marketing Generator
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Type</label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(emailTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Purpose</label>
            <Input
              placeholder="E.g., Announce 30% off sale on all products"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Audience (Optional)</label>
            <Input
              placeholder="E.g., Existing customers, Newsletter subscribers"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Key Points to Include (Optional)</label>
            <Textarea
              placeholder="List important details, offers, deadlines, or features to highlight..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              className="bg-gray-900 border-gray-600 h-24"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !purpose.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Email"}
          </Button>
        </div>
      </Card>

      {generatedEmail && (
        <div className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-400">Subject Line</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy("subject", generatedEmail.subject_line)}
              >
                {copiedField === "subject" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-lg font-semibold">{generatedEmail.subject_line}</p>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-400">Preview Text</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy("preview", generatedEmail.preview_text)}
              >
                {copiedField === "preview" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-gray-300">{generatedEmail.preview_text}</p>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-400">Email Body</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy("body", generatedEmail.body)}
              >
                {copiedField === "body" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{generatedEmail.body}</p>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-400">Call to Action</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy("cta", generatedEmail.cta)}
              >
                {copiedField === "cta" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300">{generatedEmail.cta}</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {generatedEmail.cta_button}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}