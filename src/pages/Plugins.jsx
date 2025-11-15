"use client";
import React, { useState, useEffect } from "react";
import { Plugin } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Tags, Code2, MessageSquare, Palette, Database, BookText, 
  Plug, Search, Filter, ArrowLeft, Sparkles
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PluginRunner from "../components/plugins/PluginRunner";

const icons = {
  Tags, Code2, MessageSquare, Palette, Database, BookText, Plug,
  Default: Plug
};

const categoryColors = {
  "marketing": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "codegen": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "design": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "text": "bg-green-500/20 text-green-400 border-green-500/30",
  "data": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
};

const PluginCard = ({ plugin, onRun }) => {
  const Icon = icons[plugin.icon] || icons.Default;
  const categoryColor = categoryColors[plugin.category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  
  return (
    <div className="bg-gray-800 hover:bg-gray-750 transition-all duration-200 p-6 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-lg group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors`}>
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <Badge className={`text-xs ${categoryColor} border`}>
          {plugin.category}
        </Badge>
      </div>
      
      <div className="space-y-3 mb-4">
        <h3 className="font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">
          {plugin.name}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
          {plugin.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Sparkles className="w-3 h-3" />
          25 credits
        </div>
        <Button 
          onClick={() => onRun(plugin)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          size="sm"
        >
          Run Plugin
        </Button>
      </div>
    </div>
  );
};

export default function PluginsPage() {
  const [plugins, setPlugins] = useState([]);
  const [filteredPlugins, setFilteredPlugins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchPlugins = async () => {
      setIsLoading(true);
      try {
        const data = await Plugin.list();
        setPlugins(data);
        setFilteredPlugins(data);
      } catch (error) {
        console.error("Failed to fetch plugins:", error);
      }
      setIsLoading(false);
    };
    fetchPlugins();
  }, []);

  useEffect(() => {
    let filtered = plugins;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(plugin =>
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(plugin => plugin.category === selectedCategory);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredPlugins(filtered);
  }, [plugins, searchTerm, selectedCategory, sortBy]);

  const handleRunPlugin = (plugin) => {
    setSelectedPlugin(plugin);
  };

  const handleBackToPlugins = () => {
    setSelectedPlugin(null);
  };

  const categories = [...new Set(plugins.map(p => p.category))];

  if (selectedPlugin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToPlugins}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plugins
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {React.createElement(icons[selectedPlugin.icon] || icons.Default, { 
                className: "w-6 h-6 text-blue-400" 
              })}
              {selectedPlugin.name}
            </h1>
            <p className="text-gray-400 text-sm">{selectedPlugin.description}</p>
          </div>
        </div>
        
        <PluginRunner plugin={selectedPlugin} onClose={handleBackToPlugins} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Plug className="w-8 h-8 text-green-400" />
          <span>Plugin Marketplace</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Discover and use specialized AI tools for content creation, code generation, design, and more. Each plugin is optimized for specific tasks.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border-gray-600 pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-gray-900 border-gray-600">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-gray-900 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter className="w-4 h-4" />
            <span>{filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>
      </div>

      {/* Plugin Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : filteredPlugins.length === 0 ? (
        <div className="text-center py-12">
          <Plug className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No plugins found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== "all" 
              ? "Try adjusting your filters or search terms"
              : "No plugins are available at the moment"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <PluginCard 
              key={plugin.id} 
              plugin={plugin} 
              onRun={handleRunPlugin} 
            />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-400">{plugins.length}</p>
            <p className="text-sm text-gray-400">Total Plugins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{categories.length}</p>
            <p className="text-sm text-gray-400">Categories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">25</p>
            <p className="text-sm text-gray-400">Credits per Run</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">AI</p>
            <p className="text-sm text-gray-400">Powered</p>
          </div>
        </div>
      </div>
    </div>
  );
}