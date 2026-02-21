import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Loader2,
  Sparkles,
  AlertTriangle,
  Target,
  BarChart3,
} from "lucide-react";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function EcommerceAnalytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        base44.entities.Order.list("-created_date"),
        base44.entities.EcommerceProduct.list(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    }
    setIsLoading(false);
  };

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const analyticsData = prepareAnalyticsData();
      
      const prompt = `Analyze this e-commerce data and provide comprehensive insights:

Sales Data:
- Total Revenue: $${analyticsData.totalRevenue.toFixed(2)}
- Total Orders: ${analyticsData.totalOrders}
- Average Order Value: $${analyticsData.avgOrderValue.toFixed(2)}
- Top Product: ${analyticsData.topProduct}
- Customer Retention Rate: ${analyticsData.customerRetentionRate}%

Platform Performance:
${Object.entries(analyticsData.platformSales).map(([p, s]) => `- ${p}: $${s.toFixed(2)}`).join('\n')}

Inventory Status:
- Low Stock Items: ${analyticsData.lowStockCount}
- Out of Stock Items: ${analyticsData.outOfStockCount}
- Total Inventory Value: $${analyticsData.totalInventoryValue.toFixed(2)}

Provide:
1. Sales trend prediction for next 30 days (revenue estimate and confidence level)
2. Top 3 products likely to sell out soon (with days until stockout)
3. Recommended inventory restocking priorities (product names and quantities)
4. Customer behavior insights (buying patterns, peak times)
5. Marketing recommendations for underperforming platforms
6. Revenue growth opportunities
7. Risk factors to watch`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sales_prediction: {
              type: "object",
              properties: {
                next_30_days_revenue: { type: "number" },
                confidence_level: { type: "string" },
                trend: { type: "string" },
              },
            },
            stockout_warnings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  days_until_stockout: { type: "number" },
                  recommended_reorder: { type: "number" },
                },
              },
            },
            restock_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  current_stock: { type: "number" },
                  recommended_quantity: { type: "number" },
                  priority: { type: "string" },
                },
              },
            },
            customer_insights: {
              type: "array",
              items: { type: "string" },
            },
            marketing_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  recommendation: { type: "string" },
                },
              },
            },
            growth_opportunities: {
              type: "array",
              items: { type: "string" },
            },
            risk_factors: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });

      setAiInsights(result);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      alert("Failed to generate AI insights. Please try again.");
    }
    setIsGeneratingInsights(false);
  };

  const prepareAnalyticsData = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales by platform
    const platformSales = orders.reduce((acc, order) => {
      acc[order.platform] = (acc[order.platform] || 0) + order.total;
      return acc;
    }, {});

    // Customer retention
    const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;
    const repeatCustomers = orders.reduce((acc, order) => {
      const customerOrders = orders.filter(o => o.customer_email === order.customer_email);
      if (customerOrders.length > 1 && !acc.has(order.customer_email)) {
        acc.add(order.customer_email);
      }
      return acc;
    }, new Set()).size;
    const customerRetentionRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers * 100).toFixed(1) : 0;

    // Top product
    const productSales = {};
    orders.forEach(order => {
      order.products?.forEach(p => {
        productSales[p.product_title] = (productSales[p.product_title] || 0) + (p.subtotal || 0);
      });
    });
    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Inventory
    const lowStockCount = products.filter(p => p.inventory <= (p.reorder_point || 10)).length;
    const outOfStockCount = products.filter(p => p.inventory === 0).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.inventory || 0), 0);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      platformSales,
      customerRetentionRate,
      topProduct,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
    };
  };

  const getSalesTrendData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => o.created_date?.startsWith(dateStr));
      const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(revenue.toFixed(2)),
        orders: dayOrders.length,
      });
    }
    return last30Days;
  };

  const getPlatformData = () => {
    const platformStats = {};
    orders.forEach(order => {
      if (!platformStats[order.platform]) {
        platformStats[order.platform] = { revenue: 0, orders: 0 };
      }
      platformStats[order.platform].revenue += order.total || 0;
      platformStats[order.platform].orders += 1;
    });

    return Object.entries(platformStats).map(([name, stats]) => ({
      name,
      revenue: parseFloat(stats.revenue.toFixed(2)),
      orders: stats.orders,
    }));
  };

  const getProductPerformance = () => {
    const productStats = {};
    
    orders.forEach(order => {
      order.products?.forEach(p => {
        if (!productStats[p.product_title]) {
          productStats[p.product_title] = { revenue: 0, quantity: 0 };
        }
        productStats[p.product_title].revenue += p.subtotal || 0;
        productStats[p.product_title].quantity += p.quantity || 0;
      });
    });

    return Object.entries(productStats)
      .map(([name, stats]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        revenue: parseFloat(stats.revenue.toFixed(2)),
        quantity: stats.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const getInventoryTurnover = () => {
    return products.map(product => {
      const sold = orders.reduce((sum, order) => {
        const productInOrder = order.products?.find(p => p.product_id === product.id);
        return sum + (productInOrder?.quantity || 0);
      }, 0);

      const avgInventory = (product.inventory || 0) + (sold / 2);
      const turnoverRate = avgInventory > 0 ? (sold / avgInventory).toFixed(2) : 0;

      return {
        name: product.title.length > 25 ? product.title.substring(0, 25) + '...' : product.title,
        turnoverRate: parseFloat(turnoverRate),
        currentStock: product.inventory || 0,
        totalSold: sold,
      };
    })
    .filter(p => p.totalSold > 0)
    .sort((a, b) => b.turnoverRate - a.turnoverRate)
    .slice(0, 10);
  };

  const getOrderStatusDistribution = () => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }));
  };

  const stats = {
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    totalOrders: orders.length,
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length : 0,
    conversionRate: products.length > 0 ? (orders.length / products.length * 100).toFixed(1) : 0,
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-400 mb-4" />
        <p className="text-gray-400">Loading analytics...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total Revenue</div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400">{stats.totalOrders}</div>
          <div className="text-sm text-gray-400">Total Orders</div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">
            ${stats.avgOrderValue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Avg Order Value</div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400">
            {stats.conversionRate}%
          </div>
          <div className="text-sm text-gray-400">Conversion Rate</div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
          </div>
          <Button
            onClick={generateAIInsights}
            disabled={isGeneratingInsights || orders.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGeneratingInsights ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </div>

        {!aiInsights ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">
              Click "Generate Insights" for AI-powered predictions and recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sales Prediction */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700 rounded-lg p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                30-Day Sales Forecast
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Predicted Revenue</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${aiInsights.sales_prediction?.next_30_days_revenue?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Confidence</p>
                  <Badge className="bg-green-500/20 text-green-400">
                    {aiInsights.sales_prediction?.confidence_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Trend</p>
                  <p className="text-lg font-semibold text-gray-300">
                    {aiInsights.sales_prediction?.trend}
                  </p>
                </div>
              </div>
            </div>

            {/* Stockout Warnings */}
            {aiInsights.stockout_warnings?.length > 0 && (
              <div className="bg-red-900/10 border border-red-700 rounded-lg p-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Stockout Warnings
                </h4>
                <div className="space-y-3">
                  {aiInsights.stockout_warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{warning.product}</p>
                        <p className="text-sm text-gray-400">
                          Est. {warning.days_until_stockout} days until stockout
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-400">
                        Reorder: {warning.recommended_reorder} units
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restock Priorities */}
            {aiInsights.restock_priorities?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  Inventory Restock Priorities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsights.restock_priorities.map((item, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{item.product}</p>
                        <Badge
                          className={
                            item.priority === "High"
                              ? "bg-red-500/20 text-red-400"
                              : item.priority === "Medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Current: {item.current_stock}</span>
                        <span>Recommended: {item.recommended_quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Insights */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Customer Behavior Insights
              </h4>
              <ul className="space-y-2">
                {aiInsights.customer_insights?.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Marketing Recommendations */}
            {aiInsights.marketing_recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Marketing Recommendations</h4>
                <div className="space-y-3">
                  {aiInsights.marketing_recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                      <p className="font-medium text-blue-400 mb-1">{rec.platform}</p>
                      <p className="text-sm text-gray-300">{rec.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Opportunities */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Growth Opportunities
              </h4>
              <ul className="space-y-2">
                {aiInsights.growth_opportunities?.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-purple-400 mt-1">→</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* Charts */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="sales">Sales Trends</TabsTrigger>
          <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Turnover</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Revenue & Orders (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={getSalesTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Performance by Platform</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getPlatformData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getProductPerformance()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Inventory Turnover Rates</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getInventoryTurnover()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={180} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Bar dataKey="turnoverRate" fill="#f59e0b" name="Turnover Rate" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Status Distribution */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-6">Order Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={getOrderStatusDistribution()}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {getOrderStatusDistribution().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}