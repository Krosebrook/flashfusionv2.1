
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, Palette, Type, Download, Loader2, 
  Check, Image as ImageIcon, FileText, Zap
} from "lucide-react";

import SocialMediaAssetGenerator from "../brandkit/SocialMediaAssetGenerator";

const brandStyles = [
  { id: "modern", name: "Modern & Minimal", colors: ["#000000", "#FFFFFF", "#3B82F6"], mood: "Clean, professional, tech-forward" },
  { id: "vibrant", name: "Bold & Vibrant", colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"], mood: "Energetic, fun, attention-grabbing" },
  { id: "elegant", name: "Elegant & Luxurious", colors: ["#1A1A2E", "#C5A572", "#FFFFFF"], mood: "Sophisticated, premium, timeless" },
  { id: "natural", name: "Natural & Organic", colors: ["#2D5016", "#B4C7A8", "#F4E4C1"], mood: "Earthy, sustainable, authentic" },
  { id: "playful", name: "Playful & Creative", colors: ["#FF6F91", "#FFC75F", "#845EC2"], mood: "Fun, youthful, imaginative" }
];

export default function SmartBrandKit() {
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    description: "",
    targetAudience: "",
    brandStyle: "modern"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKit, setGeneratedKit] = useState(null);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState(0);
  const [logoVariations, setLogoVariations] = useState([]);

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.industry) {
      alert("Please fill in business name and industry");
      return;
    }

    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      
      if (user.credits_remaining < 200) {
        alert("Insufficient credits. You need at least 200 credits to generate a brand kit.");
        setIsGenerating(false);
        return;
      }

      const selectedStyle = brandStyles.find(s => s.id === formData.brandStyle);
      
      const brandIdentityPrompt = `Create a comprehensive brand identity for:
Business: ${formData.businessName}
Industry: ${formData.industry}
Description: ${formData.description}
Target Audience: ${formData.targetAudience}
Desired Style: ${selectedStyle.name} - ${selectedStyle.mood}

Generate:
1. A color palette (5 colors with hex codes and usage descriptions)
2. Font recommendations (heading and body fonts with reasoning)
3. A compelling tagline (max 10 words)
4. Brand voice guidelines (tone, language style, do's and don'ts)
5. Brand personality traits
6. Visual style guidelines`;

      const brandIdentity = await base44.integrations.Core.InvokeLLM({
        prompt: brandIdentityPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            colors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hex: { type: "string" },
                  name: { type: "string" },
                  usage: { type: "string" }
                },
                required: ["hex", "name", "usage"]
              }
            },
            fonts: {
              type: "object",
              properties: {
                heading: { type: "string" },
                body: { type: "string" },
                reasoning: { type: "string" }
              },
              required: ["heading", "body", "reasoning"]
            },
            tagline: { type: "string" },
            voice_guide: { type: "string" },
            personality_traits: {
              type: "array",
              items: { type: "string" }
            },
            visual_guidelines: { type: "string" }
          },
          required: ["colors", "fonts", "tagline", "voice_guide", "personality_traits", "visual_guidelines"]
        }
      });

      const logoPrompt = `Professional logo design for ${formData.businessName}, a ${formData.industry} business.
Style: ${selectedStyle.name}
Mood: ${selectedStyle.mood}
Colors: ${brandIdentity.colors.map(c => c.hex).join(", ")}
Modern, clean, memorable, vector-style logo on white background`;

      const { url: logoUrl } = await base44.integrations.Core.GenerateImage({
        prompt: logoPrompt
      });

      const variations = [];
      for (let i = 0; i < 2; i++) {
        const variationPrompt = `${logoPrompt}, variation ${i + 1}, different layout, subtle changes`;
        const { url } = await base44.integrations.Core.GenerateImage({
          prompt: variationPrompt
        });
        variations.push(url);
      }
      setLogoVariations([logoUrl, ...variations]);

      const kit = {
        name: formData.businessName,
        logo_url: logoUrl,
        colors: brandIdentity.colors.map(c => c.hex),
        color_details: brandIdentity.colors,
        fonts: brandIdentity.fonts,
        tagline: brandIdentity.tagline,
        voice_guide: brandIdentity.voice_guide,
        personality_traits: brandIdentity.personality_traits,
        visual_guidelines: brandIdentity.visual_guidelines
      };

      setGeneratedKit(kit);
      setSelectedLogoIndex(0); // Reset selected logo index

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - 200
      });

      await base44.entities.UsageLog.create({
        feature: "SmartBrandKit",
        credits_used: 200,
        details: `Generated brand kit for ${formData.businessName}`
      });

    } catch (error) {
      console.error("Brand kit generation failed:", error);
      alert("Failed to generate brand kit. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleSave = async () => {
    if (!generatedKit) return;

    try {
      // Prepare the kit for saving, including the selected logo and all variations
      const kitToSave = {
        ...generatedKit,
        logo_url: logoVariations[selectedLogoIndex], // Save the currently selected logo
        logo_variations: logoVariations, // Save all generated variations
        generated_at: new Date().toISOString()
      };

      await base44.entities.BrandKit.create(kitToSave);
      alert("Brand kit saved successfully!");
      setGeneratedKit(null); // Clear the generated kit from display
      setFormData({ businessName: "", industry: "", description: "", targetAudience: "", brandStyle: "modern" }); // Clear form
      setLogoVariations([]); // Clear logo variations
      setSelectedLogoIndex(0); // Reset selected logo index
    } catch (error) {
      console.error("Failed to save brand kit:", error);
      alert("Failed to save brand kit. Please try again.");
    }
  };

  const handleDownload = async () => {
    if (!generatedKit) return;
    const content = `
BRAND KIT: ${generatedKit.name}
${'='.repeat(50)}

TAGLINE
${generatedKit.tagline}

COLORS
${generatedKit.color_details?.map(c => `${c.name}: ${c.hex} - ${c.usage}`).join('\n')}

TYPOGRAPHY
Heading Font: ${generatedKit.fonts?.heading}
Body Font: ${generatedKit.fonts?.body}
Reasoning: ${generatedKit.fonts?.reasoning}

BRAND VOICE
${generatedKit.voice_guide}

PERSONALITY TRAITS
${generatedKit.personality_traits?.map(t => `• ${t}`).join('\n')}

VISUAL GUIDELINES
${generatedKit.visual_guidelines}

LOGO URL (Selected): ${logoVariations[selectedLogoIndex]}
All Logo Variations:
${logoVariations.map((url, i) => `Variation ${i + 1}: ${url}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedKit.name}_BrandKit.txt`;
    document.body.appendChild(a); // Append to body to make it clickable
    a.click();
    document.body.removeChild(a); // Clean up
    window.URL.revokeObjectURL(url); // Release object URL
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      {!generatedKit ? (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name *</label>
                <Input
                  placeholder="e.g., Stellar Tech"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="bg-gray-900 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry *</label>
                <Input
                  placeholder="e.g., Software, Fashion, Food"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="bg-gray-900 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Description</label>
              <Textarea
                placeholder="Describe what your business does, your mission, and what makes you unique..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-gray-900 border-gray-600 min-h-[100px] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <Input
                placeholder="e.g., Tech-savvy millennials, Small business owners"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand Style</label>
              <Select value={formData.brandStyle} onValueChange={(value) => setFormData({...formData, brandStyle: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {brandStyles.map(style => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs text-gray-400">{style.mood}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.businessName || !formData.industry}
              className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Brand Kit...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Complete Brand Kit (200 credits)
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">{generatedKit.name}</h2>
                <p className="text-gray-400 text-lg mt-1">{generatedKit.tagline}</p>
              </div>
              <div className="flex gap-3 mt-4 sm:mt-0">
                <Button onClick={handleDownload} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                  <Check className="w-4 h-4 mr-2" />
                  Save Brand Kit
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-900 grid w-full grid-cols-6 sm:grid-cols-6">
                <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="logos" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Logos</TabsTrigger>
                <TabsTrigger value="colors" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Colors</TabsTrigger>
                <TabsTrigger value="typography" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Typography</TabsTrigger>
                <TabsTrigger value="guidelines" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Guidelines</TabsTrigger>
                <TabsTrigger value="social" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Social Assets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl mb-3 text-white">Brand Identity Summary</h3>
                    <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Tagline:</p>
                        <p className="text-lg font-bold text-white">"{generatedKit.tagline}"</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Industry:</p>
                        <p className="text-white">{formData.industry}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Target Audience:</p>
                        <p className="text-white">{formData.targetAudience || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Personality Traits:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {generatedKit.personality_traits?.map((trait, i) => (
                            <Badge key={i} variant="secondary" className="bg-purple-700 text-white border-purple-500">{trait}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl mb-3 text-white">Primary Logo Preview</h3>
                    <div className="bg-white rounded-lg p-6 flex justify-center items-center h-48 border border-gray-700">
                      <img 
                        src={logoVariations[selectedLogoIndex]} 
                        alt="Brand Logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logos" className="space-y-6 mt-6">
                <div>
                  <h3 className="font-semibold text-xl mb-4 text-white">Logo Variations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {logoVariations.map((url, index) => (
                      <div 
                        key={index}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all p-2
                          ${selectedLogoIndex === index ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-700 hover:border-gray-500'}`
                        }
                        onClick={() => {
                          setSelectedLogoIndex(index);
                          setGeneratedKit({...generatedKit, logo_url: url}); // Update main kit logo for consistency
                        }}
                      >
                        <div className="bg-white p-4 rounded-md flex items-center justify-center h-32">
                          <img src={url} alt={`Logo ${index + 1}`} className="max-h-full max-w-full object-contain" />
                        </div>
                        {selectedLogoIndex === index && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-purple-600 text-white">Selected</Badge>
                          </div>
                        )}
                        <p className="text-center text-sm mt-2 text-gray-300">Variation {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-6 mt-6">
                <h3 className="font-semibold text-xl mb-4 text-white">Brand Color Palette</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {generatedKit.color_details?.map((color, index) => (
                    <div key={index} className="space-y-2 bg-gray-900 p-3 rounded-lg border border-gray-700">
                      <div 
                        className="w-full h-20 rounded-md border-2 border-gray-600"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-sm">
                        <div className="font-medium text-white">{color.name}</div>
                        <div className="text-gray-400 font-mono text-xs">{color.hex}</div>
                        <div className="text-xs text-gray-500 mt-1">{color.usage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="typography" className="space-y-6 mt-6">
                <h3 className="font-semibold text-xl mb-4 text-white">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h4 className="text-sm text-gray-400 mb-2 font-medium">Heading Font</h4>
                    <p className="text-4xl font-bold mb-2 text-white" style={{ fontFamily: generatedKit.fonts?.heading }}>
                      {generatedKit.fonts?.heading || 'Font Name'}
                    </p>
                    <p className="text-lg text-gray-300">The quick brown fox jumps over the lazy dog.</p>
                  </div>
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h4 className="text-sm text-gray-400 mb-2 font-medium">Body Font</h4>
                    <p className="text-2xl text-white mb-2" style={{ fontFamily: generatedKit.fonts?.body }}>
                      {generatedKit.fonts?.body || 'Font Name'}
                    </p>
                    <p className="text-lg text-gray-300">The quick brown fox jumps over the lazy dog.</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-sm text-gray-400 mb-2 font-medium">Font Selection Reasoning</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{generatedKit.fonts?.reasoning}</p>
                </div>
              </TabsContent>

              <TabsContent value="guidelines" className="space-y-6 mt-6">
                <h3 className="font-semibold text-xl mb-4 text-white">Brand Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-lg mb-3 text-white">Brand Voice & Tone</h4>
                    <p className="text-sm text-gray-300 whitespace-pre-line">{generatedKit.voice_guide}</p>
                  </div>
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-lg mb-3 text-white">Visual Style Guidelines</h4>
                    <p className="text-sm text-gray-300 whitespace-pre-line">{generatedKit.visual_guidelines}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-6 mt-6">
                <SocialMediaAssetGenerator brandKit={generatedKit} logoUrl={logoVariations[selectedLogoIndex]} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}
