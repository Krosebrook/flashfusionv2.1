import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Mail, MailOpen, Mouse, ShoppingCart, TrendingUp } from "lucide-react";

const StatBadge = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
    <div className={`p-2 rounded-lg bg-${color}-500/20`}>
      <Icon className={`w-5 h-5 text-${color}-400`} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold">{typeof value === 'number' ? value.toFixed(1) : value}</p>
    </div>
  </div>
);

export default function EmailCampaignAnalytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.ContentPerformance.filter({
        content_type: "email_campaign"
      }, "-published_date", 100);
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to fetch email campaigns:", error);
    }
    setIsLoading(false);
  };

  const calculateStats = () => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.email_metrics?.sent || 0), 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.email_metrics?.opened || 0), 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + (c.email_metrics?.clicks || 0), 0);
    const totalConverted = campaigns.reduce((sum, c) => sum + (c.email_metrics?.conversions || 0), 0);
    
    return {
      totalCampaigns: campaigns.length,
      totalSent,
      avgOpenRate: campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (c.email_metrics?.open_rate || 0), 0) / campaigns.length).toFixed(1) : 0,
      avgClickRate: campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (c.email_metrics?.click_rate || 0), 0) / campaigns.length).toFixed(1) : 0,
      avgConversionRate: campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (c.email_metrics?.conversion_rate || 0), 0) / campaigns.length).toFixed(1) : 0,
      totalOpened,
      totalClicked,
      totalConverted
    };
  };

  const stats = calculateStats();

  const chartData = campaigns.map(c => ({
    name: c.content_title.substring(0, 15),
    openRate: c.email_metrics?.open_rate || 0,
    clickRate: c.email_metrics?.click_rate || 0,
    conversionRate: c.email_metrics?.conversion_rate || 0
  }));

  const funnelData = [
    { name: "Sent", value: stats.totalSent, fill: "#3B82F6" },
    { name: "Opened", value: stats.totalOpened, fill: "#10B981" },
    { name: "Clicked", value: stats.totalClicked, fill: "#F59E0B" },
    { name: "Converted", value: stats.totalConverted, fill: "#8B5CF6" }
  ];

  if (isLoading) return <div className="text-gray-400">Loading email analytics...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Email Campaign Analytics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatBadge 
          label="Avg Open Rate" 
          value={`${stats.avgOpenRate}%`}
          icon={MailOpen}
          color="green"
        />
        <StatBadge 
          label="Avg Click Rate" 
          value={`${stats.avgClickRate}%`}
          icon={Mouse}
          color="blue"
        />
        <StatBadge 
          label="Avg Conversion Rate" 
          value={`${stats.avgConversionRate}%`}
          icon={ShoppingCart}
          color="purple"
        />
        <StatBadge 
          label="Total Sent" 
          value={stats.totalSent.toLocaleString()}
          icon={Mail}
          color="yellow"
        />
        <StatBadge 
          label="Campaigns" 
          value={stats.totalCampaigns}
          icon={TrendingUp}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">Email Funnel</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={funnelData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {chartData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h4 className="font-semibold mb-4">Campaign Metrics Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                <Legend />
                <Bar dataKey="openRate" fill="#10B981" name="Open Rate %" />
                <Bar dataKey="clickRate" fill="#3B82F6" name="Click Rate %" />
                <Bar dataKey="conversionRate" fill="#8B5CF6" name="Conversion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {campaigns.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">Campaign Details</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium flex-1">{campaign.content_title}</h5>
                  <Badge variant={campaign.status === 'published' ? 'default' : 'outline'}>
                    {campaign.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Sent</span>
                    <p className="font-semibold">{(campaign.email_metrics?.sent || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Opened</span>
                    <p className="font-semibold text-green-400">{(campaign.email_metrics?.opened || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Clicked</span>
                    <p className="font-semibold text-blue-400">{(campaign.email_metrics?.clicks || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Open Rate</span>
                    <p className="font-semibold">{(campaign.email_metrics?.open_rate || 0).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Click Rate</span>
                    <p className="font-semibold">{(campaign.email_metrics?.click_rate || 0).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Conversions</span>
                    <p className="font-semibold text-purple-400">{(campaign.email_metrics?.conversions || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}