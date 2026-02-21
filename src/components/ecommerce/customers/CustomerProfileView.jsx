import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Tag,
  Sparkles,
  Loader2,
  AlertTriangle,
  Package,
  Mail,
  Phone,
} from "lucide-react";

const segmentColors = {
  new: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  vip: "bg-purple-500/20 text-purple-400",
  at_risk: "bg-yellow-500/20 text-yellow-400",
  churned: "bg-red-500/20 text-red-400",
};

export default function CustomerProfileView({ customerEmail, onClose }) {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    if (customerEmail) {
      fetchCustomerData();
    }
  }, [customerEmail]);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      const [profileData, ordersData] = await Promise.all([
        base44.entities.CustomerProfile.filter({ customer_email: customerEmail }),
        base44.entities.Order.filter({ customer_email: customerEmail }),
      ]);

      if (profileData.length > 0) {
        setProfile(profileData[0]);
      } else {
        // Create profile if doesn't exist
        const newProfile = await createCustomerProfile(customerEmail, ordersData);
        setProfile(newProfile);
      }
      setOrders(ordersData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
    }
    setIsLoading(false);
  };

  const createCustomerProfile = async (email, orders) => {
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const firstOrder = orders.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
    const lastOrder = orders[0];

    const platforms = [...new Set(orders.map(o => o.platform))];
    const categories = [...new Set(orders.flatMap(o => o.products?.map(p => p.product_title) || []))];

    const daysBetween = totalOrders > 1
      ? (new Date(lastOrder.created_date) - new Date(firstOrder.created_date)) / (1000 * 60 * 60 * 24) / (totalOrders - 1)
      : 0;

    const segment = totalOrders === 1 ? "new" 
      : totalSpent > 1000 ? "vip"
      : daysBetween > 90 ? "at_risk"
      : "active";

    const profileData = {
      customer_email: email,
      customer_name: firstOrder?.customer_name || email,
      phone: firstOrder?.customer_phone || "",
      total_orders: totalOrders,
      total_spent: totalSpent,
      average_order_value: avgOrderValue,
      lifetime_value: totalSpent * 1.5, // Simple LTV estimate
      first_purchase_date: firstOrder?.created_date,
      last_purchase_date: lastOrder?.created_date,
      purchase_frequency: daysBetween,
      segment,
      preferred_platforms: platforms,
      favorite_categories: categories.slice(0, 5),
    };

    const created = await base44.entities.CustomerProfile.create(profileData);
    return created;
  };

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const orderHistory = orders.map(o => ({
        date: o.created_date,
        total: o.total,
        products: o.products?.map(p => p.product_title),
        platform: o.platform,
      }));

      const prompt = `Analyze this customer profile and provide personalized insights:

Customer: ${profile.customer_name}
Total Orders: ${profile.total_orders}
Total Spent: $${profile.total_spent?.toFixed(2)}
Average Order Value: $${profile.average_order_value?.toFixed(2)}
Segment: ${profile.segment}
Purchase Frequency: Every ${profile.purchase_frequency?.toFixed(0)} days
Last Purchase: ${new Date(profile.last_purchase_date).toLocaleDateString()}

Order History:
${orderHistory.slice(0, 10).map(o => `- ${new Date(o.date).toLocaleDateString()}: $${o.total} (${o.products?.join(", ")})`).join('\n')}

Provide:
1. Buying pattern analysis (seasonal, impulse, planned purchases)
2. Next purchase prediction (date and confidence)
3. 5 personalized product recommendations with reasoning
4. Churn risk assessment (Low/Medium/High)
5. Engagement score (0-100)
6. Retention strategies specific to this customer`;

      const insights = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            buying_pattern: { type: "string" },
            next_purchase_prediction: { type: "string" },
            recommended_products: {
              type: "array",
              items: { type: "string" },
            },
            churn_risk: { type: "string" },
            engagement_score: { type: "number" },
            retention_strategies: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });

      await base44.entities.CustomerProfile.update(profile.id, {
        ai_insights: insights,
      });

      setProfile({ ...profile, ai_insights: insights });
    } catch (error) {
      console.error("Failed to generate insights:", error);
      alert("Failed to generate AI insights. Please try again.");
    }
    setIsGeneratingInsights(false);
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-400" />
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-12 text-center">
        <p className="text-gray-400">Customer not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.customer_name?.charAt(0) || "C"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.customer_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">{profile.customer_email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{profile.phone}</span>
                </div>
              )}
              <Badge className={`mt-2 ${segmentColors[profile.segment]}`}>
                {profile.segment.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Lifetime Value</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${profile.lifetime_value?.toFixed(2)}
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Orders</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{profile.total_orders}</div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Avg Order</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            ${profile.average_order_value?.toFixed(2)}
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Purchase Freq</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {profile.purchase_frequency?.toFixed(0)} days
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold">AI Insights & Recommendations</h3>
          </div>
          <Button
            onClick={generateAIInsights}
            disabled={isGeneratingInsights}
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

        {!profile.ai_insights ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">
              Click "Generate Insights" for AI-powered customer analysis
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Engagement & Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Engagement Score</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-purple-400">
                    {profile.ai_insights.engagement_score}/100
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${profile.ai_insights.engagement_score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Churn Risk</p>
                <Badge
                  className={
                    profile.ai_insights.churn_risk?.toLowerCase() === "high"
                      ? "bg-red-500/20 text-red-400 text-lg px-4 py-1"
                      : profile.ai_insights.churn_risk?.toLowerCase() === "medium"
                        ? "bg-yellow-500/20 text-yellow-400 text-lg px-4 py-1"
                        : "bg-green-500/20 text-green-400 text-lg px-4 py-1"
                  }
                >
                  {profile.ai_insights.churn_risk}
                </Badge>
              </div>
            </div>

            {/* Buying Pattern */}
            <div>
              <h4 className="font-semibold mb-3">Buying Pattern</h4>
              <p className="text-gray-300 text-sm bg-gray-900 p-4 rounded-lg border border-gray-700">
                {profile.ai_insights.buying_pattern}
              </p>
            </div>

            {/* Next Purchase Prediction */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Next Purchase Prediction
              </h4>
              <p className="text-gray-300 text-sm bg-gray-900 p-4 rounded-lg border border-gray-700">
                {profile.ai_insights.next_purchase_prediction}
              </p>
            </div>

            {/* Product Recommendations */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-green-400" />
                Personalized Product Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.ai_insights.recommended_products?.map((product, idx) => (
                  <div key={idx} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-green-500/20 text-green-400">{idx + 1}</Badge>
                      <p className="text-sm text-gray-300 flex-1">{product}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retention Strategies */}
            {profile.ai_insights.retention_strategies?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recommended Retention Strategies</h4>
                <ul className="space-y-2">
                  {profile.ai_insights.retention_strategies.map((strategy, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-purple-400 mt-1">•</span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Purchase History */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-semibold mb-6">Purchase History</h3>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{order.order_number}</span>
                      <Badge className={segmentColors[order.status] || "bg-gray-500/20 text-gray-400"}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_date).toLocaleDateString()} via {order.platform}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">
                      ${order.total?.toFixed(2)}
                    </div>
                    <Badge
                      className={
                        order.payment_status === "paid"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  {order.products?.map((product, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {product.product_title} x{product.quantity}
                      </span>
                      <span className="text-gray-500">${product.subtotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Customer Details */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-semibold mb-6">Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">First Purchase</p>
            <p className="font-medium">
              {new Date(profile.first_purchase_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Last Purchase</p>
            <p className="font-medium">
              {new Date(profile.last_purchase_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Preferred Platforms</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.preferred_platforms?.map((platform, idx) => (
                <Badge key={idx} variant="outline">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Favorite Categories</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.favorite_categories?.slice(0, 3).map((cat, idx) => (
                <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}