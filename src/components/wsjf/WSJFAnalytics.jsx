import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, AlertTriangle, Activity,
  ArrowUpDown, User, Calendar, Zap
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";

const InsightCard = ({ title, value, subtitle, icon: Icon, color, alert }) => (
  <Card className={`bg-gray-800 border-gray-700 p-4 ${alert ? 'border-yellow-500' : ''}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
    </div>
    {alert && (
      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
        <AlertTriangle className="w-3 h-3" />
        {alert}
      </div>
    )}
  </Card>
);

export default function WSJFAnalytics({ items, history }) {
  const [timeRange, setTimeRange] = useState(14);

  const driftData = useMemo(() => {
    const cutoffDate = subDays(new Date(), timeRange);
    const recentHistory = history.filter(h => new Date(h.created_date) >= cutoffDate);

    // Per-item drift analysis
    const itemDrift = {};
    items.forEach(item => {
      const itemHistory = recentHistory.filter(h => h.item_id === item.id);
      const scoreChanges = itemHistory.filter(h => 
        h.action === 'update' && h.old_wsjf_score !== h.new_wsjf_score
      );

      itemDrift[item.id] = {
        item,
        totalChanges: itemHistory.length,
        scoreChanges: scoreChanges.length,
        volatility: scoreChanges.length > 0 
          ? scoreChanges.reduce((sum, h) => sum + Math.abs((h.new_wsjf_score || 0) - (h.old_wsjf_score || 0)), 0) / scoreChanges.length
          : 0,
        scoreTrend: scoreChanges.length > 0
          ? (scoreChanges[0]?.new_wsjf_score || 0) - (scoreChanges[scoreChanges.length - 1]?.old_wsjf_score || 0)
          : 0,
        uniqueEditors: [...new Set(itemHistory.map(h => h.actor_email))].length,
        lastChange: itemHistory[0]?.created_date
      };
    });

    // Per-user activity
    const userActivity = {};
    recentHistory.forEach(h => {
      if (!userActivity[h.actor_email]) {
        userActivity[h.actor_email] = { email: h.actor_email, changes: 0, scoreChanges: 0, itemsTouched: new Set() };
      }
      userActivity[h.actor_email].changes++;
      userActivity[h.actor_email].itemsTouched.add(h.item_id);
      if (h.action === 'update' && h.old_wsjf_score !== h.new_wsjf_score) {
        userActivity[h.actor_email].scoreChanges++;
      }
    });

    // Daily score changes timeline
    const dailyChanges = {};
    recentHistory.forEach(h => {
      const day = format(new Date(h.created_date), 'MMM d');
      if (!dailyChanges[day]) {
        dailyChanges[day] = { date: day, changes: 0, scoreChanges: 0, inserts: 0, deletes: 0 };
      }
      dailyChanges[day].changes++;
      if (h.action === 'insert') dailyChanges[day].inserts++;
      if (h.action === 'delete') dailyChanges[day].deletes++;
      if (h.action === 'update' && h.old_wsjf_score !== h.new_wsjf_score) {
        dailyChanges[day].scoreChanges++;
      }
    });

    return {
      itemDrift: Object.values(itemDrift),
      userActivity: Object.values(userActivity).map(u => ({ ...u, itemsTouched: u.itemsTouched.size })),
      dailyChanges: Object.values(dailyChanges).reverse(),
      totalChanges: recentHistory.length,
      totalScoreChanges: recentHistory.filter(h => h.action === 'update' && h.old_wsjf_score !== h.new_wsjf_score).length
    };
  }, [items, history, timeRange]);

  // Gaming/noise detection
  const gamingInsights = useMemo(() => {
    const insights = [];
    
    // Items with excessive score changes
    const highVolatilityItems = driftData.itemDrift.filter(d => d.scoreChanges >= 3);
    if (highVolatilityItems.length > 0) {
      insights.push({
        type: 'warning',
        title: 'High Score Volatility',
        description: `${highVolatilityItems.length} item(s) have had 3+ score changes in ${timeRange} days`,
        items: highVolatilityItems.map(d => d.item.title)
      });
    }

    // Users with high score change activity
    const hyperactiveUsers = driftData.userActivity.filter(u => u.scoreChanges >= 5);
    if (hyperactiveUsers.length > 0) {
      insights.push({
        type: 'alert',
        title: 'Frequent Score Editors',
        description: `${hyperactiveUsers.length} user(s) have made 5+ score changes`,
        users: hyperactiveUsers.map(u => u.email)
      });
    }

    // Items with many editors (potential conflict)
    const multiEditorItems = driftData.itemDrift.filter(d => d.uniqueEditors >= 3);
    if (multiEditorItems.length > 0) {
      insights.push({
        type: 'info',
        title: 'Multi-Editor Items',
        description: `${multiEditorItems.length} item(s) edited by 3+ different users`,
        items: multiEditorItems.map(d => d.item.title)
      });
    }

    // Score bumping pattern (consistent upward changes)
    const bumpedItems = driftData.itemDrift.filter(d => d.scoreTrend > 3 && d.scoreChanges >= 2);
    if (bumpedItems.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Potential Score Gaming',
        description: `${bumpedItems.length} item(s) show consistent score increases`,
        items: bumpedItems.map(d => d.item.title)
      });
    }

    return insights;
  }, [driftData, timeRange]);

  const stats = {
    totalChanges: driftData.totalChanges,
    scoreChanges: driftData.totalScoreChanges,
    avgVolatility: driftData.itemDrift.length > 0 
      ? (driftData.itemDrift.reduce((s, d) => s + d.volatility, 0) / driftData.itemDrift.length).toFixed(2)
      : 0,
    activeEditors: driftData.userActivity.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          WSJF Drift Analytics
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InsightCard 
          title="Total Changes" 
          value={stats.totalChanges} 
          subtitle={`In ${timeRange} days`}
          icon={Activity} 
          color="blue" 
        />
        <InsightCard 
          title="Score Changes" 
          value={stats.scoreChanges} 
          subtitle="WSJF recalculations"
          icon={ArrowUpDown} 
          color="purple"
          alert={stats.scoreChanges > 20 ? "High activity detected" : null}
        />
        <InsightCard 
          title="Avg Volatility" 
          value={stats.avgVolatility} 
          subtitle="Score change magnitude"
          icon={TrendingUp} 
          color="yellow" 
        />
        <InsightCard 
          title="Active Editors" 
          value={stats.activeEditors} 
          subtitle="Unique users"
          icon={User} 
          color="green" 
        />
      </div>

      {gamingInsights.length > 0 && (
        <Card className="bg-yellow-900/20 border-yellow-700 p-4">
          <h3 className="font-semibold flex items-center gap-2 text-yellow-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Gaming & Noise Detection
          </h3>
          <div className="space-y-3">
            {gamingInsights.map((insight, i) => (
              <div key={i} className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={insight.type === 'alert' ? 'destructive' : insight.type === 'warning' ? 'outline' : 'secondary'}>
                    {insight.title}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">{insight.description}</p>
                {insight.items && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.items.slice(0, 5).map((item, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                    {insight.items.length > 5 && <Badge variant="outline" className="text-xs">+{insight.items.length - 5} more</Badge>}
                  </div>
                )}
                {insight.users && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.users.map((user, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{user}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="items">Item Volatility</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="font-medium mb-4">Daily Change Activity</h3>
            {driftData.dailyChanges.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={driftData.dailyChanges}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Area type="monotone" dataKey="changes" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Total Changes" />
                  <Area type="monotone" dataKey="scoreChanges" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} name="Score Changes" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No activity in selected period</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="font-medium mb-4">Item Score Volatility</h3>
            {driftData.itemDrift.filter(d => d.scoreChanges > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={driftData.itemDrift.filter(d => d.scoreChanges > 0).sort((a, b) => b.volatility - a.volatility).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="item.title" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Bar dataKey="volatility" fill="#F59E0B" name="Avg Score Change" />
                  <Bar dataKey="scoreChanges" fill="#8B5CF6" name="# of Changes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No score changes in selected period</p>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driftData.itemDrift
              .filter(d => d.scoreChanges > 0)
              .sort((a, b) => b.scoreChanges - a.scoreChanges)
              .slice(0, 6)
              .map((d, i) => (
                <Card key={i} className="bg-gray-800 border-gray-700 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{d.item.title}</p>
                      <p className="text-xs text-gray-400">{d.scoreChanges} score changes by {d.uniqueEditors} editor(s)</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${d.scoreTrend > 0 ? 'text-green-400' : d.scoreTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {d.scoreTrend > 0 ? <TrendingUp className="w-3 h-3" /> : d.scoreTrend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                        <span className="text-sm font-medium">{d.scoreTrend > 0 ? '+' : ''}{d.scoreTrend.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-500">net change</p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="font-medium mb-4">User Activity Distribution</h3>
            {driftData.userActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={driftData.userActivity.sort((a, b) => b.changes - a.changes).slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis dataKey="email" type="category" stroke="#9CA3AF" fontSize={10} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="changes" fill="#3B82F6" name="Total Changes" />
                  <Bar dataKey="scoreChanges" fill="#EF4444" name="Score Changes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No user activity in selected period</p>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {driftData.userActivity
              .sort((a, b) => b.scoreChanges - a.scoreChanges)
              .slice(0, 6)
              .map((u, i) => (
                <Card key={i} className={`bg-gray-800 border-gray-700 p-3 ${u.scoreChanges >= 5 ? 'border-yellow-500' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">
                      {u.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="font-bold text-blue-400">{u.changes}</div>
                      <div className="text-gray-500">Changes</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-400">{u.scoreChanges}</div>
                      <div className="text-gray-500">Score Edits</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-400">{u.itemsTouched}</div>
                      <div className="text-gray-500">Items</div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}