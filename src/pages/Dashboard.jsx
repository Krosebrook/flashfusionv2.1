"use client";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
    lowStock: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [currentUser, products, orders, customers] = await Promise.all([
        base44.auth.me(),
        base44.entities.EcommerceProduct.list(),
        base44.entities.Order.list("-created_date", 5),
        base44.entities.CustomerProfile.list(),
      ]);

      setUser(currentUser);
      setRecentOrders(orders);

      const revenue = orders
        .filter((o) => o.payment_status === "paid")
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const lowStock = products.filter(
        (p) => p.inventory < (p.reorder_point || 10)
      ).length;

      const pendingOrders = orders.filter((o) => o.status === "pending").length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        revenue,
        lowStock,
        pendingOrders,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-gray-400">Here's what's happening with your store today</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Revenue</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${stats.revenue.toFixed(2)}
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Orders</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {stats.totalOrders}
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Products</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {stats.totalProducts}
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Customers</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {stats.totalCustomers}
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.lowStock > 0 || stats.pendingOrders > 0) && (
        <div className="space-y-3">
          {stats.pendingOrders > 0 && (
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-400">
                    {stats.pendingOrders} pending orders
                  </p>
                  <p className="text-sm text-gray-400">
                    Review and process new orders
                  </p>
                </div>
                <Link to={createPageUrl("EcommerceSuite")}>
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    View Orders
                  </Button>
                </Link>
              </div>
            </Card>
          )}
          {stats.lowStock > 0 && (
            <Card className="bg-red-900/20 border-red-500/30 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="flex-1">
                  <p className="font-medium text-red-400">
                    {stats.lowStock} products low on stock
                  </p>
                  <p className="text-sm text-gray-400">
                    Restock items to avoid running out
                  </p>
                </div>
                <Link to={createPageUrl("EcommerceSuite")}>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Manage Inventory
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={createPageUrl("EcommerceSuite")}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-900/40 to-blue-900/40 border border-green-500/30 p-6 rounded-lg group cursor-pointer"
            >
              <ShoppingCart className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="font-semibold text-lg mb-1">Add Product</h3>
              <p className="text-sm text-gray-400">
                Add new products to your store
              </p>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all mt-3" />
            </motion.div>
          </Link>

          <Link to={createPageUrl("EcommerceSuite")}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-6 rounded-lg group cursor-pointer"
            >
              <Sparkles className="w-10 h-10 text-purple-400 mb-3" />
              <h3 className="font-semibold text-lg mb-1">Marketing Campaign</h3>
              <p className="text-sm text-gray-400">
                Create email or social campaigns
              </p>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all mt-3" />
            </motion.div>
          </Link>

          <Link to={createPageUrl("EcommerceSuite")}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-900/40 to-teal-900/40 border border-blue-500/30 p-6 rounded-lg group cursor-pointer"
            >
              <TrendingUp className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="font-semibold text-lg mb-1">View Analytics</h3>
              <p className="text-sm text-gray-400">
                Track sales and performance
              </p>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all mt-3" />
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link to={createPageUrl("EcommerceSuite")}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <Card className="bg-gray-800 border-gray-700 p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between pb-4 border-b border-gray-700 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{order.order_number}</span>
                      <Badge
                        className={
                          order.status === "delivered"
                            ? "bg-green-500/20 text-green-400"
                            : order.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {order.customer_name} • {new Date(order.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
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
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}