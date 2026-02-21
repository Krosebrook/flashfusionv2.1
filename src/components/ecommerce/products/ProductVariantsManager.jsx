import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ProductVariantsManager({ product, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [variants, setVariants] = useState(product.variants || []);
  const [variantOptions, setVariantOptions] = useState(product.variant_options || {
    sizes: [],
    colors: [],
    materials: []
  });
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [editingVariant, setEditingVariant] = useState(null);

  const addVariantOption = (type, value) => {
    if (!value.trim()) return;
    setVariantOptions(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), value.trim()]
    }));
    if (type === 'sizes') setNewSize("");
    if (type === 'colors') setNewColor("");
  };

  const removeVariantOption = (type, value) => {
    setVariantOptions(prev => ({
      ...prev,
      [type]: prev[type].filter(v => v !== value)
    }));
  };

  const generateVariants = () => {
    const sizes = variantOptions.sizes || [];
    const colors = variantOptions.colors || [];
    
    if (sizes.length === 0 && colors.length === 0) return;

    const newVariants = [];
    
    if (sizes.length > 0 && colors.length > 0) {
      sizes.forEach(size => {
        colors.forEach(color => {
          newVariants.push({
            id: `${size}-${color}-${Date.now()}`,
            sku: `${product.sku || 'SKU'}-${size}-${color}`,
            name: `${product.title} - ${size} / ${color}`,
            options: { size, color },
            price: product.price,
            inventory: 0,
            is_active: true
          });
        });
      });
    } else if (sizes.length > 0) {
      sizes.forEach(size => {
        newVariants.push({
          id: `${size}-${Date.now()}`,
          sku: `${product.sku || 'SKU'}-${size}`,
          name: `${product.title} - ${size}`,
          options: { size },
          price: product.price,
          inventory: 0,
          is_active: true
        });
      });
    } else if (colors.length > 0) {
      colors.forEach(color => {
        newVariants.push({
          id: `${color}-${Date.now()}`,
          sku: `${product.sku || 'SKU'}-${color}`,
          name: `${product.title} - ${color}`,
          options: { color },
          price: product.price,
          inventory: 0,
          is_active: true
        });
      });
    }

    setVariants(newVariants);
  };

  const updateVariant = (variantId, updates) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId ? { ...v, ...updates } : v
    ));
  };

  const deleteVariant = (variantId) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const saveVariants = async () => {
    await onUpdate({
      ...product,
      has_variants: variants.length > 0,
      variants,
      variant_options: variantOptions
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Manage Variants ({variants.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Product Variants</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Variant Options Setup */}
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-4">Variant Options</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Sizes</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="e.g., Small, Medium, Large"
                    onKeyPress={(e) => e.key === 'Enter' && addVariantOption('sizes', newSize)}
                  />
                  <Button onClick={() => addVariantOption('sizes', newSize)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.sizes?.map(size => (
                    <Badge key={size} className="bg-blue-500/20 text-blue-400">
                      {size}
                      <button onClick={() => removeVariantOption('sizes', size)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Colors</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="e.g., Red, Blue, Green"
                    onKeyPress={(e) => e.key === 'Enter' && addVariantOption('colors', newColor)}
                  />
                  <Button onClick={() => addVariantOption('colors', newColor)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.colors?.map(color => (
                    <Badge key={color} className="bg-purple-500/20 text-purple-400">
                      {color}
                      <button onClick={() => removeVariantOption('colors', color)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={generateVariants} className="w-full">
                Generate Variants
              </Button>
            </div>
          </Card>

          {/* Variants List */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Generated Variants ({variants.length})</h3>
              {variants.map(variant => (
                <Card key={variant.id} className="p-4 bg-gray-800 border-gray-700">
                  {editingVariant === variant.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(variant.id, { sku: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, { price: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Inventory</Label>
                          <Input
                            type="number"
                            value={variant.inventory}
                            onChange={(e) => updateVariant(variant.id, { inventory: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setEditingVariant(null)}>
                          <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingVariant(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-sm text-gray-400 space-x-3 mt-1">
                          <span>SKU: {variant.sku}</span>
                          <span>Price: ${variant.price}</span>
                          <span>Stock: {variant.inventory}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingVariant(variant.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteVariant(variant.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={saveVariants} className="flex-1">Save All Variants</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}