import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CartManager() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const user = await base44.auth.me();
      const items = await base44.entities.ShoppingCart.filter({ user_email: user.email });
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    await base44.entities.ShoppingCart.update(item.id, { quantity: newQuantity });
    fetchCartItems();
  };

  const removeItem = async (itemId) => {
    await base44.entities.ShoppingCart.delete(itemId);
    fetchCartItems();
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === "save10") {
      setDiscount(0.1);
    } else if (promoCode.toLowerCase() === "first20") {
      setDiscount(0.2);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * discount;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shipping + tax;

  if (loading) {
    return <div className="p-8 text-center">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items from your AI Stylist recommendations</p>
        <Button onClick={() => navigate(createPageUrl("StyleProfile"))} className="bg-blue-600 hover:bg-blue-700">
          Browse Style Recommendations
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Shopping Cart ({cartItems.length})</h2>
          
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">👕</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-sm md:text-base truncate">{item.product_name}</h3>
                      {item.variant && (
                        <p className="text-xs text-gray-500">{item.variant}</p>
                      )}
                      {item.source && (
                        <div className="flex items-center gap-1 mt-1">
                          <Tag className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-600">From {item.source.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            
            {/* Promo Code */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Promo Code</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={applyPromo} variant="outline" size="sm">Apply</Button>
              </div>
              {discount > 0 && (
                <p className="text-xs text-green-600 mt-2">✓ {(discount * 100)}% discount applied!</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({(discount * 100)}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate(createPageUrl("Checkout"))}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Free shipping on orders over $50
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}