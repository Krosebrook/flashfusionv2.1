import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";

export default function InventoryManager({ product, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [inventoryData, setInventoryData] = useState({
    inventory: product.inventory || 0,
    reorder_point: product.reorder_point || 10,
    reorder_quantity: product.reorder_quantity || 50,
    warehouse_location: product.warehouse_location || "",
    supplier: product.supplier || "",
  });

  const isLowStock = inventoryData.inventory <= inventoryData.reorder_point;
  const isOutOfStock = inventoryData.inventory === 0;

  const handleAdjustment = async (type) => {
    const qty = parseInt(adjustmentQty);
    if (!qty || qty <= 0) return;

    const newInventory =
      type === "add"
        ? inventoryData.inventory + qty
        : Math.max(0, inventoryData.inventory - qty);

    setIsUpdating(true);
    try {
      const updated = {
        ...product,
        inventory: newInventory,
        last_restocked:
          type === "add" ? new Date().toISOString() : product.last_restocked,
        status: newInventory === 0 ? "out_of_stock" : product.status,
      };

      await base44.entities.EcommerceProduct.update(product.id, updated);
      setInventoryData({ ...inventoryData, inventory: newInventory });
      setAdjustmentQty("");
      onUpdate?.(updated);
    } catch (error) {
      console.error("Inventory update failed:", error);
      alert("Failed to update inventory. Please try again.");
    }
    setIsUpdating(false);
  };

  const handleReorder = async () => {
    await handleAdjustment("add", inventoryData.reorder_quantity);
  };

  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    try {
      const updated = {
        ...product,
        ...inventoryData,
      };

      await base44.entities.EcommerceProduct.update(product.id, updated);
      onUpdate?.(updated);
    } catch (error) {
      console.error("Settings update failed:", error);
      alert("Failed to update settings. Please try again.");
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-semibold">Inventory Management</h3>
        </div>

        {/* Current Stock Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className={`p-4 ${isOutOfStock ? "bg-red-900/20 border-red-700" : isLowStock ? "bg-yellow-900/20 border-yellow-700" : "bg-green-900/20 border-green-700"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Stock</p>
                <p className="text-3xl font-bold">{inventoryData.inventory}</p>
              </div>
              {isOutOfStock ? (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              ) : isLowStock ? (
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              )}
            </div>
            <Badge
              className={`mt-2 ${
                isOutOfStock
                  ? "bg-red-500/20 text-red-400"
                  : isLowStock
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : isLowStock
                  ? "Low Stock"
                  : "In Stock"}
            </Badge>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-4">
            <div>
              <p className="text-sm text-gray-400">Reorder Point</p>
              <p className="text-2xl font-bold text-orange-400">
                {inventoryData.reorder_point}
              </p>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-4">
            <div>
              <p className="text-sm text-gray-400">Reorder Quantity</p>
              <p className="text-2xl font-bold text-purple-400">
                {inventoryData.reorder_quantity}
              </p>
            </div>
          </Card>
        </div>

        {/* Stock Adjustment */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold">Quick Stock Adjustment</h4>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Quantity"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(e.target.value)}
              className="bg-gray-900 border-gray-600"
            />
            <Button
              onClick={() => handleAdjustment("add")}
              disabled={isUpdating || !adjustmentQty}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
            <Button
              onClick={() => handleAdjustment("remove")}
              disabled={isUpdating || !adjustmentQty}
              variant="outline"
            >
              <Minus className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>

        {isLowStock && (
          <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded-lg mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-yellow-400 mb-1">
                  ⚠️ Low Stock Alert
                </p>
                <p className="text-sm text-gray-300">
                  Stock level is below reorder point. Consider restocking soon.
                </p>
              </div>
              <Button
                onClick={handleReorder}
                disabled={isUpdating}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Reorder Now
              </Button>
            </div>
          </div>
        )}

        {/* Inventory Settings */}
        <div className="border-t border-gray-700 pt-6 space-y-4">
          <h4 className="font-semibold">Inventory Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Reorder Point
              </label>
              <Input
                type="number"
                value={inventoryData.reorder_point}
                onChange={(e) =>
                  setInventoryData({
                    ...inventoryData,
                    reorder_point: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-gray-900 border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Reorder Quantity
              </label>
              <Input
                type="number"
                value={inventoryData.reorder_quantity}
                onChange={(e) =>
                  setInventoryData({
                    ...inventoryData,
                    reorder_quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-gray-900 border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Warehouse Location
              </label>
              <Input
                value={inventoryData.warehouse_location}
                onChange={(e) =>
                  setInventoryData({
                    ...inventoryData,
                    warehouse_location: e.target.value,
                  })
                }
                placeholder="e.g., Warehouse A, Shelf 3"
                className="bg-gray-900 border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Supplier</label>
              <Input
                value={inventoryData.supplier}
                onChange={(e) =>
                  setInventoryData({
                    ...inventoryData,
                    supplier: e.target.value,
                  })
                }
                placeholder="e.g., ABC Suppliers Inc."
                className="bg-gray-900 border-gray-600"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdateSettings}
            disabled={isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? "Updating..." : "Update Inventory Settings"}
          </Button>
        </div>
      </Card>

      {product.last_restocked && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Restocked</span>
            <span className="font-medium">
              {new Date(product.last_restocked).toLocaleDateString()}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
