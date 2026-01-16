import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Store,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

const PLATFORM_CONFIG = {
  Shopify: {
    icon: ShoppingBag,
    color: "text-green-400",
    fields: [
      {
        name: "store_url",
        label: "Store URL",
        placeholder: "mystore.myshopify.com",
      },
      {
        name: "api_key",
        label: "API Key",
        placeholder: "Enter your API key",
        type: "password",
      },
      {
        name: "api_secret",
        label: "API Secret",
        placeholder: "Enter your API secret",
        type: "password",
      },
    ],
    docs: "https://help.shopify.com/en/manual/apps/app-types/custom-apps",
  },
  WooCommerce: {
    icon: Store,
    color: "text-purple-400",
    fields: [
      {
        name: "store_url",
        label: "Store URL",
        placeholder: "https://yourstore.com",
      },
      {
        name: "api_key",
        label: "Consumer Key",
        placeholder: "ck_xxxxx",
        type: "password",
      },
      {
        name: "api_secret",
        label: "Consumer Secret",
        placeholder: "cs_xxxxx",
        type: "password",
      },
    ],
    docs: "https://woocommerce.com/document/woocommerce-rest-api/",
  },
  Magento: {
    icon: Store,
    color: "text-red-400",
    fields: [
      {
        name: "store_url",
        label: "Store URL",
        placeholder: "https://yourstore.com",
      },
      {
        name: "api_key",
        label: "Access Token",
        placeholder: "Enter access token",
        type: "password",
      },
    ],
    docs: "https://devdocs.magento.com/guides/v2.4/get-started/authentication/gs-authentication-token.html",
  },
  Amazon: {
    icon: Package,
    color: "text-orange-400",
    fields: [
      { name: "api_key", label: "Seller ID", placeholder: "Enter seller ID" },
      {
        name: "api_secret",
        label: "MWS Auth Token",
        placeholder: "Enter auth token",
        type: "password",
      },
    ],
    docs: "https://developer.amazonservices.com/",
  },
  Etsy: {
    icon: Store,
    color: "text-orange-400",
    fields: [
      { name: "store_url", label: "Shop Name", placeholder: "YourShopName" },
      {
        name: "api_key",
        label: "API Key",
        placeholder: "Enter API key",
        type: "password",
      },
    ],
    docs: "https://www.etsy.com/developers/documentation",
  },
  eBay: {
    icon: Store,
    color: "text-yellow-400",
    fields: [
      { name: "api_key", label: "App ID", placeholder: "Enter app ID" },
      {
        name: "api_secret",
        label: "OAuth Token",
        placeholder: "Enter OAuth token",
        type: "password",
      },
    ],
    docs: "https://developer.ebay.com/api-docs/static/oauth-tokens.html",
  },
  Facebook: {
    icon: Store,
    color: "text-blue-400",
    fields: [
      {
        name: "api_key",
        label: "Page Access Token",
        placeholder: "Enter page access token",
        type: "password",
      },
    ],
    docs: "https://developers.facebook.com/docs/marketing-api/access/",
  },
  TikTok: {
    icon: Store,
    color: "text-pink-400",
    fields: [
      { name: "api_key", label: "Shop ID", placeholder: "Enter shop ID" },
      {
        name: "api_secret",
        label: "Access Token",
        placeholder: "Enter access token",
        type: "password",
      },
    ],
    docs: "https://seller.tiktok.com/university/essay/article?identity=1&role=1&article_id=6989391094191038465",
  },
};

export default function PlatformConnectionCard({ connection, onUpdate }) {
  const [isEditing, setIsEditing] = useState(!connection);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(
    connection || {
      platform: "",
      store_url: "",
      api_key: "",
      api_secret: "",
      status: "disconnected",
    }
  );

  const config = PLATFORM_CONFIG[formData.platform] || {};
  const Icon = config.icon || Store;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        status: "connected",
        last_sync: new Date().toISOString(),
      };

      if (connection?.id) {
        await base44.entities.PlatformConnection.update(connection.id, data);
      } else {
        await base44.entities.PlatformConnection.create(data);
      }

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to save connection:", error);
    }
    setIsSaving(false);
  };

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect from ${formData.platform}?`)) return;

    try {
      await base44.entities.PlatformConnection.update(connection.id, {
        status: "disconnected",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${formData.platform} connection?`)) return;

    try {
      await base44.entities.PlatformConnection.delete(connection.id);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to delete connection:", error);
    }
  };

  const getStatusBadge = () => {
    switch (formData.status) {
      case "connected":
        return (
          <Badge className="bg-green-500/20 text-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-8 h-8 ${config.color}`} />
          <div>
            <h3 className="text-lg font-semibold">{formData.platform}</h3>
            {formData.store_url && (
              <p className="text-sm text-gray-400">{formData.store_url}</p>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {config.fields?.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <Input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  className="bg-gray-900 border-gray-600"
                />
              </div>
            ))}
          </div>

          {config.docs && (
            <a
              href={config.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3" />
              View API documentation
            </a>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.api_key}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              {isSaving ? "Connecting..." : "Connect"}
            </Button>
            {connection && (
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {connection?.last_sync && (
            <div className="text-sm text-gray-400">
              Last synced: {new Date(connection.last_sync).toLocaleString()}
            </div>
          )}

          {connection?.error_message && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-sm text-red-400">
              {connection.error_message}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex-1"
            >
              Edit Connection
            </Button>
            {formData.status === "connected" && (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="flex-1"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            )}
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
