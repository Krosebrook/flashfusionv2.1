import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Download, Sparkles, Crown } from "lucide-react";

export default function MarketplaceCard({ template, onSelect }) {
  return (
    <Card
      className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-all cursor-pointer"
      onClick={() => onSelect(template)}
    >
      <div className="space-y-4">
        {template.preview_image && (
          <img
            src={template.preview_image}
            alt={template.name}
            className="w-full h-40 object-cover rounded-lg"
          />
        )}

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{template.name}</h3>
                {template.is_featured && (
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                )}
                {template.is_premium && (
                  <Crown className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-gray-400 line-clamp-2">
            {template.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span>{template.rating?.toFixed(1) || "0.0"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{template.installs || 0}</span>
              </div>
            </div>
            {template.credits_cost > 0 && (
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                {template.credits_cost} credits
              </Badge>
            )}
          </div>
        </div>

        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
          View Details
        </Button>
      </div>
    </Card>
  );
}
