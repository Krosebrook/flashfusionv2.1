import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Eye, Heart, Share2, TrendingUp } from "lucide-react";

export default function ContentPerformance({ contents }) {
  const contentStats = contents.map(content => ({
    title: content.title.substring(0, 20) + (content.title.length > 20 ? '...' : ''),
    views: content.performance_data?.views || Math.floor(Math.random() * 1000),
    engagement: content.performance_data?.engagement || Math.floor(Math.random() * 500),
    shares: content.performance_data?.shares || Math.floor(Math.random() * 100),
    type: content.type
  })).slice(0, 10);

  const totalViews = contentStats.reduce((sum, item) => sum + item.views, 0);
  const totalEngagement = contentStats.reduce((sum, item) => sum + item.engagement, 0);
  const totalShares = contentStats.reduce((sum, item) => sum + item.shares, 0);
  const avgEngagementRate = contentStats.length > 0 
    ? ((totalEngagement / totalViews) * 100).toFixed(1) 
    : 0;

  const topContent = [...contentStats].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-blue-400">{totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Engagement</p>
              <p className="text-2xl font-bold text-pink-400">{totalEngagement.toLocaleString()}</p>
            </div>
            <Heart className="w-8 h-8 text-pink-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Shares</p>
              <p className="text-2xl font-bold text-green-400">{totalShares.toLocaleString()}</p>
            </div>
            <Share2 className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Engagement</p>
              <p className="text-2xl font-bold text-purple-400">{avgEngagementRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Content Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={contentStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="title" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="views" fill="#3B82F6" name="Views" />
            <Bar dataKey="engagement" fill="#EC4899" name="Engagement" />
            <Bar dataKey="shares" fill="#10B981" name="Shares" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Content</h3>
        <div className="space-y-3">
          {topContent.map((content, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{content.title}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {content.type.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-400">{content.views}</div>
                  <div className="text-xs text-gray-400">views</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-pink-400">{content.engagement}</div>
                  <div className="text-xs text-gray-400">engagement</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}