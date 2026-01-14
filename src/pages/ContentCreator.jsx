import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, Video, Smile, Eye, Trash2, 
  Sparkles, Recycle, GitBranch, Target
} from "lucide-react";

import VideoScriptGenerator from "../components/content/VideoScriptGenerator";
import MemeGenerator from "../components/content/MemeGenerator";
import ContentPreview from "../components/content/ContentPreview";
import AIContentAssistant from "../components/content/AIContentAssistant";
import ContentRepurposingTool from "../components/content/ContentRepurposingTool";
import ABTestingGenerator from "../components/content/ABTestingGenerator";
import SocialMediaCopyGenerator from "../components/content/SocialMediaCopyGenerator";
import EmailMarketingGenerator from "../components/content/EmailMarketingGenerator";
import AdCopyGenerator from "../components/content/AdCopyGenerator";

const platformIcons = {
  Instagram: "📸",
  TikTok: "🎵",
  YouTube: "▶️",
  Facebook: "👥",
  Twitter: "🐦",
  LinkedIn: "💼"
};

const ContentCard = ({ content, onPreview, onDelete }) => (
  <Card className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-all">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{content.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {content.type.replace(/_/g, ' ')}
            </Badge>
            <span className="text-xl">{platformIcons[content.platform] || "📱"}</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(content)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-sm text-gray-400 line-clamp-2">
        {content.content.substring(0, 100)}...
      </p>

      {content.metadata?.hashtags && (
        <div className="flex flex-wrap gap-1">
          {content.metadata.hashtags.slice(0, 3).map((tag, i) => (
            <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <Button
        size="sm"
        onClick={() => onPreview(content)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Eye className="w-3 h-3 mr-2" />
        View & Manage
      </Button>
    </div>
  </Card>
);

export default function ContentCreator() {
  const [contents, setContents] = useState([]);
  const [brandKits, setBrandKits] = useState([]);
  const [selectedBrandKit, setSelectedBrandKit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assistant");
  const [previewingContent, setPreviewingContent] = useState(null);
  const [selectedContentForTools, setSelectedContentForTools] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [contentData, brandKitData] = await Promise.all([
        base44.entities.ContentPiece.list("-created_date", 50),
        base44.entities.BrandKit.list()
      ]);
      setContents(contentData);
      setBrandKits(brandKitData);
      if (brandKitData.length > 0 && !selectedBrandKit) {
        setSelectedBrandKit(brandKitData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (content) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    try {
      await base44.entities.ContentPiece.delete(content.id);
      setContents(contents.filter(c => c.id !== content.id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    // Redirect to appropriate generator based on suggestion type
    if (suggestion.type === 'video_script') {
      setActiveTab("video");
    } else if (suggestion.type === 'meme') {
      setActiveTab("meme");
    }
  };

  const stats = {
    total: contents.length,
    videoScripts: contents.filter(c => c.type === 'video_script').length,
    memes: contents.filter(c => c.type === 'meme' || c.type === 'graphic').length,
    social: contents.filter(c => c.type === 'social_post').length
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-purple-400" />
          <span>Content Creator Studio</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          AI-powered content creation with smart suggestions, repurposing, and A/B testing
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Content</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-red-400">{stats.videoScripts}</div>
          <div className="text-sm text-gray-400">Video Scripts</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">{stats.memes}</div>
          <div className="text-sm text-gray-400">Memes & Graphics</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{stats.social}</div>
          <div className="text-sm text-gray-400">Social Posts</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800 grid grid-cols-3 lg:grid-cols-9 w-full">
          <TabsTrigger value="assistant">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="social">
            <Target className="w-4 h-4 mr-2" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="email">
            <FileText className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="ads">
            <Target className="w-4 h-4 mr-2" />
            Ads
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="w-4 h-4 mr-2" />
            Video Script
          </TabsTrigger>
          <TabsTrigger value="meme">
            <Smile className="w-4 h-4 mr-2" />
            Meme
          </TabsTrigger>
          <TabsTrigger value="repurpose">
            <Recycle className="w-4 h-4 mr-2" />
            Repurpose
          </TabsTrigger>
          <TabsTrigger value="abtesting">
            <GitBranch className="w-4 h-4 mr-2" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="library">
            <FileText className="w-4 h-4 mr-2" />
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="space-y-6">
          <AIContentAssistant
            brandKit={selectedBrandKit}
            recentContent={contents}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialMediaCopyGenerator
            brandKitId={selectedBrandKit?.id}
            onCopyGenerated={() => {
              fetchData();
              setActiveTab("library");
            }}
          />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailMarketingGenerator
            brandKitId={selectedBrandKit?.id}
            onEmailGenerated={() => {
              fetchData();
              setActiveTab("library");
            }}
          />
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <AdCopyGenerator
            brandKitId={selectedBrandKit?.id}
            onAdGenerated={() => {
              fetchData();
              setActiveTab("library");
            }}
          />
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <VideoScriptGenerator
            brandKitId={selectedBrandKit?.id}
            onScriptGenerated={(script) => {
              fetchData();
              setActiveTab("library");
            }}
          />
        </TabsContent>

        <TabsContent value="meme" className="space-y-6">
          <MemeGenerator
            brandKitId={selectedBrandKit?.id}
            onMemeGenerated={(meme) => {
              fetchData();
              setActiveTab("library");
            }}
          />
        </TabsContent>

        <TabsContent value="repurpose" className="space-y-6">
          {selectedContentForTools ? (
            <>
              <Button
                onClick={() => setSelectedContentForTools(null)}
                variant="outline"
                className="mb-4"
              >
                ← Back to Content Selection
              </Button>
              <ContentRepurposingTool
                content={selectedContentForTools}
                onRepurposed={(newContent) => {
                  fetchData();
                  setSelectedContentForTools(null);
                }}
              />
            </>
          ) : (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Select Content to Repurpose</h3>
              {contents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No content available. Create some content first!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contents.map((content) => (
                    <Card
                      key={content.id}
                      className="bg-gray-900 border-gray-700 p-4 cursor-pointer hover:border-gray-600 transition-all"
                      onClick={() => setSelectedContentForTools(content)}
                    >
                      <h4 className="font-semibold mb-2 truncate">{content.title}</h4>
                      <Badge variant="outline" className="text-xs mb-2">
                        {content.type.replace(/_/g, ' ')}
                      </Badge>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {content.content.substring(0, 80)}...
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          {selectedContentForTools ? (
            <>
              <Button
                onClick={() => setSelectedContentForTools(null)}
                variant="outline"
                className="mb-4"
              >
                ← Back to Content Selection
              </Button>
              <ABTestingGenerator
                baseContent={selectedContentForTools}
                onVariationsGenerated={() => {
                  fetchData();
                }}
              />
            </>
          ) : (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Select Content for A/B Testing</h3>
              {contents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No content available. Create some content first!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contents.map((content) => (
                    <Card
                      key={content.id}
                      className="bg-gray-900 border-gray-700 p-4 cursor-pointer hover:border-gray-600 transition-all"
                      onClick={() => setSelectedContentForTools(content)}
                    >
                      <h4 className="font-semibold mb-2 truncate">{content.title}</h4>
                      <Badge variant="outline" className="text-xs mb-2">
                        {content.type.replace(/_/g, ' ')}
                      </Badge>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {content.content.substring(0, 80)}...
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {previewingContent ? (
            <>
              <Button
                onClick={() => setPreviewingContent(null)}
                variant="outline"
                className="mb-4"
              >
                ← Back to Library
              </Button>
              <ContentPreview
                content={previewingContent}
                onVariationsGenerated={(variations) => {
                  fetchData();
                }}
              />
            </>
          ) : (
            <>
              {contents.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No content yet</h3>
                  <p className="text-gray-400 mb-6">
                    Start creating content with our AI-powered tools
                  </p>
                  <Button onClick={() => setActiveTab("assistant")} className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Suggestions
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contents.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onPreview={setPreviewingContent}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}