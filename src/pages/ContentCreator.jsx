
"use client";
import React, { useState, useEffect } from "react";
import { ContentPiece, Template, User, UsageLog } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Video, Image as ImageIcon, MessageCircle, 
  Mail, Megaphone, Wand2, Eye, Download, Copy,
  Instagram, Youtube, Facebook, Twitter, Zap, // Changed TikTok to Zap
  Plus, Sparkles, Calendar
} from "lucide-react";

const contentTypes = {
  blog: { icon: FileText, name: "Blog Article", credits: 75 },
  social_post: { icon: MessageCircle, name: "Social Media Post", credits: 25 },
  video_script: { icon: Video, name: "Video Script", credits: 50 },
  ad_copy: { icon: Megaphone, name: "Ad Copy", credits: 40 },
  email: { icon: Mail, name: "Email Campaign", credits: 60 },
  product_description: { icon: ImageIcon, name: "Product Description", credits: 30 }
};

const platforms = {
  Instagram: { icon: Instagram, color: "text-pink-400" },
  TikTok: { icon: Zap, color: "text-purple-400" }, // Changed icon to Zap
  YouTube: { icon: Youtube, color: "text-red-400" },
  Facebook: { icon: Facebook, color: "text-blue-400" },
  Twitter: { icon: Twitter, color: "text-blue-300" },
  Blog: { icon: FileText, color: "text-green-400" },
  Email: { icon: Mail, color: "text-yellow-400" }
};

const ContentCard = ({ content, onEdit, onView }) => {
  const ContentIcon = contentTypes[content.type]?.icon || FileText;
  const PlatformIcon = platforms[content.platform]?.icon || FileText;
  
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ContentIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg line-clamp-1">{content.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <PlatformIcon className={`w-4 h-4 ${platforms[content.platform]?.color}`} />
                <span className="text-sm text-gray-400">{content.platform}</span>
              </div>
            </div>
          </div>
          <Badge className={`${
            content.status === 'published' ? 'bg-green-500/20 text-green-400' :
            content.status === 'ready' ? 'bg-blue-500/20 text-blue-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {content.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-300 line-clamp-3">{content.content}</p>
        
        <div className="text-xs text-gray-500">
          Created {new Date(content.created_date).toLocaleDateString()}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(content)}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(content)}>
            <Wand2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ContentCreator() {
  const [contents, setContents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Content Generator State
  const [generatorData, setGeneratorData] = useState({
    type: "",
    platform: "",
    topic: "",
    tone: "Professional",
    targetAudience: "",
    keywords: "",
    length: "Medium"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [contentData, templateData] = await Promise.all([
          ContentPiece.list("-created_date", 50),
          Template.list("-usage_count", 20)
        ]);
        setContents(contentData);
        setTemplates(templateData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const generateContent = async () => {
    setIsGenerating(true);
    const creditsToUse = contentTypes[generatorData.type]?.credits || 50;

    try {
      const user = await User.me();
      if (user.credits_remaining < creditsToUse) {
        alert(`Insufficient credits. You need ${creditsToUse} credits.`);
        setIsGenerating(false);
        return;
      }

      // Generate content based on type and platform
      const contentPrompt = `
        Create ${contentTypes[generatorData.type]?.name} content for ${generatorData.platform}.
        
        Topic: ${generatorData.topic}
        Tone: ${generatorData.tone}
        Target Audience: ${generatorData.targetAudience}
        Keywords: ${generatorData.keywords}
        Length: ${generatorData.length}
        
        Requirements:
        - Optimized for ${generatorData.platform} platform
        - ${generatorData.tone} tone of voice
        - Include relevant hashtags if applicable
        - SEO optimized if for web content
        - Engaging and action-oriented
        - Platform-specific formatting
        
        ${generatorData.type === 'social_post' ? 'Include 5-10 relevant hashtags' : ''}
        ${generatorData.type === 'video_script' ? 'Include timestamps and scene descriptions' : ''}
        ${generatorData.type === 'ad_copy' ? 'Include compelling call-to-action' : ''}
        
        Generate comprehensive content with metadata.
      `;

      const contentData = await InvokeLLM({
        prompt: contentPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            metadata: {
              type: "object",
              properties: {
                hashtags: { type: "array", items: { type: "string" } },
                keywords: { type: "array", items: { type: "string" } },
                word_count: { type: "number" },
                reading_time: { type: "string" },
                call_to_action: { type: "string" }
              }
            }
          }
        }
      });

      // Create content piece
      const newContent = await ContentPiece.create({
        title: contentData.title,
        type: generatorData.type,
        platform: generatorData.platform,
        content: contentData.content,
        metadata: contentData.metadata,
        status: "ready"
      });

      // Update credits and log
      await User.updateMyUserData({ 
        credits_remaining: user.credits_remaining - creditsToUse 
      });
      
      await UsageLog.create({
        feature: "ContentCreator",
        credits_used: creditsToUse,
        details: `Generated ${generatorData.type} for ${generatorData.platform}: ${contentData.title}`
      });

      setContents([newContent, ...contents]);
      setGeneratedContent(newContent);
      setShowGenerator(false);

    } catch (e) {
      console.error(e);
      alert("Content generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleView = (content) => {
    setGeneratedContent(content);
  };

  const handleEdit = (content) => {
    // Navigate to content editor
    console.log("Edit content:", content);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Content Creator
          </h1>
          <p className="text-gray-400">AI-powered content generation for all platforms</p>
        </div>
        <Button 
          onClick={() => setShowGenerator(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Content
        </Button>
      </div>

      {/* Content Generator */}
      {showGenerator && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              AI Content Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Content Type *</Label>
                <Select 
                  value={generatorData.type} 
                  onValueChange={(value) => setGeneratorData({...generatorData, type: value})}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentTypes).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          {config.name} ({config.credits} credits)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select 
                  value={generatorData.platform} 
                  onValueChange={(value) => setGeneratorData({...generatorData, platform: value})}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(platforms).map(([platform, config]) => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          {platform}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select 
                  value={generatorData.tone} 
                  onValueChange={(value) => setGeneratorData({...generatorData, tone: value})}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Authoritative">Authoritative</SelectItem>
                    <SelectItem value="Conversational">Conversational</SelectItem>
                    <SelectItem value="Humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Topic/Subject *</Label>
                <Textarea
                  placeholder="What should the content be about?"
                  value={generatorData.topic}
                  onChange={(e) => setGeneratorData({...generatorData, topic: e.target.value})}
                  className="bg-gray-900 border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  placeholder="e.g., Young professionals, Parents, Tech enthusiasts"
                  value={generatorData.targetAudience}
                  onChange={(e) => setGeneratorData({...generatorData, targetAudience: e.target.value})}
                  className="bg-gray-900 border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Input
                  placeholder="SEO keywords, hashtags, etc."
                  value={generatorData.keywords}
                  onChange={(e) => setGeneratorData({...generatorData, keywords: e.target.value})}
                  className="bg-gray-900 border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Content Length</Label>
                <Select 
                  value={generatorData.length} 
                  onValueChange={(value) => setGeneratorData({...generatorData, length: value})}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowGenerator(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button 
                onClick={generateContent}
                disabled={isGenerating || !generatorData.type || !generatorData.platform || !generatorData.topic}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content ({contentTypes[generatorData.type]?.credits || 50} Credits)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card className="bg-green-900/20 border-green-700">
          <CardHeader>
            <CardTitle className="text-green-400">Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Title</p>
                <p className="font-medium">{generatedContent.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Platform</p>
                <div className="flex items-center gap-2">
                  {React.createElement(platforms[generatedContent.platform]?.icon, { 
                    className: `w-4 h-4 ${platforms[generatedContent.platform]?.color}` 
                  })}
                  <span>{generatedContent.platform}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{generatedContent.content}</pre>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                Close
              </Button>
              <Button>
                <Copy className="w-4 h-4 mr-2" />
                Copy Content
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="content">My Content</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No content yet</h3>
              <p className="text-gray-500 mb-6">Start by generating your first AI-powered content</p>
              <Button onClick={() => setShowGenerator(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Content
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Content templates coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Content calendar coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
