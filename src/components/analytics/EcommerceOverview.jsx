import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, Package, TrendingUp, ShoppingCart } from "lucide-react";

export default function EcommerceOverview({ products }) {
  const totalProducts = products.length;
  const publishedProducts = products.filter(
    (p) => p.status === "published"
  ).length;
  const lowStockProducts = products.filter(
    (p) => p.inventory !== undefined && p.inventory <= (p.reorder_point || 10)
  ).length;
  const outOfStockProducts = products.filter(
    (p) => p.inventory !== undefined && p.inventory === 0
  ).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  const categoryBreakdown = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { category, count: 0, revenue: 0 };
    }
    acc[category].count += 1;
    acc[category].revenue += product.price || 0;
    return acc;
  }, {});

  const chartData = Object.values(categoryBreakdown).slice(0, 8);

  const topProducts = [...products]
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 5);

  const platformStats = products.reduce((acc, product) => {
    (product.platforms || []).forEach((platform) => {
      acc[platform] = (acc[platform] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-blue-400">
                {totalProducts}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Published</p>
              <p className="text-2xl font-bold text-green-400">
                {publishedProducts}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card
          className={`border-gray-700 p-4 ${lowStockProducts > 0 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-gray-800"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-400">
                {lowStockProducts}
              </p>
            </div>
            <Package className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card
          className={`border-gray-700 p-4 ${outOfStockProducts > 0 ? "bg-red-500/10 border-red-500/30" : "bg-gray-800"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">
                {outOfStockProducts}
              </p>
            </div>
            <Package className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Price</p>
              <p className="text-2xl font-bold text-purple-400">
                ${avgPrice.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Products by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="Products" />
            <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products by Value</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    ${product.price}
                  </div>
                  <Badge
                    className={
                      product.status === "published"
                        ? "bg-green-500/20 text-green-400 text-xs"
                        : "bg-yellow-500/20 text-yellow-400 text-xs"
                    }
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          <div className="space-y-3">
            {Object.entries(platformStats).map(([platform, count], index) => (
              <div key={platform} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{platform}</span>
                  <span className="text-gray-400">{count} products</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(count / totalProducts) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
