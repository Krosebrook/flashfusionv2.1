import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, TrendingUp, Clock } from "lucide-react";

export default function UserActivityChart({ data, timeRange }) {
  const totalSessions = data.reduce((sum, item) => sum + (item.sessions || 0), 0);
  const avgSessionsPerDay = data.length > 0 ? Math.round(totalSessions / data.length) : 0;
  const totalUsers = data.reduce((sum, item) => sum + (item.unique_users || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-400">{totalSessions}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Sessions/Day</p>
              <p className="text-2xl font-bold text-green-400">{avgSessionsPerDay}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-purple-400">{totalUsers}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">User Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Area type="monotone" dataKey="sessions" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Sessions" />
            <Area type="monotone" dataKey="unique_users" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="Unique Users" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}