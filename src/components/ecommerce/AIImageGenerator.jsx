import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Image as ImageIcon, Loader2, Check, Download, Plus } from "lucide-react";

export default function AIImageGenerator({ product, brandKit, onImagesGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [numVariations, setNumVariations] = useState(3);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [customPrompt, setCustomPrompt] = useState("");

  const generateImages = async () => {
    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      const creditsNeeded = numVariations * 100;
      
      if (user.credits_remaining < creditsNeeded) {
        alert(`Insufficient credits. You need ${creditsNeeded} credits to generate ${numVariations} images.`);
        setIsGenerating(false);
        return;
      }

      const brandContext = brandKit ? `
Style: ${brandKit.name} brand aesthetic
Colors: ${brandKit.colors?.join(", ") || "vibrant and modern"}
Mood: ${brandKit.voice_guide || "professional and appealing"}` : "";

      const basePrompt = customPrompt || `Professional product photography of ${product.title}. 
${product.description?.substring(0, 200)}
High quality, studio lighting, clean background, commercial photography style.
${brandContext}`;

      const images = [];
      
      for (let i = 0; i < numVariations; i++) {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: `${basePrompt}\nVariation ${i + 1}: ${i === 0 ? 'front view' : i === 1 ? 'detail shot' : 'lifestyle context'}`
        });
        
        images.push({
          url: result.url,
          variation: i + 1
        });
      }

      setGeneratedImages(images);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - creditsNeeded
      });

      await base44.entities.UsageLog.create({
        feature: "AIImageGenerator",
        credits_used: creditsNeeded,
        details: `Generated ${numVariations} images for: ${product.title}`
      });

    } catch (error) {
      console.error("Failed to generate images:", error);
      alert("Failed to generate images. Please try again.");
    }
    setIsGenerating(false);
  };

  const toggleImageSelection = (url) => {
    setSelectedImages(prev =>
      prev.includes(url)
        ? prev.filter(u => u !== url)
        : [...prev, url]
    );
  };

  const handleSaveImages = async () => {
    if (selectedImages.length === 0) return;

    try {
      const currentImages = product.images || [];
      const updatedImages = [...currentImages, ...selectedImages];

      await base44.entities.EcommerceProduct.update(product.id, {
        images: updatedImages
      });

      onImagesGenerated?.(updatedImages);
      setGeneratedImages([]);
      setSelectedImages([]);
    } catch (error) {
      console.error("Failed to save images:", error);
      alert("Failed to save images. Please try again.");
    }
  };

  const downloadImage = (url, index) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.title.replace(/\s+/g, '_')}_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Image Generator
          </h3>
          <p className="text-sm text-gray-400">Generate product images with AI</p>
        </div>
        <Badge>{numVariations * 100} credits</Badge>
      </div>

      {generatedImages.length === 0 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Number of Variations</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map(num => (
                <Button
                  key={num}
                  size="sm"
                  variant={numVariations === num ? "default" : "outline"}
                  onClick={() => setNumVariations(num)}
                  className={numVariations === num ? "bg-purple-600" : ""}
                >
                  {num}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">100 credits per image</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Custom Prompt (Optional)</label>
            <Input
              placeholder="e.g., Add warm lighting, show product in kitchen setting..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave empty to use automatic prompt based on product details
            </p>
          </div>

          <Button
            onClick={generateImages}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating {numVariations} Images...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {numVariations} Images ({numVariations * 100} credits)
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {generatedImages.map((img, i) => (
              <div key={i} className="relative group">
                <div
                  className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImages.includes(img.url)
                      ? "border-green-500 shadow-lg shadow-green-500/20"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => toggleImageSelection(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`Variation ${img.variation}`}
                    className="w-full h-48 object-cover"
                  />
                  {selectedImages.includes(img.url) && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <Check className="w-12 h-12 text-green-400" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-black/60">
                    Variation {img.variation}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(img.url, i);
                  }}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-400 text-center">
            {selectedImages.length === 0
              ? "Click images to select for your product"
              : `${selectedImages.length} image${selectedImages.length !== 1 ? 's' : ''} selected`}
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveImages}
              disabled={selectedImages.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {selectedImages.length || 0} to Product
            </Button>
            <Button
              onClick={() => {
                setGeneratedImages([]);
                setSelectedImages([]);
                setCustomPrompt("");
              }}
              variant="outline"
              className="flex-1"
            >
              Generate New
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}