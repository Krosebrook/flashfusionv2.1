import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Share2, ShoppingBag, Store, Facebook, 
  Loader2, CheckCircle2, ExternalLink 
} from "lucide-react";

const platforms = [
  { 
    id: "Shopify", 
    name: "Shopify", 
    icon: ShoppingBag, 
    color: "text-green-400",
    description: "Full-featured online store"
  },
  { 
    id: "Etsy", 
    name: "Etsy", 
    icon: Store, 
    color: "text-orange-400",
    description: "Handmade & vintage marketplace"
  },
  { 
    id: "eBay", 
    name: "eBay", 
    icon: Store, 
    color: "text-yellow-400",
    description: "Global auction & shopping"
  },
  { 
    id: "Facebook", 
    name: "Facebook Marketplace", 
    icon: Facebook, 
    color: "text-blue-400",
    description: "Local & social commerce"
  },
  { 
    id: "TikTok", 
    name: "TikTok Shop", 
    icon: Share2, 
    color: "text-pink-400",
    description: "Social commerce platform"
  }
];

export default function PlatformPublisher({ product, onPublished }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
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
        // In a real implementation, this would call actual platform APIs
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockProductId = `${platformId.toLowerCase()}_${Date.now()}`;
        results[platformId] = {
          success: true,
          productId: mockProductId,
          url: `https://${platformId.toLowerCase()}.com/product/${mockProductId}`
        };
      }

      // Update product with platform IDs
      const updatedProduct = {
        ...product,
        platforms: [...new Set([...(product.platforms || []), ...selectedPlatforms])],
        platform_ids: {
          ...(product.platform_ids || {}),
          ...Object.fromEntries(
            Object.entries(results).map(([platform, data]) => [platform, data.productId])
          )
        },
        status: "published"
      };

      setPublishResults(results);
      onPublished?.(updatedProduct);

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
          <Share2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-semibold">Publish to Platforms</h3>
        </div>

        <div className="space-y-4 mb-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            const isPublished = product.platforms?.includes(platform.id);

            return (
              <div
                key={platform.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600"
                } ${isPublished ? "opacity-50" : ""}`}
                onClick={() => !isPublished && togglePlatform(platform.id)}
              >
                <Checkbox
                  checked={isSelected || isPublished}
                  disabled={isPublished}
                  className="pointer-events-none"
                />
                <Icon className={`w-6 h-6 ${platform.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{platform.name}</h4>
                    {isPublished && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        Published
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{platform.description}</p>
                </div>
                {isPublished && product.platform_ids?.[platform.id] && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://${platform.id.toLowerCase()}.com/product/${product.platform_ids[platform.id]}`, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={handlePublish}
          disabled={selectedPlatforms.length === 0 || isPublishing}
          className="w-full bg-blue-600 hover:bg-blue-700"
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
              const platformInfo = platforms.find(p => p.id === platform);
              const Icon = platformInfo.icon;
              
              return (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${platformInfo.color}`} />
                    <span className="font-medium">{platform}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(data.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {product.platforms?.length > 0 && !publishResults && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-sm text-gray-400 text-center">
            This product is currently published on {product.platforms.length} platform{product.platforms.length !== 1 ? 's' : ''}
          </p>
        </Card>
      )}
    </div>
  );
}