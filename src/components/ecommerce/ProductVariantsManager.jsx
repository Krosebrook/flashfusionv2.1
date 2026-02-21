"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, Save, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProductVariantsManager({ product, onUpdate }) {
  const [variants, setVariants] = useState(product.variants || []);
  const [saving, setSaving] = useState(false);

  const addVariant = () => {
    const newVariant = {
      id: `var_${Date.now()}`,
      name: "",
      sku: "",
      price: product.price || 0,
      inventory: 0,
      options: {
        size: "",
        color: "",
      },
      image: "",
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id, field, value) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const updateVariantOption = (id, option, value) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, options: { ...v.options, [option]: value } } : v
      )
    );
  };

  const saveVariants = async () => {
    setSaving(true);
    try {
      await base44.entities.EcommerceProduct.update(product.id, {
        has_variants: variants.length > 0,
        variants: variants,
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to save variants:", error);
    }
    setSaving(false);
  };

  const totalInventory = variants.reduce((sum, v) => sum + (v.inventory || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Product Variants</h3>
          <p className="text-sm text-gray-400">
            Manage size, color, and other options
          </p>
        </div>
        <Button size="sm" onClick={addVariant}>
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700 p-6 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">
            No variants yet. Add variants if this product comes in different
            sizes, colors, or styles.
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <Card key={variant.id} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-blue-500/20 text-blue-400">
                    Variant {index + 1}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeVariant(variant.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Variant Name
                    </label>
                    <Input
                      placeholder="e.g., Red - Large"
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(variant.id, "name", e.target.value)
                      }
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">SKU</label>
                    <Input
                      placeholder="SKU-001"
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(variant.id, "sku", e.target.value)
                      }
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Size
                    </label>
                    <Input
                      placeholder="S, M, L, XL"
                      value={variant.options?.size || ""}
                      onChange={(e) =>
                        updateVariantOption(variant.id, "size", e.target.value)
                      }
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Color
                    </label>
                    <Input
                      placeholder="Red, Blue, etc."
                      value={variant.options?.color || ""}
                      onChange={(e) =>
                        updateVariantOption(variant.id, "color", e.target.value)
                      }
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(
                          variant.id,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Inventory
                    </label>
                    <Input
                      type="number"
                      value={variant.inventory}
                      onChange={(e) =>
                        updateVariant(
                          variant.id,
                          "inventory",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Total Inventory: <span className="text-white font-semibold">{totalInventory}</span> units
              across {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </div>
            <Button
              onClick={saveVariants}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Variants"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}