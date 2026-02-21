import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Plus,
  Play,
  Pause,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Share2,
  Trash2,
  Edit,
} from "lucide-react";
import EmailCampaignBuilder from "./EmailCampaignBuilder";
import SocialMediaCampaign from "./SocialMediaCampaign";

const statusColors = {
  draft: "bg-gray-500/20 text-gray-400",
  scheduled: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-purple-500/20 text-purple-400",
  paused: "bg-yellow-500/20 text-yellow-400",
};

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [campaignType, setCampaignType] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.MarketingCampaign.list("-created_date");
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await base44.entities.MarketingCampaign.delete(id);
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    }
  };

  const handleStatusToggle = async (campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    try {
      await base44.entities.MarketingCampaign.update(campaign.id, { status: newStatus });
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "active").length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + (c.revenue_generated || 0), 0),
  };

  const CampaignCard = ({ campaign }) => {
    const openRate = campaign.sent_count > 0 ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : 0;
    const clickRate = campaign.sent_count > 0 ? ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1) : 0;
    const conversionRate = campaign.sent_count > 0 ? ((campaign.conversion_count / campaign.sent_count) * 100).toFixed(1) : 0;

    return (
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{campaign.name}</h3>
              <Badge className={statusColors[campaign.status]}>
                {campaign.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {campaign.type === "email" && <Mail className="w-4 h-4" />}
              {campaign.type === "social" && <Share2 className="w-4 h-4" />}
              <span className="capitalize">{campaign.type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {campaign.status === "draft" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingCampaign(campaign);
                  setCampaignType(campaign.type);
                  setShowBuilder(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {(campaign.status === "active" || campaign.status === "paused") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusToggle(campaign)}
              >
                {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(campaign.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {campaign.sent_count > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-700">
            <div>
              <div className="text-2xl font-bold text-blue-400">{campaign.sent_count}</div>
              <div className="text-xs text-gray-400">Sent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{openRate}%</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Open Rate
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{clickRate}%</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <MousePointer className="w-3 h-3" /> Click Rate
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{conversionRate}%</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Conversion
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                ${(campaign.revenue_generated || 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Revenue
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Campaigns</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
          <div className="text-sm text-gray-400">Active</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.totalSent}</div>
          <div className="text-sm text-gray-400">Total Sent</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total Revenue</div>
        </Card>
      </div>

      {!showBuilder ? (
        <>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setCampaignType("email");
                setEditingCampaign(null);
                setShowBuilder(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Create Email Campaign
            </Button>
            <Button
              onClick={() => {
                setCampaignType("social");
                setEditingCampaign(null);
                setShowBuilder(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Create Social Campaign
            </Button>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-12 text-center">
                <Mail className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                <p className="text-gray-400">Create your first marketing campaign to get started</p>
              </Card>
            ) : (
              campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {campaignType === "email" ? (
            <EmailCampaignBuilder
              campaign={editingCampaign}
              onSave={() => {
                fetchCampaigns();
                setShowBuilder(false);
                setEditingCampaign(null);
              }}
              onCancel={() => {
                setShowBuilder(false);
                setEditingCampaign(null);
              }}
            />
          ) : (
            <SocialMediaCampaign
              campaign={editingCampaign}
              onSave={() => {
                fetchCampaigns();
                setShowBuilder(false);
                setEditingCampaign(null);
              }}
              onCancel={() => {
                setShowBuilder(false);
                setEditingCampaign(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}