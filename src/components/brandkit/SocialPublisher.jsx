import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Share2, Instagram, Facebook, Twitter, Loader2, CheckCircle2 
} from "lucide-react";

const socialPlatforms = [
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: Instagram, 
    color: "text-pink-400",
    maxChars: 2200
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: Facebook, 
    color: "text-blue-400",
    maxChars: 63206
  },
  { 
    id: "twitter", 
    name: "Twitter/X", 
    icon: Twitter, 
    color: "text-sky-400",
    maxChars: 280
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    icon: Share2, 
    color: "text-blue-500",
    maxChars: 3000
  }
];

export default function SocialPublisher({ asset, brandKit, onPublished }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [caption, setCaption] = useState(asset.caption || "");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return;

    setIsPublishing(true);
    setPublishResults(null);

    try {
      // Simulate publishing to each platform
      const results = {};
      for (const platformId of selectedPlatforms) {
        // In a real implementation, this would use platform APIs
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockPostId = `${platformId}_${Date.now()}`;
        results[platformId] = {
          success: true,
          postId: mockPostId,
          url: `https://${platformId}.com/post/${mockPostId}`
        };
      }

      setPublishResults(results);
      onPublished?.(results);

    } catch (error) {
      console.error("Publishing failed:", error);
      alert("Failed to publish to some platforms. Please try again.");
    }

    setIsPublishing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Share2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold">Publish to Social Media</h3>
        </div>

        {/* Asset Preview */}
        {asset.image_url && (
          <div className="mb-6 bg-gray-900 rounded-lg overflow-hidden">
            <img 
              src={asset.image_url} 
              alt={asset.type}
              className="w-full max-w-md mx-auto"
            />
          </div>
        )}

        {/* Caption */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Caption</label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption here..."
            className="bg-gray-900 border-gray-600 min-h-[100px]"
          />
          <p className="text-xs text-gray-400 mt-1">
            {caption.length} characters
          </p>
        </div>

        {/* Platform Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            const captionTooLong = caption.length > platform.maxChars;

            return (
              <div
                key={platform.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-700 hover:border-gray-600"
                } ${captionTooLong ? "opacity-50" : ""}`}
                onClick={() => !captionTooLong && togglePlatform(platform.id)}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={captionTooLong}
                  className="pointer-events-none"
                />
                <Icon className={`w-6 h-6 ${platform.color}`} />
                <div className="flex-1">
                  <h4 className="font-semibold">{platform.name}</h4>
                  <p className="text-xs text-gray-400">
                    Max {platform.maxChars} chars
                    {captionTooLong && " - Caption too long"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handlePublish}
          disabled={selectedPlatforms.length === 0 || isPublishing || !caption.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </Card>

      {publishResults && (
        <Card className="bg-gray-800 border-green-900/50 border-2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-green-400">Successfully Published!</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(publishResults).map(([platform, data]) => {
              const platformInfo = socialPlatforms.find(p => p.id === platform);
              const Icon = platformInfo.icon;
              
              return (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${platformInfo.color}`} />
                    <span className="font-medium capitalize">{platform}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(data.url, '_blank')}
                  >
                    View Post
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-xs text-gray-400">
          💡 <strong>Tip:</strong> Optimize your captions for each platform. Use relevant hashtags and mentions to increase engagement.
        </p>
      </Card>
    </div>
  );
}