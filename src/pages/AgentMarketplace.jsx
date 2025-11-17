"use client";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, Star, TrendingUp, Sparkles, Search, 
  Download, Filter
} from "lucide-react";

import MarketplaceCard from "../components/marketplace/MarketplaceCard";
import TemplateDetail from "../components/marketplace/TemplateDetail";

export default function AgentMarketplace() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.AgentTemplate.list("-rating");
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
    setIsLoading(false);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTemplates = templates.filter(t => t.is_featured);
  const popularTemplates = [...templates].sort((a, b) => b.installs - a.installs).slice(0, 6);

  const stats = {
    total: templates.length,
    featured: featuredTemplates.length,
    totalInstalls: templates.reduce((sum, t) => sum + (t.installs || 0), 0)
  };

  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <Button onClick={() => setSelectedTemplate(null)} variant="outline">
          ← Back to Marketplace
        </Button>
        <TemplateDetail
          template={selectedTemplate}
          onInstall={async (template) => {
            await fetchTemplates();
            setSelectedTemplate(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Store className="w-8 h-8 text-purple-400" />
          <span>AI Agent Marketplace</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Browse and install pre-built AI agent workflows created by the community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Templates</p>
              <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
            </div>
            <Store className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Featured</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.featured}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Installs</p>
              <p className="text-2xl font-bold text-green-400">{stats.totalInstalls}</p>
            </div>
            <Download className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600"
          />
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-6">
          {featuredTemplates.length > 0 && activeCategory === "all" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-semibold">Featured Templates</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates.map((template) => (
                  <MarketplaceCard
                    key={template.id}
                    template={template}
                    onSelect={setSelectedTemplate}
                  />
                ))}
              </div>
            </div>
          )}

          {popularTemplates.length > 0 && activeCategory === "all" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-semibold">Most Popular</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularTemplates.map((template) => (
                  <MarketplaceCard
                    key={template.id}
                    template={template}
                    onSelect={setSelectedTemplate}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {activeCategory === "all" ? "All Templates" : `${activeCategory} Templates`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <MarketplaceCard
                  key={template.id}
                  template={template}
                  onSelect={setSelectedTemplate}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}