import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Loader2, Check, AlertCircle } from "lucide-react";

export default function BulkProductImporter({ onProductsImported, brandKitId }) {
  const [file, setFile] = useState(null);
  const [bulkIdeas, setBulkIdeas] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
  };

  const handleProcessCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResults(null);

    try {
      const user = await base44.auth.me();
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data from CSV
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  category: { type: "string" },
                  tags: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extractResult.status === "error") {
        alert(`Error: ${extractResult.details}`);
        setIsProcessing(false);
        return;
      }

      const products = extractResult.output.products || [];
      const creditsNeeded = products.length * 50;

      if (user.credits_remaining < creditsNeeded) {
        alert(`Insufficient credits. You need ${creditsNeeded} credits to process ${products.length} products.`);
        setIsProcessing(false);
        return;
      }

      // Process each product with AI enhancement
      const enhancedProducts = [];
      for (const product of products) {
        try {
          const enhanced = await base44.integrations.Core.InvokeLLM({
            prompt: `Enhance this product listing for e-commerce:
Title: ${product.title}
Description: ${product.description}
Price: $${product.price}
Category: ${product.category}

Improve the description, add SEO optimization, and suggest tags.`,
            response_json_schema: {
              type: "object",
              properties: {
                enhanced_description: { type: "string" },
                short_description: { type: "string" },
                seo_title: { type: "string" },
                seo_description: { type: "string" },
                seo_keywords: { type: "array", items: { type: "string" } },
                suggested_tags: { type: "array", items: { type: "string" } }
              }
            }
          });

          enhancedProducts.push({
            title: product.title,
            description: enhanced.enhanced_description,
            short_description: enhanced.short_description,
            price: product.price,
            category: product.category,
            tags: enhanced.suggested_tags,
            seo_title: enhanced.seo_title,
            seo_description: enhanced.seo_description,
            seo_keywords: enhanced.seo_keywords,
            brand_kit_id: brandKitId,
            status: "draft"
          });
        } catch (error) {
          console.error(`Failed to enhance product: ${product.title}`, error);
        }
      }

      // Bulk create products
      await base44.entities.EcommerceProduct.bulkCreate(enhancedProducts);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - creditsNeeded
      });

      await base44.entities.UsageLog.create({
        feature: "BulkProductImporter",
        credits_used: creditsNeeded,
        details: `Imported ${enhancedProducts.length} products from CSV`
      });

      setResults({
        success: enhancedProducts.length,
        failed: products.length - enhancedProducts.length
      });

      onProductsImported?.(enhancedProducts);

    } catch (error) {
      console.error("CSV processing failed:", error);
      alert("Failed to process CSV. Please try again.");
    }

    setIsProcessing(false);
  };

  const handleProcessBulkIdeas = async () => {
    if (!bulkIdeas.trim()) return;

    setIsProcessing(true);
    setResults(null);

    try {
      const user = await base44.auth.me();
      
      const ideas = bulkIdeas.split('\n').filter(line => line.trim());
      const creditsNeeded = ideas.length * 75;

      if (user.credits_remaining < creditsNeeded) {
        alert(`Insufficient credits. You need ${creditsNeeded} credits to generate ${ideas.length} products.`);
        setIsProcessing(false);
        return;
      }

      const generatedProducts = [];
      for (const idea of ideas) {
        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a complete e-commerce product listing for: "${idea}"
            
Create a product with title, detailed description, short description, suggested price, category, tags, and SEO optimization.`,
            response_json_schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                short_description: { type: "string" },
                suggested_price: { type: "number" },
                category: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                seo_title: { type: "string" },
                seo_description: { type: "string" },
                seo_keywords: { type: "array", items: { type: "string" } }
              }
            }
          });

          generatedProducts.push({
            ...result,
            price: result.suggested_price,
            brand_kit_id: brandKitId,
            status: "draft"
          });
        } catch (error) {
          console.error(`Failed to generate product for: ${idea}`, error);
        }
      }

      await base44.entities.EcommerceProduct.bulkCreate(generatedProducts);

      await base44.auth.updateMe({
        credits_remaining: user.credits_remaining - creditsNeeded
      });

      await base44.entities.UsageLog.create({
        feature: "BulkProductImporter",
        credits_used: creditsNeeded,
        details: `Generated ${generatedProducts.length} products from ideas`
      });

      setResults({
        success: generatedProducts.length,
        failed: ideas.length - generatedProducts.length
      });

      onProductsImported?.(generatedProducts);
      setBulkIdeas("");

    } catch (error) {
      console.error("Bulk generation failed:", error);
      alert("Failed to generate products. Please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Upload className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-semibold">Import from CSV</h3>
          <Badge className="ml-auto">50 credits per product</Badge>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-400">
                {file ? file.name : "Click to upload CSV file"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Columns: title, description, price, category, tags
              </p>
            </label>
          </div>

          <Button
            onClick={handleProcessCSV}
            disabled={!file || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing CSV...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import & Enhance Products
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold">Bulk Generate from Ideas</h3>
          <Badge className="ml-auto">75 credits per product</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Ideas (one per line)
            </label>
            <Textarea
              placeholder="Handmade leather wallet&#10;Wireless noise-cancelling headphones&#10;Organic cotton tote bag&#10;..."
              value={bulkIdeas}
              onChange={(e) => setBulkIdeas(e.target.value)}
              className="bg-gray-900 border-gray-600 min-h-[150px] font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleProcessBulkIdeas}
            disabled={!bulkIdeas.trim() || isProcessing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Products...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate All Products
              </>
            )}
          </Button>
        </div>
      </Card>

      {results && (
        <Card className="bg-gray-800 border-green-900/50 border-2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-green-400">Import Complete</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400">{results.success}</div>
              <div className="text-sm text-gray-400">Imported Successfully</div>
            </div>
            {results.failed > 0 && (
              <div>
                <div className="text-3xl font-bold text-yellow-400">{results.failed}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}