"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, DollarSign, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BulkProductEditor({ products, onUpdate }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkChanges, setBulkChanges] = useState({
    price: "",
    status: "",
    category: "",
    inventory: "",
    reorder_point: "",
  });

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const applyBulkChanges = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (bulkChanges.price) updates.price = parseFloat(bulkChanges.price);
      if (bulkChanges.status) updates.status = bulkChanges.status;
      if (bulkChanges.category) updates.category = bulkChanges.category;
      if (bulkChanges.inventory)
        updates.inventory = parseInt(bulkChanges.inventory);
      if (bulkChanges.reorder_point)
        updates.reorder_point = parseInt(bulkChanges.reorder_point);

      await Promise.all(
        selectedProducts.map((productId) =>
          base44.entities.EcommerceProduct.update(productId, updates)
        )
      );

      setEditing(false);
      setSelectedProducts([]);
      setBulkChanges({
        price: "",
        status: "",
        category: "",
        inventory: "",
        reorder_point: "",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to apply bulk changes:", error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Bulk Product Editor</h3>
          <p className="text-sm text-gray-400">
            Select products to edit multiple at once
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <>
              {!editing ? (
                <Button size="sm" onClick={() => setEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit {selectedProducts.length} Selected
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyBulkChanges}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Apply Changes"}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {editing && (
        <Card className="bg-gray-800 border-gray-700 p-4 space-y-3">
          <h4 className="font-semibold text-sm">
            Apply changes to {selectedProducts.length} product
            {selectedProducts.length !== 1 ? "s" : ""}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Set Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Leave empty to skip"
                value={bulkChanges.price}
                onChange={(e) =>
                  setBulkChanges({ ...bulkChanges, price: e.target.value })
                }
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Set Status
              </label>
              <select
                value={bulkChanges.status}
                onChange={(e) =>
                  setBulkChanges({ ...bulkChanges, status: e.target.value })
                }
                className="w-full h-9 px-3 rounded-md bg-gray-900 border border-gray-700 text-white text-sm"
              >
                <option value="">Don't change</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Set Category
              </label>
              <Input
                placeholder="Leave empty to skip"
                value={bulkChanges.category}
                onChange={(e) =>
                  setBulkChanges({ ...bulkChanges, category: e.target.value })
                }
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Set Inventory
              </label>
              <Input
                type="number"
                placeholder="Leave empty to skip"
                value={bulkChanges.inventory}
                onChange={(e) =>
                  setBulkChanges({ ...bulkChanges, inventory: e.target.value })
                }
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">
                Set Reorder Point
              </label>
              <Input
                type="number"
                placeholder="Leave empty to skip"
                value={bulkChanges.reorder_point}
                onChange={(e) =>
                  setBulkChanges({
                    ...bulkChanges,
                    reorder_point: e.target.value,
                  })
                }
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
          <Checkbox
            checked={selectedProducts.length === products.length}
            onCheckedChange={toggleAll}
          />
          <span className="text-sm font-medium">
            Select All ({selectedProducts.length} of {products.length})
          </span>
        </div>

        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <Checkbox
              checked={selectedProducts.includes(product.id)}
              onCheckedChange={() => toggleProduct(product.id)}
            />
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">{product.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  ${product.price}
                </Badge>
                <Badge
                  className={
                    product.status === "published"
                      ? "bg-green-500/20 text-green-400 text-xs"
                      : "bg-yellow-500/20 text-yellow-400 text-xs"
                  }
                >
                  {product.status}
                </Badge>
                {product.inventory !== undefined && (
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                    {product.inventory} in stock
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}