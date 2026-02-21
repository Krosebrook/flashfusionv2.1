import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Sparkles,
  Loader2,
  BarChart3,
  Package,
} from "lucide-react";

export default function SalesForecast() {
  const [forecast, setForecast] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        base44.entities.EcommerceProduct.list(),
        base44.entities.Order.list(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const generateForecast = async () => {
    setIsGenerating(true);
    try {
      // Prepare historical data
      const last30Days = orders.filter((order) => {
        const orderDate = new Date(order.created_date);
        const daysAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      });

      const historicalData = {
        totalOrders: orders.length,
        last30DaysOrders: last30Days.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        last30DaysRevenue: last30Days.reduce((sum, o) => sum + (o.total || 0), 0),
        averageOrderValue: orders.length > 0
          ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length
          : 0,
        topProducts: products
          .map((p) => ({
            title: p.title,
            price: p.price,
            inventory: p.inventory,
            status: p.status,
          }))
          .slice(0, 10),
        platformBreakdown: orders.reduce((acc, order) => {
          acc[order.platform] = (acc[order.platform] || 0) + 1;
          return acc;
        }, {}),
      };

      const prompt = `You are an e-commerce analytics expert. Analyze the following sales data and provide a detailed 30-day forecast:

Historical Data:
- Total Orders (All Time): ${historicalData.totalOrders}
- Orders (Last 30 Days): ${historicalData.last30DaysOrders}
- Total Revenue (All Time): $${historicalData.totalRevenue.toFixed(2)}
- Revenue (Last 30 Days): $${historicalData.last30DaysRevenue.toFixed(2)}
- Average Order Value: $${historicalData.averageOrderValue.toFixed(2)}
- Platform Breakdown: ${JSON.stringify(historicalData.platformBreakdown)}
- Active Products: ${products.filter((p) => p.status === "published").length}
- Total Inventory Value: $${products.reduce((sum, p) => sum + (p.price || 0) * (p.inventory || 0), 0).toFixed(2)}

Provide a comprehensive forecast including:
1. Predicted revenue for the next 30 days with confidence level
2. Expected number of orders
3. Predicted best-selling products (from the top products list)
4. Recommended inventory adjustments
5. Growth opportunities and trends
6. Platform-specific recommendations
7. Key insights and actionable recommendations`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_revenue: { type: "number" },
            confidence_level: { type: "string" },
            predicted_orders: { type: "number" },
            best_selling_products: {
              type: "array",
              items: { type: "string" },
            },
            inventory_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  action: { type: "string" },
                  quantity: { type: "number" },
                },
              },
            },
            growth_opportunities: {
              type: "array",
              items: { type: "string" },
            },
            platform_recommendations: {
              type: "object",
            },
            key_insights: {
              type: "array",
              items: { type: "string" },
            },
            trend_direction: {
              type: "string",
              enum: ["up", "down", "stable"],
            },
            risk_factors: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });

      setForecast(result);
    } catch (error) {
      console.error("Forecast generation failed:", error);
      alert("Failed to generate forecast. Please try again.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold">AI Sales Forecast</h3>
          </div>
          <Button
            onClick={generateForecast}
            disabled={isGenerating || orders.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Forecast
              </>
            )}
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">
              Need order history to generate forecasts
            </p>
          </div>
        ) : !forecast ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">
              Click "Generate Forecast" to predict your next 30 days of sales
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Forecast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Predicted Revenue (30d)</p>
                  {forecast.trend_direction === "up" ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : forecast.trend_direction === "down" ? (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  ${forecast.predicted_revenue?.toFixed(2)}
                </div>
                <Badge
                  className={
                    forecast.confidence_level?.toLowerCase().includes("high")
                      ? "bg-green-500/20 text-green-400"
                      : forecast.confidence_level?.toLowerCase().includes("medium")
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-orange-500/20 text-orange-400"
                  }
                >
                  {forecast.confidence_level} Confidence
                </Badge>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/30 to-green-900/30 border-blue-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Expected Orders (30d)</p>
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {forecast.predicted_orders}
                </div>
                <p className="text-xs text-gray-400">
                  Based on historical trends
                </p>
              </Card>
            </div>

            {/* Best Selling Products */}
            <Card className="bg-gray-900 border-gray-700 p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Predicted Best Sellers
              </h4>
              <div className="flex flex-wrap gap-2">
                {forecast.best_selling_products?.map((product, idx) => (
                  <Badge key={idx} className="bg-green-500/20 text-green-400">
                    {idx + 1}. {product}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Inventory Recommendations */}
            {forecast.inventory_recommendations?.length > 0 && (
              <Card className="bg-gray-900 border-gray-700 p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-400" />
                  Inventory Recommendations
                </h4>
                <div className="space-y-3">
                  {forecast.inventory_recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{rec.product}</p>
                        <p className="text-sm text-gray-400">{rec.action}</p>
                      </div>
                      <Badge variant="outline">{rec.quantity} units</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Growth Opportunities */}
            <Card className="bg-gray-900 border-gray-700 p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Growth Opportunities
              </h4>
              <ul className="space-y-2">
                {forecast.growth_opportunities?.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-purple-400 mt-1">•</span>
                    <span className="text-gray-300">{opp}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Key Insights */}
            <Card className="bg-gray-900 border-gray-700 p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Key Insights
              </h4>
              <ul className="space-y-2">
                {forecast.key_insights?.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-400 mt-1">→</span>
                    <span className="text-gray-300">{insight}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Risk Factors */}
            {forecast.risk_factors?.length > 0 && (
              <Card className="bg-red-900/10 border-red-900/50 p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {forecast.risk_factors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-red-400 mt-1">⚠</span>
                      <span className="text-gray-300">{risk}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}