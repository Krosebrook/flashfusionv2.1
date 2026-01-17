import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { addDays, startOfDay, endOfDay, format } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const getDateRange = () => {
    const end = endOfDay(new Date());
    let start;

    switch (dateRange) {
      case '1day':
        start = startOfDay(new Date());
        break;
      case '7days':
        start = addDays(end, -7);
        break;
      case '30days':
        start = addDays(end, -30);
        break;
      case '90days':
        start = addDays(end, -90);
        break;
      default:
        start = addDays(end, -7);
    }

    return { start, end };
  };

  const generateMockData = () => {
    const days = [];
    const range = getDateRange();
    let currentDate = range.start;

    while (currentDate <= range.end) {
      days.push({
        date: format(currentDate, 'MMM dd'),
        agentTasks: Math.floor(Math.random() * 50),
        contentGenerated: Math.floor(Math.random() * 30),
        salesUplift: Math.floor(Math.random() * 25),
        revenue: Math.floor(Math.random() * 5000) + 2000
      });
      currentDate = addDays(currentDate, 1);
    }

    return {
      timeSeriesData: days,
      agentPerformance: [
        { name: 'CodeGen', tasks: 120, success: 95 },
        { name: 'Marketing', tasks: 85, success: 88 },
        { name: 'Content', tasks: 150, success: 92 },
        { name: 'Design', tasks: 60, success: 90 }
      ],
      contentROI: [
        { type: 'Social Posts', roi: 340, engagement: 2500 },
        { type: 'Email', roi: 280, engagement: 1800 },
        { type: 'Ads', roi: 420, engagement: 3200 },
        { type: 'Blog', roi: 210, engagement: 4100 }
      ],
      salesMetrics: [
        { platform: 'Shopify', sales: 45000, products: 150 },
        { platform: 'Etsy', sales: 28000, products: 85 },
        { platform: 'WooCommerce', sales: 32000, products: 120 },
        { platform: 'Amazon', sales: 55000, products: 200 }
      ],
      summary: {
        totalAgentTasks: 415,
        contentGenerated: 285,
        avgROI: 312,
        totalRevenue: 160000,
        userEngagement: 85
      }
    };
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // In production, fetch real data from base44
      const data = generateMockData();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!analyticsData) return;

    let content = '';
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    if (exportFormat === 'csv') {
      // CSV format
      content = 'Analytics Report\n';
      content += `Generated: ${timestamp}\n`;
      content += `Period: ${dateRange}\n\n`;

      content += 'Daily Metrics\n';
      content += 'Date,Agent Tasks,Content Generated,Sales Uplift,Revenue\n';
      analyticsData.timeSeriesData.forEach(d => {
        content += `${d.date},${d.agentTasks},${d.contentGenerated},${d.salesUplift},${d.revenue}\n`;
      });

      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } else if (exportFormat === 'pdf') {
      // PDF export (would use jsPDF in production)
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text('Analytics Report', 10, 10);

      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp}`, 10, 20);
      doc.text(`Period: ${dateRange}`, 10, 28);

      doc.setFontSize(12);
      doc.text('Summary', 10, 40);
      doc.setFontSize(10);
      let y = 48;
      Object.entries(analyticsData.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 10, y);
        y += 7;
      });

      doc.save(`analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    }
  };

  if (loading || !analyticsData) {
    return <div className="p-4 text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive performance metrics and insights</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Last 24 hours</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV Format</SelectItem>
              <SelectItem value="pdf">PDF Format</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> Agent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.summary.totalAgentTasks}</p>
            <p className="text-xs text-gray-600 mt-1">Completed tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.summary.contentGenerated}</p>
            <p className="text-xs text-gray-600 mt-1">Pieces generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Avg ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.summary.avgROI}%</p>
            <p className="text-xs text-gray-600 mt-1">Content ROI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(analyticsData.summary.totalRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-gray-600 mt-1">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.summary.userEngagement}%</p>
            <p className="text-xs text-gray-600 mt-1">User engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="content">Content ROI</TabsTrigger>
          <TabsTrigger value="sales">E-commerce Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="agentTasks" stroke={COLORS[0]} />
                  <Line type="monotone" dataKey="contentGenerated" stroke={COLORS[1]} />
                  <Line type="monotone" dataKey="salesUplift" stroke={COLORS[2]} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Task Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill={COLORS[0]} />
                  <Bar dataKey="success" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content ROI by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.contentROI}
                      dataKey="roi"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {analyticsData.contentROI.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.contentROI.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.type}</p>
                        <p className="text-xs text-gray-600">{item.engagement} engagements</p>
                      </div>
                      <Badge>{item.roi}% ROI</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>E-commerce Platform Sales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.salesMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill={COLORS[0]} />
                  <Bar dataKey="products" fill={COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid gap-4 md:grid-cols-2">
                {analyticsData.salesMetrics.map((item, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{item.platform}</p>
                      <Badge>{item.products} products</Badge>
                    </div>
                    <p className="text-2xl font-bold">${(item.sales / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}