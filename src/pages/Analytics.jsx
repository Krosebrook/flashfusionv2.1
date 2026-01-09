"use client";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Users, FileText, Sparkles, ShoppingCart, Download, Workflow, Bot, TrendingUp, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";

import UserActivityChart from "../components/analytics/UserActivityChart";
import ContentPerformance from "../components/analytics/ContentPerformance";
import AIUsageStats from "../components/analytics/AIUsageStats";
import EcommerceOverview from "../components/analytics/EcommerceOverview";
import CustomReport from "../components/analytics/CustomReport";
import WorkflowPerformance from "../components/analytics/WorkflowPerformance";
import AgentTaskPerformance from "../components/analytics/AgentTaskPerformance";
import SocialMediaPerformance from "../components/analytics/SocialMediaPerformance";
import EmailCampaignAnalytics from "../components/analytics/EmailCampaignAnalytics";
import AdPerformanceMetrics from "../components/analytics/AdPerformanceMetrics";

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const [usageLogs, setUsageLogs] = useState([]);
  const [contents, setContents] = useState([]);
  const [products, setProducts] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [agentTasks, setAgentTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [currentUser, logs, contentData, productData, workflowData, taskData] = await Promise.all([
        base44.auth.me(),
        base44.entities.UsageLog.list("-created_date", 200),
        base44.entities.ContentPiece.list("-created_date", 100),
        base44.entities.EcommerceProduct.list("-created_date", 100),
        base44.entities.Workflow.list("-created_date", 50),
        base44.entities.AgentTask.list("-created_date", 200)
      ]);

      setUser(currentUser);

      // Filter by time range
      const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
      const startDate = subDays(new Date(), days);

      const filteredLogs = logs.filter(log =>
        new Date(log.created_date) >= startDate
      );

      setUsageLogs(filteredLogs);
      setContents(contentData);
      setProducts(productData);
      setWorkflows(workflowData);
      setAgentTasks(taskData);

    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    }
    setIsLoading(false);
  };

  // Process user activity data
  const processUserActivity = () => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const activityByDate = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "MMM d");
      activityByDate[date] = { date, sessions: 0, unique_users: 0 };
    }

    usageLogs.forEach(log => {
      const date = format(new Date(log.created_date), days <= 7 ? "MMM d" : "MMM d");
      if (activityByDate[date]) {
        activityByDate[date].sessions += 1;
        activityByDate[date].unique_users = 1; // Simplified for demo
      }
    });

    return Object.values(activityByDate);
  };

  const userActivityData = processUserActivity();

  const reportData = {
    userActivity: {
      totalSessions: usageLogs.length,
      activeUsers: 1,
      avgSessionDuration: "N/A"
    },
    content: {
      total: contents.length,
      totalViews: contents.reduce((sum, c) => sum + (c.performance_data?.views || 0), 0),
      avgEngagement: contents.length > 0
        ? (contents.reduce((sum, c) => sum + (c.performance_data?.engagement || 0), 0) / contents.length).toFixed(1)
        : 0
    },
    aiUsage: {
      totalUses: usageLogs.length,
      creditsUsed: usageLogs.reduce((sum, log) => sum + log.credits_used, 0),
      topFeature: usageLogs.length > 0 ? usageLogs[0].feature : "N/A"
    },
    ecommerce: {
      totalProducts: products.length,
      publishedProducts: products.filter(p => p.status === 'published').length,
      totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)
    },
    workflows: {
      total: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'active').length,
      totalExecutions: workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0)
    },
    agentTasks: {
      total: agentTasks.length,
      completed: agentTasks.filter(t => t.status === 'completed').length,
      failed: agentTasks.filter(t => t.status === 'failed').length
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive insights into your FlashFusion workspace
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="bg-gray-800 border-gray-600 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-800 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">
            <TrendingUp className="w-4 h-4 mr-2" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="ads">
            <Sparkles className="w-4 h-4 mr-2" />
            Ads
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="w-4 h-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Bot className="w-4 h-4 mr-2" />
            Agent Tasks
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            User Activity
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Usage
          </TabsTrigger>
          <TabsTrigger value="ecommerce">
            <ShoppingCart className="w-4 h-4 mr-2" />
            E-commerce
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Download className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-green-400">↑ Active</span>
              </div>
              <div className="text-2xl font-bold">{usageLogs.length}</div>
              <div className="text-sm text-gray-400">Total Sessions</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Workflow className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-blue-400">{reportData.workflows.totalExecutions} runs</span>
              </div>
              <div className="text-2xl font-bold">{workflows.length}</div>
              <div className="text-sm text-gray-400">Workflows</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Bot className="w-8 h-8 text-green-400" />
                <span className="text-xs text-green-400">{reportData.agentTasks.completed} done</span>
              </div>
              <div className="text-2xl font-bold">{agentTasks.length}</div>
              <div className="text-sm text-gray-400">Agent Tasks</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <span className="text-xs text-blue-400">{reportData.aiUsage.creditsUsed} credits</span>
              </div>
              <div className="text-2xl font-bold">{usageLogs.length}</div>
              <div className="text-sm text-gray-400">AI Operations</div>
            </div>
          </div>

          <UserActivityChart data={userActivityData} timeRange={timeRange} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Workflows</span>
                  <span className="font-semibold">{reportData.workflows.activeWorkflows}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completed Tasks</span>
                  <span className="font-semibold">{reportData.agentTasks.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Published Products</span>
                  <span className="font-semibold">{reportData.ecommerce.publishedProducts}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Plan</span>
                  <span className="font-semibold text-blue-400">{user?.plan || 'Free'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Credits Remaining</span>
                  <span className="font-semibold text-yellow-400">{user?.credits_remaining?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Credits Used</span>
                  <span className="font-semibold">{reportData.aiUsage.creditsUsed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialMediaPerformance />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailCampaignAnalytics />
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <AdPerformanceMetrics />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowPerformance workflows={workflows} tasks={agentTasks} />
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <AgentTaskPerformance tasks={agentTasks} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserActivityChart data={userActivityData} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentPerformance contents={contents} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIUsageStats usageLogs={usageLogs} />
        </TabsContent>

        <TabsContent value="ecommerce" className="space-y-6">
          <EcommerceOverview products={products} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <CustomReport data={reportData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}