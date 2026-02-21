import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BulkProductEditor({ products, onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [bulkChanges, setBulkChanges] = useState({
    field: "",
    value: ""
  });

  const toggleProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const applyBulkChanges = async () => {
    if (!bulkChanges.field || selectedProducts.length === 0) {
      toast.error("Please select products and a field to update");
      return;
    }

    setUpdating(true);
    try {
      const updates = selectedProducts.map(async (productId) => {
        const product = products.find(p => p.id === productId);
        let updateData = {};

        switch (bulkChanges.field) {
          case "status":
            updateData.status = bulkChanges.value;
            break;
          case "category":
            updateData.category = bulkChanges.value;
            break;
          case "price_adjust":
            const adjustment = parseFloat(bulkChanges.value) || 0;
            updateData.price = product.price * (1 + adjustment / 100);
            break;
          case "inventory_adjust":
            const inventoryChange = parseInt(bulkChanges.value) || 0;
            updateData.inventory = Math.max(0, product.inventory + inventoryChange);
            break;
          case "reorder_point":
            updateData.reorder_point = parseInt(bulkChanges.value) || 10;
            break;
          default:
            break;
        }

        return base44.entities.EcommerceProduct.update(productId, updateData);
      });

      await Promise.all(updates);
      toast.success(`Updated ${selectedProducts.length} products`);
      setIsOpen(false);
      setSelectedProducts([]);
      setBulkChanges({ field: "", value: "" });
      onComplete?.();
    } catch (error) {
      toast.error("Failed to update products");
      console.error(error);
    }
    setUpdating(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <Edit3 className="w-4 h-4 mr-2" />
        Bulk Edit
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Edit Products</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Selection */}
            <Card className="p-4 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Select Products ({selectedProducts.length}/{products.length})</h3>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedProducts.length === products.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {products.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{product.title}</div>
                      <div className="text-xs text-gray-400">
                        ${product.price} • Stock: {product.inventory} • {product.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Bulk Changes */}
            <Card className="p-4 bg-gray-800 border-gray-700">
              <h3 className="font-semibold mb-4">Apply Changes</h3>

              <div className="space-y-4">
                <div>
                  <Label>Field to Update</Label>
                  <Select value={bulkChanges.field} onValueChange={(value) => setBulkChanges({ ...bulkChanges, field: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="price_adjust">Price Adjustment (%)</SelectItem>
                      <SelectItem value="inventory_adjust">Inventory Adjustment (±)</SelectItem>
                      <SelectItem value="reorder_point">Reorder Point</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bulkChanges.field === "status" && (
                  <div>
                    <Label>New Status</Label>
                    <Select value={bulkChanges.value} onValueChange={(value) => setBulkChanges({ ...bulkChanges, value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bulkChanges.field === "category" && (
                  <div>
                    <Label>New Category</Label>
                    <Input
                      value={bulkChanges.value}
                      onChange={(e) => setBulkChanges({ ...bulkChanges, value: e.target.value })}
                      placeholder="Enter category"
                    />
                  </div>
                )}

                {bulkChanges.field === "price_adjust" && (
                  <div>
                    <Label>Price Adjustment (%)</Label>
                    <Input
                      type="number"
                      value={bulkChanges.value}
                      onChange={(e) => setBulkChanges({ ...bulkChanges, value: e.target.value })}
                      placeholder="e.g., 10 for +10%, -15 for -15%"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Positive for increase, negative for decrease
                    </p>
                  </div>
                )}

                {bulkChanges.field === "inventory_adjust" && (
                  <div>
                    <Label>Inventory Adjustment</Label>
                    <Input
                      type="number"
                      value={bulkChanges.value}
                      onChange={(e) => setBulkChanges({ ...bulkChanges, value: e.target.value })}
                      placeholder="e.g., 50 to add 50, -20 to remove 20"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Positive to add, negative to remove
                    </p>
                  </div>
                )}

                {bulkChanges.field === "reorder_point" && (
                  <div>
                    <Label>Reorder Point</Label>
                    <Input
                      type="number"
                      value={bulkChanges.value}
                      onChange={(e) => setBulkChanges({ ...bulkChanges, value: e.target.value })}
                      placeholder="Minimum stock before alert"
                    />
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={applyBulkChanges}
                disabled={updating || !bulkChanges.field || selectedProducts.length === 0}
                className="flex-1"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  `Update ${selectedProducts.length} Products`
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}