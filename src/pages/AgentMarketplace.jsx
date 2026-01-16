import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Sparkles, TrendingUp } from "lucide-react";

// Refactored imports - using new modular components and custom hooks
import MarketplaceStats from "../components/marketplace/MarketplaceStats";
import MarketplaceSearch from "../components/marketplace/MarketplaceSearch";
import TemplateSection from "../components/marketplace/TemplateSection";
import TemplateDetail from "../components/marketplace/TemplateDetail";
import { useMarketplaceTemplates } from "../components/marketplace/useMarketplaceTemplates";
import { useTemplateFilters } from "../components/marketplace/useTemplateFilters";

// Main component - now much cleaner with extracted logic and components
export default function AgentMarketplace() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Custom hooks handle data fetching and filtering logic
  const { templates, featuredTemplates, popularTemplates, stats, refetch } =
    useMarketplaceTemplates();

  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredTemplates,
  } = useTemplateFilters(templates);

  // Early return for detail view - improves readability
  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <Button onClick={() => setSelectedTemplate(null)} variant="outline">
          ← Back to Marketplace
        </Button>
        <TemplateDetail
          template={selectedTemplate}
          onInstall={async () => {
            await refetch();
            setSelectedTemplate(null);
          }}
        />
      </div>
    );
  }

  const showFeaturedSection =
    featuredTemplates.length > 0 && activeCategory === "all";
  const showPopularSection =
    popularTemplates.length > 0 && activeCategory === "all";

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Store className="w-8 h-8 text-purple-400" />
          <span>AI Agent Marketplace</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Browse and install pre-built AI agent workflows created by the
          community
        </p>
      </div>

      {/* Stats cards - now a separate component */}
      <MarketplaceStats stats={stats} />

      {/* Search bar - extracted for clarity */}
      <MarketplaceSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Category tabs with template sections */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <TabsList className="bg-gray-800">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-6">
          {/* Featured section - conditional rendering improved */}
          {showFeaturedSection && (
            <TemplateSection
              title="Featured Templates"
              icon={Sparkles}
              iconColor="text-yellow-400"
              templates={featuredTemplates}
              onSelectTemplate={setSelectedTemplate}
            />
          )}

          {/* Popular section - using reusable component */}
          {showPopularSection && (
            <TemplateSection
              title="Most Popular"
              icon={TrendingUp}
              iconColor="text-green-400"
              templates={popularTemplates}
              onSelectTemplate={setSelectedTemplate}
            />
          )}

          {/* All/filtered templates section */}
          <TemplateSection
            title={
              activeCategory === "all"
                ? "All Templates"
                : `${activeCategory} Templates`
            }
            templates={filteredTemplates}
            onSelectTemplate={setSelectedTemplate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
