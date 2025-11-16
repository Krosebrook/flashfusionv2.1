"use client";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Video, Smile, Eye, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import VideoScriptGenerator from "../components/content/VideoScriptGenerator";
import MemeGenerator from "../components/content/MemeGenerator";
import ContentPreview from "../components/content/ContentPreview";

const platformIcons = {
  Instagram: "📸",
  TikTok: "🎵",
  YouTube: "▶️",
  Facebook: "👍",
  Twitter: "🐦",
  LinkedIn: "💼",
  Blog: "📝",
  Email: "✉️",
  General: "🌐"
};

const ContentCard = ({ content, onPreview, onDelete }) => {
  const typeColors = {
    blog: "bg-blue-500/20 text-blue-400",
    social_post: "bg-purple-500/20 text-purple-400",
    video_script: "bg-red-500/20 text-red-400",
    meme: "bg-yellow-500/20 text-yellow-400",
    ad_copy: "bg-green-500/20 text-green-400",
    email: "bg-pink-500/20 text-pink-400"
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-all">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{content.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={typeColors[content.type] || "bg-gray-500/20 text-gray-400"}>
                {content.type.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {platformIcons[content.platform]} {content.platform}
              </Badge>
              {content.variations?.length > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                  {content.variations.length} variations
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(content)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-400 line-clamp-3">
          {content.content}
        </p>

        {content.metadata?.hashtags && (
          <div className="flex flex-wrap gap-1">
            {content.metadata.hashtags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => onPreview(content)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="w-3 h-3 mr-2" />
            Preview
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function ContentCreator() {
  const [contents, setContents] = useState([]);
  const [brandKits, setBrandKits] = useState([]);
  const [selectedBrandKit, setSelectedBrandKit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [previewContent, setPreviewContent] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [contentsData, brandKitsData] = await Promise.all([
        base44.entities.ContentPiece.list("-created_date"),
        base44.entities.BrandKit.list()
      ]);
      setContents(contentsData);
      setBrandKits(brandKitsData);
      if (brandKitsData.length > 0 && !selectedBrandKit) {
        setSelectedBrandKit(brandKitsData[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (content) => {
    if (!confirm(`Delete "${content.title}"?`)) return;
    
    try {
      await base44.entities.ContentPiece.delete(content.id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete content:", error);
      alert("Failed to delete content. Please try again.");
    }
  };

  const filteredContents = activeTab === "all" 
    ? contents 
    : contents.filter(c => c.type === activeTab);

  const stats = {
    total: contents.length,
    video_scripts: contents.filter(c => c.type === "video_script").length,
    memes: contents.filter(c => c.type === "meme").length,
    social_posts: contents.filter(c => c.type === "social_post").length
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-purple-400" />
          <span>Content Creator Studio</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          AI-powered video scripts, memes, social graphics, and A/B testing for maximum engagement
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Content</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-red-400">{stats.video_scripts}</div>
          <div className="text-sm text-gray-400">Video Scripts</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">{stats.memes}</div>
          <div className="text-sm text-gray-400">Memes</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{stats.social_posts}</div>
          <div className="text-sm text-gray-400">Social Posts</div>
        </div>
      </div>

      {previewContent ? (
        <div className="space-y-6">
          <Button
            onClick={() => setPreviewContent(null)}
            variant="outline"
          >
            ← Back to Content
          </Button>
          <ContentPreview
            content={previewContent}
            onVariationsGenerated={() => fetchData()}
          />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="all">All Content ({contents.length})</TabsTrigger>
            <TabsTrigger value="video_script">
              <Video className="w-4 h-4 mr-2" />
              Video Scripts
            </TabsTrigger>
            <TabsTrigger value="meme">
              <Smile className="w-4 h-4 mr-2" />
              Memes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={() => setActiveTab("video_script")} className="flex-1 bg-red-600 hover:bg-red-700">
                <Video className="w-4 h-4 mr-2" />
                Create Video Script
              </Button>
              <Button onClick={() => setActiveTab("meme")} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                <Smile className="w-4 h-4 mr-2" />
                Generate Meme
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No content yet</h3>
                <p className="text-gray-500 mb-6">
                  Start creating amazing content with AI
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onPreview={setPreviewContent}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="video_script" className="space-y-6">
            <VideoScriptGenerator
              brandKitId={selectedBrandKit}
              onScriptGenerated={(script) => {
                fetchData();
                setActiveTab("all");
              }}
            />
          </TabsContent>

          <TabsContent value="meme" className="space-y-6">
            <MemeGenerator
              brandKitId={selectedBrandKit}
              onMemeGenerated={(meme) => {
                fetchData();
                setActiveTab("all");
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}