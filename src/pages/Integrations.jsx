"use client";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plug, Plus, ShoppingBag, Store, Package, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PlatformConnectionCard from "../components/integrations/PlatformConnectionCard";
import SyncHistory from "../components/integrations/SyncHistory";

const AVAILABLE_PLATFORMS = [
  "Shopify",
  "WooCommerce",
  "Magento",
  "Amazon",
  "Etsy",
  "eBay",
  "Facebook",
  "TikTok"
];

export default function Integrations() {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.PlatformConnection.list("-created_date", 100);
      setConnections(data);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    }
    setIsLoading(false);
  };

  const handleAddConnection = () => {
    if (!selectedPlatform) return;
    setShowAddForm(false);
    setSelectedPlatform("");
  };

  const connectedPlatforms = connections.map(c => c.platform);
  const availablePlatforms = AVAILABLE_PLATFORMS.filter(p => !connectedPlatforms.includes(p));

  const stats = {
    total: connections.length,
    connected: connections.filter(c => c.status === "connected").length,
    errors: connections.filter(c => c.status === "error").length
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Plug className="w-8 h-8 text-blue-400" />
          <span>Platform Integrations</span>
        </h1>
        <p className="text-gray-400">
          Connect your e-commerce platforms to publish and sync products automatically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Platforms</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Store className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Connected</p>
              <p className="text-3xl font-bold mt-1 text-green-400">{stats.connected}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Errors</p>
              <p className="text-3xl font-bold mt-1 text-red-400">{stats.errors}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      {availablePlatforms.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Add New Platform</h3>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="bg-gray-900 border-gray-600 flex-1">
                <SelectValue placeholder="Select a platform to connect" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowAddForm(true)}
              disabled={!selectedPlatform}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Connection
            </Button>
          </div>
        </Card>
      )}

      {showAddForm && selectedPlatform && (
        <PlatformConnectionCard
          connection={null}
          onUpdate={() => {
            fetchConnections();
            setShowAddForm(false);
            setSelectedPlatform("");
          }}
        />
      )}

      {connections.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No platforms connected</h3>
          <p className="text-gray-400 mb-6">
            Connect your first e-commerce platform to start publishing products
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connected Platforms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map(connection => (
                <PlatformConnectionCard
                  key={connection.id}
                  connection={connection}
                  onUpdate={fetchConnections}
                />
              ))}
            </div>
          </div>

          <SyncHistory />
        </div>
      )}
    </div>
  );
}