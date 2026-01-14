import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, MessageCircle, Eye, ThumbsUp } from "lucide-react";

const StatBadge = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
    <div className={`p-2 rounded-lg bg-${color}-500/20`}>
      <Icon className={`w-5 h-5 text-${color}-400`} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

export default function SocialMediaPerformance() {
  const [performances, setPerformances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.ContentPerformance.filter({
        content_type: "social_post"
      }, "-published_date", 100);
      setPerformances(data);
    } catch (error) {
      console.error("Failed to fetch social performance:", error);
    }
    setIsLoading(false);
  };

  const filteredData = selectedPlatform === "all" 
    ? performances 
    : performances.filter(p => p.platform === selectedPlatform);

  const calculateStats = () => {
    return {
      totalImpressions: filteredData.reduce((sum, p) => sum + (p.social_metrics?.impressions || 0), 0),
      totalEngagement: filteredData.reduce((sum, p) => sum + (p.social_metrics?.likes || 0) + (p.social_metrics?.comments || 0) + (p.social_metrics?.shares || 0), 0),
      avgEngagementRate: filteredData.length > 0 ? (filteredData.reduce((sum, p) => sum + (p.social_metrics?.engagement_rate || 0), 0) / filteredData.length).toFixed(1) : 0,
      totalReach: filteredData.reduce((sum, p) => sum + (p.social_metrics?.reach || 0), 0)
    };
  };

  const platforms = [...new Set(performances.map(p => p.platform))];
  const stats = calculateStats();

  const chartData = filteredData.map(p => ({
    name: p.content_title.substring(0, 15),
    impressions: p.social_metrics?.impressions || 0,
    reach: p.social_metrics?.reach || 0,
    engagement: (p.social_metrics?.likes || 0) + (p.social_metrics?.comments || 0) + (p.social_metrics?.shares || 0)
  }));

  if (isLoading) return <div className="text-gray-400">Loading social metrics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Social Media Performance</h3>
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
          icon={Eye}
          color="blue"
        />
        <StatBadge 
          label="Total Reach" 
          value={stats.totalReach.toLocaleString()} 
          icon={TrendingUp}
          color="green"
        />
        <StatBadge 
          label="Avg Engagement Rate" 
          value={`${stats.avgEngagementRate}%`}
          icon={MessageCircle}
          color="purple"
        />
        <StatBadge 
          label="Total Engagements" 
          value={stats.totalEngagement.toLocaleString()} 
          icon={ThumbsUp}
          color="pink"
        />
      </div>

      {chartData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">Performance by Post</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
              <Legend />
              <Bar dataKey="impressions" fill="#3B82F6" />
              <Bar dataKey="engagement" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {filteredData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h4 className="font-semibold mb-4">Top Performing Posts</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData
              .sort((a, b) => (b.social_metrics?.engagement_rate || 0) - (a.social_metrics?.engagement_rate || 0))
              .slice(0, 10)
              .map(post => (
                <div key={post.id} className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium truncate flex-1">{post.content_title}</h5>
                    <Badge variant="outline" className="text-xs">{post.platform}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-gray-400">Impressions:</span> <span className="font-semibold">{(post.social_metrics?.impressions || 0).toLocaleString()}</span></div>
                    <div><span className="text-gray-400">Reach:</span> <span className="font-semibold">{(post.social_metrics?.reach || 0).toLocaleString()}</span></div>
                    <div><span className="text-gray-400">Engagement:</span> <span className="font-semibold">{((post.social_metrics?.likes || 0) + (post.social_metrics?.comments || 0) + (post.social_metrics?.shares || 0)).toLocaleString()}</span></div>
                    <div><span className="text-gray-400">Rate:</span> <span className="font-semibold text-green-400">{(post.social_metrics?.engagement_rate || 0).toFixed(1)}%</span></div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}