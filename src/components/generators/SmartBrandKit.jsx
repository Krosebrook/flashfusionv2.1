import { useState } from "react";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { User, BrandKit, UsageLog } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, Loader2, Save, Download, 
  RefreshCw, Sparkles
} from "lucide-react";

const brandStyles = {
  "Modern": { colors: ["#000000", "#FFFFFF", "#FF6B6B", "#4ECDC4"], mood: "Clean, minimalist, tech-forward" },
  "Vintage": { colors: ["#8B4513", "#F4A460", "#DEB887", "#CD853F"], mood: "Classic, nostalgic, handcrafted" },
  "Corporate": { colors: ["#1E3A8A", "#3B82F6", "#64748B", "#F8FAFC"], mood: "Professional, trustworthy, established" },
  "Creative": { colors: ["#EC4899", "#8B5CF6", "#F59E0B", "#10B981"], mood: "Bold, artistic, innovative" },
  "Luxury": { colors: ["#111827", "#D4AF37", "#F7F7F7", "#6B7280"], mood: "Premium, sophisticated, exclusive" }
};

export default function SmartBrandKit() {
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    tone: "Professional",
    style: "Modern", 
    targetAudience: "",
    values: "",
    competitors: ""
  });
  
  const [brandKit, setBrandKit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [logoVariations, setLogoVariations] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(0);

  const generateBrandKit = async () => {
    setIsLoading(true);
    setError(null);
    setBrandKit(null);
    
    const creditsToUse = 200; // Premium feature

    try {
      const user = await User.me();
      if (user.credits_remaining < creditsToUse) {
        setError(`Insufficient credits. You need ${creditsToUse} credits.`);
        setIsLoading(false);
        return;
      }

      const selectedStyle = brandStyles[formData.style];
      
      // Enhanced prompt for comprehensive brand kit
      const brandPrompt = `
        Create a comprehensive brand identity for:
        
        Business: ${formData.businessName}
        Industry: ${formData.industry}
        Style: ${formData.style} (${selectedStyle.mood})
        Tone: ${formData.tone}
        Target Audience: ${formData.targetAudience}
        Values: ${formData.values}
        Competitors: ${formData.competitors}
        
        Generate a detailed brand kit with:
        1. 5-color primary palette + 3 accent colors
        2. Typography pairing (heading + body fonts)
        3. Multiple tagline options (3-5 variations)
        4. Comprehensive voice & tone guide
        5. Brand personality traits
        6. Usage guidelines
        
        Format as JSON matching this schema exactly.
      `;

      const logoPrompts = [
        `Minimalist logo for ${formData.businessName}, ${formData.industry} industry, ${formData.style.toLowerCase()} style, vector, clean`,
        `Iconic symbol for ${formData.businessName}, modern, professional, ${formData.style.toLowerCase()} aesthetic`,
        `Wordmark logo design for ${formData.businessName}, elegant typography, ${formData.style.toLowerCase()} style`
      ];

      // Generate multiple logo variations in parallel
      const [textData, ...logoResults] = await Promise.all([
        InvokeLLM({
          prompt: brandPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              colors: { 
                type: "object",
                properties: {
                  primary: { type: "array", items: { type: "string" } },
                  accent: { type: "array", items: { type: "string" } }
                }
              },
              fonts: {
                type: "object", 
                properties: {
                  heading: { type: "string" },
                  body: { type: "string" },
                  accent: { type: "string" }
                }
              },
              taglines: { type: "array", items: { type: "string" } },
              voice_guide: { type: "string" },
              personality: { type: "array", items: { type: "string" } },
              guidelines: { type: "string" }
            }
          }
        }),
        ...logoPrompts.map(prompt => GenerateImage({ prompt }))
      ]);

      setLogoVariations(logoResults.map(result => result.url));
      setSelectedLogo(0);
      
      setBrandKit({
        name: formData.businessName,
        logo_url: logoResults[0].url,
        style: formData.style,
        industry: formData.industry,
        ...textData
      });

      // Deduct credits and log usage
      await User.updateMyUserData({ 
        credits_remaining: user.credits_remaining - creditsToUse 
      });
      
      await UsageLog.create({
        feature: "SmartBrandKit",
        credits_used: creditsToUse,
        details: `Generated comprehensive brand kit for ${formData.businessName}`
      });

    } catch (e) {
      console.error(e);
      setError("Failed to generate brand kit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveBrandKit = async () => {
    if (!brandKit) return;
    setIsSaving(true);
    
    try {
      const kitToSave = {
        ...brandKit,
        logo_url: logoVariations[selectedLogo],
        logo_variations: logoVariations
      };
      
      await BrandKit.create(kitToSave);
      alert("Brand Kit saved successfully!");
    } catch (e) {
      console.error(e);
      setError("Failed to save brand kit.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadBrandKit = () => {
    if (!brandKit) return;
    
    const brandData = {
      ...brandKit,
      logo_variations: logoVariations,
      generated_date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(brandData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.businessName.toLowerCase().replace(/\s+/g, '-')}-brandkit.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const regenerateLogo = async (index) => {
    try {
      const newLogoPrompt = `Alternative logo design for ${formData.businessName}, ${formData.industry}, ${formData.style.toLowerCase()} style, creative variation`;
      const result = await GenerateImage({ prompt: newLogoPrompt });
      
      const newVariations = [...logoVariations];
      newVariations[index] = result.url;
      setLogoVariations(newVariations);
    } catch (e) {
      console.error("Failed to regenerate logo:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Input Form */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input
              placeholder="e.g., TechFlow Solutions"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              className="bg-gray-900 border-gray-600"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Industry *</Label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => setFormData({...formData, industry: value})}
            >
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Creative Agency">Creative Agency</SelectItem>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Brand Style</Label>
            <Select 
              value={formData.style} 
              onValueChange={(value) => setFormData({...formData, style: value})}
            >
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(brandStyles).map(([style, config]) => (
                  <SelectItem key={style} value={style}>
                    <div>
                      <div className="font-medium">{style}</div>
                      <div className="text-xs text-gray-400">{config.mood}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select 
              value={formData.tone} 
              onValueChange={(value) => setFormData({...formData, tone: value})}
            >
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Bold">Bold</SelectItem>
                <SelectItem value="Elegant">Elegant</SelectItem>
                <SelectItem value="Playful">Playful</SelectItem>
                <SelectItem value="Sophisticated">Sophisticated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Textarea
              placeholder="e.g., Small business owners, tech-savvy professionals"
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              className="bg-gray-900 border-gray-600 h-20"
            />
          </div>

          <div className="space-y-2">
            <Label>Brand Values</Label>
            <Textarea
              placeholder="e.g., Innovation, reliability, customer-first"
              value={formData.values}
              onChange={(e) => setFormData({...formData, values: e.target.value})}
              className="bg-gray-900 border-gray-600 h-20"
            />
          </div>
        </div>

        <Button 
          onClick={generateBrandKit} 
          disabled={isLoading || !formData.businessName || !formData.industry}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Brand Kit...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Complete Brand Kit (200 Credits)
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
          <p className="font-medium">Generation Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Generated Brand Kit */}
      {brandKit && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="w-6 h-6 text-purple-400" />
              {brandKit.name} Brand Kit
            </h2>
            <div className="flex gap-3">
              <Button variant="outline" onClick={downloadBrandKit}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={saveBrandKit} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Kit
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-gray-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logos">Logo Variations</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Primary Logo</h3>
                  <div className="bg-white p-6 rounded-lg">
                    <img 
                      src={logoVariations[selectedLogo]} 
                      alt="Brand Logo" 
                      className="h-32 mx-auto object-contain"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Taglines</h3>
                  <div className="space-y-2">
                    {brandKit.taglines?.map((tagline, index) => (
                      <div key={index} className="p-3 bg-gray-700 rounded-md">
                        <p className="text-lg italic">"{tagline}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logos" className="space-y-4">
              <h3 className="text-lg font-semibold">Logo Variations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {logoVariations.map((logo, index) => (
                  <div 
                    key={index}
                    className={`relative bg-white p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLogo === index ? 'border-purple-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedLogo(index)}
                  >
                    <img src={logo} alt={`Logo ${index + 1}`} className="h-24 mx-auto object-contain" />
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant={selectedLogo === index ? "default" : "outline"}>
                        {selectedLogo === index ? "Selected" : "Variation"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          regenerateLogo(index);
                        }}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Primary Palette</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {brandKit.colors?.primary?.map((color, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-16 h-16 rounded-lg shadow-lg mx-auto mb-2"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs font-mono">{color}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {brandKit.colors?.accent && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Accent Colors</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {brandKit.colors.accent.map((color, index) => (
                        <div key={index} className="text-center">
                          <div 
                            className="w-16 h-16 rounded-lg shadow-lg mx-auto mb-2"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-xs font-mono">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Heading Font</h3>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p 
                      className="text-2xl font-bold" 
                      style={{ fontFamily: brandKit.fonts?.heading }}
                    >
                      {brandKit.fonts?.heading}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">The quick brown fox</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Body Font</h3>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p 
                      className="text-lg" 
                      style={{ fontFamily: brandKit.fonts?.body }}
                    >
                      {brandKit.fonts?.body}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">The quick brown fox</p>
                  </div>
                </div>

                {brandKit.fonts?.accent && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">Accent Font</h3>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <p 
                        className="text-lg" 
                        style={{ fontFamily: brandKit.fonts.accent }}
                      >
                        {brandKit.fonts.accent}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">The quick brown fox</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="guidelines" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Voice & Tone</h3>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-300">{brandKit.voice_guide}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Brand Personality</h3>
                  <div className="flex flex-wrap gap-2">
                    {brandKit.personality?.map((trait, index) => (
                      <Badge key={index} variant="outline" className="text-purple-400">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {brandKit.guidelines && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Usage Guidelines</h3>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-300 whitespace-pre-line">{brandKit.guidelines}</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}