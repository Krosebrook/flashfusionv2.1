"use client";
import { useState, useEffect } from "react";
import { User, UsageLog, Plugin, BrandKit } from "@/entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Atom,
  Palette,
  Plug,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Import our new components
import UsageChart from "../components/dashboard/UsageChart";
import CreditMeter from "../components/shared/CreditMeter";
import FeatureCard from "../components/shared/FeatureCard";

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-full bg-${color}-500 bg-opacity-20`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-green-400 font-medium">{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const RecentActivity = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
          <div className="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.details}</p>
            <p className="text-xs text-gray-400">
              {format(new Date(activity.created_date), 'MMM d, h:mm a')}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {activity.credits_used} credits
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pluginCount, setPluginCount] = useState(0);
  const [brandKitCount, setBrandKitCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [currentUser, usageLogs, plugins, brandKits] = await Promise.all([
          User.me(),
          UsageLog.list("-created_date", 100),
          Plugin.list(),
          BrandKit.list()
        ]);
        
        setUser(currentUser);
        setRecentActivity(usageLogs.slice(0, 10));
        
        // Process usage data based on time range
        const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
        const startDate = subDays(new Date(), days);
        
        const filteredLogs = usageLogs.filter(log => 
          new Date(log.created_date) >= startDate
        );
        
        const formattedUsage = filteredLogs.reduce((acc, log) => {
          const date = format(new Date(log.created_date), days <= 7 ? "MMM d" : "MMM d");
          if (!acc[date]) {
            acc[date] = { date, credits_used: 0, sessions: 0 };
          }
          acc[date].credits_used += log.credits_used;
          acc[date].sessions += 1;
          return acc;
        }, {});

        setUsage(Object.values(formattedUsage).reverse());
        setPluginCount(plugins.length);
        setBrandKitCount(brandKits.length);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [timeRange]);

  const calculateStats = () => {
    const totalCreditsUsed = usage.reduce((sum, item) => sum + item.credits_used, 0);
    const totalSessions = usage.reduce((sum, item) => sum + item.sessions, 0);
    const avgCreditsPerDay = usage.length > 0 ? Math.round(totalCreditsUsed / usage.length) : 0;
    
    return {
      totalCreditsUsed,
      totalSessions,
      avgCreditsPerDay,
      creditsRemaining: user?.credits_remaining || 0,
      currentPlan: user?.plan || 'Free'
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your AI-powered workspace today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Credit Status Alert */}
      {stats.creditsRemaining < 100 && (
        <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-300 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Running Low on Credits</p>
              <p className="text-sm">You have {stats.creditsRemaining} credits remaining.</p>
            </div>
            <Link to={createPageUrl("Billing")}>
              <Button variant="outline" size="sm">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Credits Remaining" 
              value={stats.creditsRemaining.toLocaleString()} 
              icon={Zap} 
              color="yellow"
              subtitle={`${stats.currentPlan} plan`}
            />
            <StatCard 
              title="Credits Used" 
              value={stats.totalCreditsUsed.toLocaleString()} 
              icon={BarChart3} 
              color="blue"
              trend={`${timeRange.replace('days', 'd')}`}
              subtitle={`${stats.avgCreditsPerDay}/day avg`}
            />
            <StatCard 
              title="AI Sessions" 
              value={stats.totalSessions} 
              icon={Activity} 
              color="green"
              subtitle="AI generations"
            />
            <StatCard 
              title="Available Tools" 
              value={pluginCount + 2} 
              icon={Plug} 
              color="purple"
              subtitle="Plugins + Generators"
            />
          </div>

          {/* Credit Meter */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Credit Usage</h2>
            <CreditMeter 
              current={stats.creditsRemaining}
              max={stats.currentPlan === 'Free' ? 1000 : stats.currentPlan === 'Creator' ? 50000 : 250000}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="Generate Feature"
                description="Convert your ideas into production-ready code"
                icon={Atom}
                href={createPageUrl("FeatureGenerator")}
                creditCost={50}
                category="Development"
                isPopular={true}
              />
              <FeatureCard
                title="Create Brand Kit"
                description="Design a complete brand identity in minutes"
                icon={Palette}
                href={createPageUrl("BrandKitGenerator")}
                creditCost={150}
                category="Design"
              />
              <FeatureCard
                title="Run Plugin"
                description="Use specialized AI tools for specific tasks"
                icon={Plug}
                href={createPageUrl("Plugins")}
                creditCost={25}
                category="Utilities"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Usage Analytics</h2>
            <UsageChart data={usage} type="area" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <RecentActivity activities={recentActivity} isLoading={false} />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Usage Breakdown</h3>
              <div className="space-y-4">
                {['FeatureGenerator', 'BrandKitGenerator', 'PluginRunner'].map((feature) => {
                  const featureUsage = recentActivity.filter(a => a.feature === feature);
                  const totalCredits = featureUsage.reduce((sum, a) => sum + a.credits_used, 0);
                  const percentage = stats.totalCreditsUsed > 0 ? (totalCredits / stats.totalCreditsUsed) * 100 : 0;
                  
                  return (
                    <div key={feature}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{feature}</span>
                        <span className="text-sm text-gray-400">{totalCredits} credits</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">All Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="Advanced Feature Generator"
                description="Generate complex full-stack features with multiple components"
                icon={Atom}
                href={createPageUrl("FeatureGenerator")}
                creditCost="25-200"
                category="Development"
                isPopular={true}
              />
              <FeatureCard
                title="Smart Brand Kit"
                description="AI-powered brand identity with multiple logo variations"
                icon={Palette}
                href={createPageUrl("BrandKitGenerator")}
                creditCost={200}
                category="Design"
              />
              {Array.from({ length: pluginCount }, (_, i) => (
                <FeatureCard
                  key={i}
                  title="AI Plugin"
                  description="Specialized AI tool for specific tasks"
                  icon={Plug}
                  href={createPageUrl("Plugins")}
                  creditCost={25}
                  category="Utilities"
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}