import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

const statusConfig = {
  pending: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  processing: { color: "bg-blue-500/20 text-blue-400", icon: Package },
  shipped: { color: "bg-purple-500/20 text-purple-400", icon: Truck },
  delivered: { color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  cancelled: { color: "bg-red-500/20 text-red-400", icon: XCircle },
  refunded: { color: "bg-orange-500/20 text-orange-400", icon: DollarSign },
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Order.list("-created_date");
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await base44.entities.Order.update(orderId, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Orders</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-gray-400">Pending</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.processing}</div>
          <div className="text-sm text-gray-400">Processing</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.shipped}</div>
          <div className="text-sm text-gray-400">Shipped</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">{stats.delivered}</div>
          <div className="text-sm text-gray-400">Delivered</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Revenue</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by order #, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <p className="text-gray-400">Loading orders...</p>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No orders found</p>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status]?.icon || Clock;
            
            return (
              <Card key={order.id} className="bg-gray-800 border-gray-700 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">#{order.order_number}</h3>
                        <Badge className={statusConfig[order.status]?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {order.customer_name || order.customer_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_date).toLocaleDateString()} at{" "}
                        {new Date(order.created_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      ${order.total?.toFixed(2)}
                    </div>
                    <Badge
                      className={
                        order.payment_status === "paid"
                          ? "bg-green-500/20 text-green-400"
                          : order.payment_status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>

                {/* Products */}
                <div className="border-t border-gray-700 pt-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Products:</p>
                  <div className="space-y-2">
                    {order.products?.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <div>
                          <span className="text-gray-300">{product.product_title}</span>
                          <span className="text-gray-500 ml-2">x{product.quantity}</span>
                        </div>
                        <span className="text-gray-400">
                          ${product.subtotal?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                {order.tracking_number && (
                  <div className="border-t border-gray-700 pt-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">
                          Tracking: {order.tracking_number}
                        </span>
                      </div>
                      {order.carrier && (
                        <Badge variant="outline" className="text-xs">
                          {order.carrier}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 border-t border-gray-700 pt-4">
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, "processing")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Mark Processing
                    </Button>
                  )}
                  {order.status === "processing" && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, "shipped")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === "shipped" && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, "delivered")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Delivered
                    </Button>
                  )}
                  {order.platform_order_id && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <ExternalLink className="w-3 h-3" />
                      View on {order.platform}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}