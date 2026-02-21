import CartManager from "../components/ecommerce/cart/CartManager";
import { ShoppingCart } from "lucide-react";

export default function ShoppingCartPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
          </div>
        </div>
      </div>
      <CartManager />
    </div>
  );
}