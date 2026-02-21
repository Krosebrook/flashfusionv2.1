import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Package, TrendingDown, RefreshCw, Save, Bell } from "lucide-react";
import { toast } from "sonner";

export default function InventoryAlertsManager({ products, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [reorderSettings, setReorderSettings] = useState({});

  useEffect(() => {
    if (isOpen) {
      analyzeLowStock();
    }
  }, [isOpen, products]);

  const analyzeLowStock = () => {
    const lowStock = products.filter(p => {
      if (p.has_variants && p.variants) {
        return p.variants.some(v => v.inventory < (p.reorder_point || 10));
      }
      return p.inventory < (p.reorder_point || 10);
    });
    setLowStockProducts(lowStock);
  };

  const updateReorderSettings = (productId, settings) => {
    setReorderSettings(prev => ({
      ...prev,
      [productId]: settings
    }));
  };

  const saveReorderSettings = async (product) => {
    try {
      const settings = reorderSettings[product.id] || {};
      await base44.entities.EcommerceProduct.update(product.id, {
        reorder_point: settings.reorder_point || product.reorder_point,
        reorder_quantity: settings.reorder_quantity || product.reorder_quantity
      });
      toast.success("Settings saved");
      setEditingProduct(null);
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const restockProduct = async (product) => {
    try {
      const reorderQty = product.reorder_quantity || 50;
      await base44.entities.EcommerceProduct.update(product.id, {
        inventory: product.inventory + reorderQty,
        last_restocked: new Date().toISOString().split('T')[0],
        low_stock_alert_sent: false
      });
      toast.success(`Restocked ${product.title} (+${reorderQty} units)`);
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to restock");
    }
  };

  const getStockLevel = (product) => {
    const reorderPoint = product.reorder_point || 10;
    if (product.has_variants && product.variants) {
      const totalInventory = product.variants.reduce((sum, v) => sum + (v.inventory || 0), 0);
      const percentage = (totalInventory / (reorderPoint * 3)) * 100;
      return { total: totalInventory, percentage, isCritical: totalInventory < reorderPoint };
    }
    const percentage = (product.inventory / (reorderPoint * 3)) * 100;
    return { total: product.inventory, percentage, isCritical: product.inventory < reorderPoint };
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={lowStockProducts.length > 0 ? "border-red-500 text-red-400" : ""}
      >
        <AlertTriangle className={`w-4 h-4 mr-2 ${lowStockProducts.length > 0 ? 'text-red-400' : ''}`} />
        Low Stock Alerts ({lowStockProducts.length})
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Alerts & Management</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-red-900/20 border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-gray-400">Critical</span>
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {lowStockProducts.filter(p => getStockLevel(p).isCritical).length}
                </div>
              </Card>

              <Card className="p-4 bg-yellow-900/20 border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">Low Stock</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {lowStockProducts.length}
                </div>
              </Card>

              <Card className="p-4 bg-blue-900/20 border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Total Products</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {products.length}
                </div>
              </Card>
            </div>

            {/* Low Stock Products */}
            {lowStockProducts.length === 0 ? (
              <Card className="p-8 bg-gray-800 border-gray-700 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">All products have sufficient stock</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map(product => {
                  const stockLevel = getStockLevel(product);
                  const settings = reorderSettings[product.id] || {
                    reorder_point: product.reorder_point || 10,
                    reorder_quantity: product.reorder_quantity || 50
                  };

                  return (
                    <Card key={product.id} className={`p-4 ${stockLevel.isCritical ? 'bg-red-900/10 border-red-500/30' : 'bg-gray-800 border-gray-700'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{product.title}</h3>
                            {stockLevel.isCritical && (
                              <Badge className="bg-red-500/20 text-red-400">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Critical
                              </Badge>
                            )}
                          </div>
                          
                          {product.has_variants && product.variants ? (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-400">
                                Total Stock: {stockLevel.total} units
                              </div>
                              {product.variants.filter(v => v.inventory < (product.reorder_point || 10)).map(variant => (
                                <div key={variant.id} className="text-sm text-red-400">
                                  {variant.name}: {variant.inventory} units
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">
                              Current Stock: {product.inventory} units
                            </div>
                          )}

                          <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${stockLevel.isCritical ? 'bg-red-500' : 'bg-yellow-500'}`}
                              style={{ width: `${Math.min(stockLevel.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {editingProduct === product.id ? (
                        <div className="space-y-3 mt-3 p-3 bg-gray-700 rounded-lg">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-400">Reorder Point</label>
                              <Input
                                type="number"
                                value={settings.reorder_point}
                                onChange={(e) => updateReorderSettings(product.id, {
                                  ...settings,
                                  reorder_point: parseInt(e.target.value)
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Reorder Quantity</label>
                              <Input
                                type="number"
                                value={settings.reorder_quantity}
                                onChange={(e) => updateReorderSettings(product.id, {
                                  ...settings,
                                  reorder_quantity: parseInt(e.target.value)
                                })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveReorderSettings(product)}>
                              <Save className="w-4 h-4 mr-2" />
                              Save Settings
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => restockProduct(product)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Restock (+{product.reorder_quantity || 50})
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingProduct(product.id)}>
                            <Bell className="w-4 h-4 mr-2" />
                            Alert Settings
                          </Button>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Reorder at: {product.reorder_point || 10} units • 
                        Reorder qty: {product.reorder_quantity || 50} units
                        {product.last_restocked && ` • Last restocked: ${product.last_restocked}`}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}