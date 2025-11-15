"use client";
import { useState, useEffect } from "react";
import { EcommerceProduct, User, UsageLog } from "@/entities/all";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, Wand2, Package, TrendingUp, 
  Upload, Edit3, Plus, Facebook, Zap, Sparkles
} from "lucide-react";

const platforms = {
  Shopify: { icon: ShoppingCart, color: "text-green-400" },
  Etsy: { icon: Package, color: "text-orange-400" },
  eBay: { icon: TrendingUp, color: "text-blue-400" },
  Facebook: { icon: Facebook, color: "text-blue-500" },
  TikTok: { icon: Zap, color: "text-pink-400" }
};

const ProductCard = ({ product, onEdit, onPublish }) => {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
            <p className="text-2xl font-bold text-green-400 mt-2">${product.price}</p>
          </div>
          <Badge className={`${
            product.status === 'published' ? 'bg-green-500/20 text-green-400' :
            product.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {product.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.images && product.images.length > 0 && (
          <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
        
        <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
        
        {product.platforms && product.platforms.length > 0 && (
          <div className="flex gap-2">
            {product.platforms.map(platform => {
              const PlatformIcon = platforms[platform]?.icon || ShoppingCart;
              return (
                <div key={platform} className="flex items-center gap-1 text-xs">
                  <PlatformIcon className={`w-3 h-3 ${platforms[platform]?.color}`} />
                  {platform}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" onClick={() => onPublish(product)}>
            <Upload className="w-4 h-4 mr-1" />
            Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EcommerceSuite() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Product Generator State
  const [generatorData, setGeneratorData] = useState({
    productIdea: "",
    category: "",
    targetAudience: "",
    priceRange: "",
    platforms: []
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await EcommerceProduct.list("-created_date");
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const generateProduct = async () => {
    setIsGenerating(true);
    const creditsToUse = 150;

    try {
      const user = await User.me();
      if (user.credits_remaining < creditsToUse) {
        alert(`Insufficient credits. You need ${creditsToUse} credits.`);
        setIsGenerating(false);
        return;
      }

      // Generate product details
      const productPrompt = `
        Generate a complete e-commerce product based on this idea: "${generatorData.productIdea}"
        
        Category: ${generatorData.category}
        Target Audience: ${generatorData.targetAudience}
        Price Range: ${generatorData.priceRange}
        Platforms: ${generatorData.platforms.join(', ')}
        
        Generate:
        1. Compelling product title (60 characters max)
        2. Detailed product description (300-500 words)
        3. Suggested pricing
        4. SEO-optimized keywords/tags
        5. Marketing copy for different platforms
        6. Product features and benefits
        
        Format as JSON with proper structure.
      `;

      const [productData, productImage] = await Promise.all([
        InvokeLLM({
          prompt: productPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              features: { type: "array", items: { type: "string" } },
              seo_tags: { type: "array", items: { type: "string" } },
              marketing_copy: {
                type: "object",
                properties: {
                  short: { type: "string" },
                  long: { type: "string" },
                  social: { type: "string" }
                }
              }
            }
          }
        }),
        GenerateImage({ 
          prompt: `Professional product photo of ${generatorData.productIdea}, ${generatorData.category}, clean white background, high quality, e-commerce style` 
        })
      ]);

      // Create product
      const newProduct = await EcommerceProduct.create({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        category: generatorData.category,
        images: [productImage.url],
        seo_tags: productData.seo_tags,
        platforms: generatorData.platforms,
        marketing_copy: productData.marketing_copy,
        status: "draft"
      });

      // Update credits and log
      await User.updateMyUserData({ 
        credits_remaining: user.credits_remaining - creditsToUse 
      });
      
      await UsageLog.create({
        feature: "EcommerceSuite",
        credits_used: creditsToUse,
        details: `Generated product: ${productData.title}`
      });

      setProducts([newProduct, ...products]);
      setShowGenerator(false);
      setGeneratorData({
        productIdea: "",
        category: "",
        targetAudience: "",
        priceRange: "",
        platforms: []
      });

    } catch (e) {
      console.error(e);
      alert("Product generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (product) => {
    // Navigate to product editor
    console.log("Edit product:", product);
  };

  const handlePublish = (product) => {
    // Implement platform publishing logic
    console.log("Publish product:", product);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-green-400" />
            E-commerce Suite
          </h1>
          <p className="text-gray-400">AI-powered product creation and multi-platform publishing</p>
        </div>
        <Button 
          onClick={() => setShowGenerator(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Product
        </Button>
      </div>

      {/* Product Generator Modal */}
      {showGenerator && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              AI Product Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Idea *</Label>
                <Textarea
                  placeholder="Describe your product idea..."
                  value={generatorData.productIdea}
                  onChange={(e) => setGeneratorData({...generatorData, productIdea: e.target.value})}
                  className="bg-gray-900 border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={generatorData.category} 
                  onValueChange={(value) => setGeneratorData({...generatorData, category: value})}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fashion">Fashion & Accessories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Home">Home & Garden</SelectItem>
                    <SelectItem value="Health">Health & Beauty</SelectItem>
                    <SelectItem value="Sports">Sports & Outdoors</SelectItem>
                    <SelectItem value="Books">Books & Media</SelectItem>
                    <SelectItem value="Toys">Toys & Games</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  placeholder="e.g., Young professionals, Parents, Fitness enthusiasts"
                  value={generatorData.targetAudience}
                  onChange={(e) => setGeneratorData({...generatorData, targetAudience: e.target.value})}
                  className="bg-gray-900 border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <Select 
                  value={generatorData.priceRange} 
                  onValueChange={(value) => setGeneratorData({...generatorData, priceRange: value})}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-600">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budget">Budget ($1-25)</SelectItem>
                    <SelectItem value="Mid-range">Mid-range ($25-100)</SelectItem>
                    <SelectItem value="Premium">Premium ($100-500)</SelectItem>
                    <SelectItem value="Luxury">Luxury ($500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Platforms</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(platforms).map(([platform, config]) => (
                  <label key={platform} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generatorData.platforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGeneratorData({
                            ...generatorData,
                            platforms: [...generatorData.platforms, platform]
                          });
                        } else {
                          setGeneratorData({
                            ...generatorData,
                            platforms: generatorData.platforms.filter(p => p !== platform)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
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
                onClick={generateProduct}
                disabled={isGenerating || !generatorData.productIdea}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating Product...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Product (150 Credits)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Start by generating your first AI-powered product</p>
              <Button onClick={() => setShowGenerator(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Analytics dashboard coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="publishing">
          <div className="text-center py-12 text-gray-400">
            <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Multi-platform publishing tools coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}