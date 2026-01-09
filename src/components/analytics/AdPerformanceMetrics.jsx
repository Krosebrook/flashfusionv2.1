import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { TrendingUp, DollarSign, Target, Zap } from "lucide-react";

const StatBadge = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
    <div className={`p-2 rounded-lg bg-${color}-500/20`}>
      <Icon className={`w-5 h-5 text-${color}-400`} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold">{typeof value === 'number' && value > 100 ? value.toFixed(2) : value}</p>
    </div>
  </div>
);

export default function AdPerformanceMetrics() {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.ContentPerformance.filter({
        content_type: "ad_copy"
      }, "-published_date", 100);
      setAds(data);
    } catch (error) {
      console.error("Failed to fetch ad metrics:", error);
    }
    setIsLoading(false);
  };

  const filteredAds = selectedPlatform === "all" 
    ? ads 
    : ads.filter(a => a.platform === selectedPlatform);

  const calculateStats = () => {
    const totalImpressions = filteredAds.reduce((sum, a) => sum + (a.ad_metrics?.impressions || 0), 0);
    const totalClicks = filteredAds.reduce((sum, a) => sum + (a.ad_metrics?.clicks || 0), 0);
    const totalConversions = filteredAds.reduce((sum, a) => sum + (a.ad_metrics?.conversions || 0), 0);
    const totalSpend = filteredAds.reduce((sum, a) => sum + (a.ad_metrics?.spend || 0), 0);
    const totalRevenue = filteredAds.reduce((sum, a) => sum + (a.ad_metrics?.revenue || 0), 0);

    return {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpend,
      totalRevenue,
      avgCTR: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0,
      avgCPA: totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : 0,
      avgROAS: totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 0,
      profit: totalRevenue - totalSpend
    };
  };

  const platforms = [...new Set(ads.map(a => a.platform))];
  const stats = calculateStats();

  const chartData = filteredAds.map(a => ({
    name: a.content_title.substring(0, 12),
    impressions: a.ad_metrics?.impressions || 0,
    clicks: a.ad_metrics?.clicks || 0,
    conversions: a.ad_metrics?.conversions || 0,
    spend: a.ad_metrics?.spend || 0,
    revenue: a.ad_metrics?.revenue || 0
  }));

  const efficiencyData = filteredAds.map(a => ({
    name: a.content_title.substring(0, 12),
    cpc: a.ad_metrics?.cpc || 0,
    cpa: a.ad_metrics?.cpa || 0,
    roas: a.ad_metrics?.roas || 0
  }));

  if (isLoading) return <div className="text-gray-400">Loading ad metrics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Ad Performance Metrics</h3>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge 
            variant={selectedPlatform === "all" ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedPlatform("all")}
          >
            All Platforms
          </Badge>
          {platforms.map(platform => (
            <Badge
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedPlatform(platform)}
            >
              {platform}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge 
          label="Total Impressions" 
          value={stats.totalImpressions.toLocaleString()}
          icon={TrendingUp}
          color="blue"
        />
        <StatBadge 
          label="Avg CTR" 
          value={`${stats.avgCTR}%`}
          icon={Target}
          color="purple"
        />
        <StatBadge 
          label="Total Spend" 
          value={`$${stats.totalSpend.toFixed(2)}`}
          icon={DollarSign}
          color="red"
        />
        <StatBadge 
          label="ROAS" 
          value={`${stats.avgROAS}x`}
          icon={Zap}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">${stats.totalRevenue.toFixed(2)}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-sm text-gray-400 mb-1">Total Conversions</p>
          <p className="text-2xl font-bold text-blue-400">{stats.totalConversions.toLocaleString()}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-sm text-gray-400 mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats.profit.toFixed(2)}
          </p>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">Ad Performance Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" yAxisId="left" />
              <YAxis stroke="#9CA3AF" yAxisId="right" orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
              <Legend />
              <Bar yAxisId="left" dataKey="impressions" fill="#3B82F6" name="Impressions" />
              <Bar yAxisId="left" dataKey="clicks" fill="#10B981" name="Clicks" />
              <Bar yAxisId="right" dataKey="conversions" fill="#8B5CF6" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {efficiencyData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">Cost Efficiency</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="cpa" stroke="#9CA3AF" name="CPA" />
              <YAxis type="number" dataKey="roas" stroke="#9CA3AF" name="ROAS" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
              <Scatter name="Ads" data={efficiencyData} fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      )}

      {filteredAds.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">Ad Details</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAds
              .sort((a, b) => (b.ad_metrics?.roas || 0) - (a.ad_metrics?.roas || 0))
              .map(ad => (
                <div key={ad.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium flex-1">{ad.content_title}</h5>
                    <Badge variant="outline" className="text-xs">{ad.platform}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Impressions</span>
                      <p className="font-semibold">{(ad.ad_metrics?.impressions || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Clicks</span>
                      <p className="font-semibold">{(ad.ad_metrics?.clicks || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">CTR</span>
                      <p className="font-semibold">{(ad.ad_metrics?.ctr || 0).toFixed(2)}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Spend</span>
                      <p className="font-semibold">${(ad.ad_metrics?.spend || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Conversions</span>
                      <p className="font-semibold text-purple-400">{(ad.ad_metrics?.conversions || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">CPA</span>
                      <p className="font-semibold">${(ad.ad_metrics?.cpa || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">ROAS</span>
                      <p className="font-semibold text-green-400">{(ad.ad_metrics?.roas || 0).toFixed(2)}x</p>
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