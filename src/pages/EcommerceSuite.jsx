"use client";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Share2,
  Plus,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import AIProductGenerator from "../components/ecommerce/AIProductGenerator";
import BulkProductImporter from "../components/ecommerce/BulkProductImporter";
import PlatformPublisher from "../components/ecommerce/PlatformPublisher";
import InventoryManager from "../components/ecommerce/InventoryManager";
import AIDescriptionGenerator from "../components/ecommerce/AIDescriptionGenerator";
import AIImageGenerator from "../components/ecommerce/AIImageGenerator";
import OrderManager from "../components/ecommerce/OrderManager";
import SalesForecast from "../components/ecommerce/SalesForecast";
import EcommerceAnalytics from "../components/ecommerce/EcommerceAnalytics";
import CampaignManager from "../components/ecommerce/marketing/CampaignManager";
import AbandonedCartManager from "../components/ecommerce/marketing/AbandonedCartManager";
import CustomerList from "../components/ecommerce/customers/CustomerList";

const platforms = {
  Shopify: { icon: ShoppingCart, color: "text-green-400" },
  WooCommerce: { icon: Package, color: "text-purple-400" },
  Magento: { icon: Package, color: "text-red-400" },
  Amazon: { icon: Package, color: "text-orange-400" },
  Etsy: { icon: Package, color: "text-orange-400" },
  eBay: { icon: TrendingUp, color: "text-yellow-400" },
  Facebook: { icon: Share2, color: "text-blue-400" },
  TikTok: { icon: Share2, color: "text-pink-400" },
};

const ProductCard = ({ product, onPublish, onRefresh, brandKits }) => {
  const [showPublisher, setShowPublisher] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showDescGenerator, setShowDescGenerator] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);

  const isLowStock =
    product.inventory !== undefined &&
    product.inventory <= (product.reorder_point || 10);
  const isOutOfStock =
    product.inventory !== undefined && product.inventory === 0;
  const brandKit = brandKits.find((b) => b.id === product.brand_kit_id);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
      {product.images?.[0] && (
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.title}</h3>
            <p className="text-2xl font-bold text-green-400 mt-1">
              ${product.price}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge
              className={
                product.status === "published"
                  ? "bg-green-500/20 text-green-400"
                  : product.status === "out_of_stock"
                    ? "bg-red-500/20 text-red-400"
                    : product.status === "draft"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
              }
            >
              {product.status.replace(/_/g, " ")}
            </Badge>
            {product.inventory !== undefined && (
              <Badge
                className={
                  isOutOfStock
                    ? "bg-red-500/20 text-red-400"
                    : isLowStock
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                }
              >
                {product.inventory} in stock
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2">
          {product.short_description || product.description}
        </p>

        {product.platforms?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.platforms.map((platform) => {
              const PlatformIcon = platforms[platform]?.icon || Package;
              return (
                <Badge key={platform} variant="outline" className="text-xs">
                  <PlatformIcon className="w-3 h-3 mr-1" />
                  {platform}
                </Badge>
              );
            })}
          </div>
        )}

        {product.seo_keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.seo_keywords.slice(0, 3).map((keyword, i) => (
              <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-gray-200"
              onClick={() => {
                setShowImageGenerator(!showImageGenerator);
                setShowDescGenerator(false);
                setShowPublisher(false);
                setShowInventory(false);
              }}
            >
              <ImageIcon className="w-3 h-3 mr-2" />
              {showImageGenerator ? "Hide" : "Images"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-gray-200"
              onClick={() => {
                setShowDescGenerator(!showDescGenerator);
                setShowImageGenerator(false);
                setShowPublisher(false);
                setShowInventory(false);
              }}
            >
              <Sparkles className="w-3 h-3 mr-2" />
              {showDescGenerator ? "Hide" : "Desc"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-gray-200"
              onClick={() => {
                setShowPublisher(!showPublisher);
                setShowInventory(false);
                setShowDescGenerator(false);
                setShowImageGenerator(false);
              }}
            >
              <Share2 className="w-3 h-3 mr-2" />
              {showPublisher ? "Hide" : "Publish"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-gray-200"
              onClick={() => {
                setShowInventory(!showInventory);
                setShowPublisher(false);
                setShowDescGenerator(false);
                setShowImageGenerator(false);
              }}
            >
              <Package className="w-3 h-3 mr-2" />
              {showInventory ? "Hide" : "Inventory"}
            </Button>
          </div>
        </div>

        {showImageGenerator && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <AIImageGenerator
              product={product}
              brandKit={brandKit}
              onImagesGenerated={() => {
                setShowImageGenerator(false);
                onRefresh?.();
              }}
            />
          </div>
        )}

        {showDescGenerator && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <AIDescriptionGenerator
              product={product}
              brandKit={brandKit}
              onSelect={async (description) => {
                // Optimistic update
                product.description = description;
                setShowDescGenerator(false);
                
                try {
                  await base44.entities.EcommerceProduct.update(product.id, {
                    description: description,
                  });
                  onRefresh?.();
                } catch (error) {
                  console.error("Failed to update description:", error);
                  onRefresh?.();
                }
              }}
            />
          </div>
        )}

        {showPublisher && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <PlatformPublisher
              product={product}
              onPublished={async (updated) => {
                await base44.entities.EcommerceProduct.update(
                  product.id,
                  updated
                );
                setShowPublisher(false);
                onRefresh?.();
              }}
            />
          </div>
        )}

        {showInventory && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <InventoryManager
              product={product}
              onUpdate={async (updated) => {
                onRefresh?.();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default function EcommerceSuite() {
  const [products, setProducts] = useState([]);
  const [brandKits, setBrandKits] = useState([]);
  const [selectedBrandKit, setSelectedBrandKit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsData, brandKitsData] = await Promise.all([
        base44.entities.EcommerceProduct.list("-created_date"),
        base44.entities.BrandKit.list(),
      ]);
      setProducts(productsData);
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

  const stats = {
    total: products.length,
    published: products.filter((p) => p.status === "published").length,
    draft: products.filter((p) => p.status === "draft").length,
    lowStock: products.filter(
      (p) => p.inventory !== undefined && p.inventory <= (p.reorder_point || 10)
    ).length,
    totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <ShoppingCart className="w-8 h-8 text-blue-400" />
          <span>E-commerce Suite</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          AI-powered product creation, multi-channel publishing, and advanced
          inventory management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Products</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {stats.published}
          </div>
          <div className="text-sm text-gray-400">Published</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">
            {stats.draft}
          </div>
          <div className="text-sm text-gray-400">Drafts</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-red-400">
            {stats.lowStock}
          </div>
          <div className="text-sm text-gray-400">Low Stock</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">
            ${stats.totalValue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total Value</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800 flex-wrap">
          <TabsTrigger value="products">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="abandoned">Abandoned Carts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
          <TabsTrigger value="generate">AI Generator</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No products yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by generating products with AI or importing from CSV
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setActiveTab("generate")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Products
                </Button>
                <Button onClick={() => setActiveTab("bulk")} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Bulk Import
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brandKits={brandKits}
                  onRefresh={fetchData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <AIProductGenerator
            brandKitId={selectedBrandKit}
            onProductGenerated={(product) => {
              fetchData();
              setActiveTab("products");
            }}
          />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkProductImporter
            brandKitId={selectedBrandKit}
            onProductsImported={(products) => {
              fetchData();
              setActiveTab("products");
            }}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrderManager />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerList />
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <CampaignManager />
        </TabsContent>

        <TabsContent value="abandoned" className="space-y-6">
          <AbandonedCartManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EcommerceAnalytics />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <SalesForecast />
        </TabsContent>
      </Tabs>
    </div>
  );
}