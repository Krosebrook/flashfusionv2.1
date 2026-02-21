import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Mail, CheckCircle2, Clock, DollarSign } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  email_sent: "bg-blue-500/20 text-blue-400",
  recovered: "bg-green-500/20 text-green-400",
  expired: "bg-gray-500/20 text-gray-400",
};

export default function AbandonedCartManager() {
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.AbandonedCart.list("-created_date");
      setCarts(data);
    } catch (error) {
      console.error("Failed to fetch abandoned carts:", error);
    }
    setIsLoading(false);
  };

  const sendRecoveryEmail = async (cart) => {
    try {
      const response = await base44.functions.invoke("sendAbandonedCartEmail", {
        cartId: cart.id,
      });

      if (response.success) {
        fetchCarts();
        alert("Recovery email sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send recovery email:", error);
      alert("Failed to send recovery email. Please try again.");
    }
  };

  const stats = {
    total: carts.length,
    pending: carts.filter(c => c.recovery_status === "pending").length,
    recovered: carts.filter(c => c.recovery_status === "recovered").length,
    totalValue: carts.reduce((sum, c) => sum + (c.total_value || 0), 0),
    recoveredValue: carts
      .filter(c => c.recovery_status === "recovered")
      .reduce((sum, c) => sum + (c.total_value || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Abandoned Carts</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.pending}</div>
          <div className="text-sm text-gray-400">Pending Recovery</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">{stats.recovered}</div>
          <div className="text-sm text-gray-400">Recovered</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-orange-400">
            ${stats.totalValue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total Value</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">
            ${stats.recoveredValue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Recovered Value</div>
        </Card>
      </div>

      <div className="space-y-4">
        {carts.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No abandoned carts</h3>
            <p className="text-gray-400">Great! All customers completed their purchases</p>
          </Card>
        ) : (
          carts.map((cart) => (
            <Card key={cart.id} className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{cart.customer_name || cart.customer_email}</h3>
                    <Badge className={statusColors[cart.recovery_status]}>
                      {cart.recovery_status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{cart.customer_email}</p>
                  <p className="text-xs text-gray-500">
                    Abandoned {new Date(cart.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    ${cart.total_value?.toFixed(2)}
                  </div>
                  {cart.emails_sent > 0 && (
                    <p className="text-xs text-gray-400">{cart.emails_sent} email(s) sent</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">Cart Items:</p>
                <div className="space-y-2">
                  {cart.products?.map((product, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {product.product_title} x{product.quantity}
                      </span>
                      <span className="text-gray-400">${product.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {cart.recovery_status === "pending" && (
                <Button
                  onClick={() => sendRecoveryEmail(cart)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Recovery Email
                </Button>
              )}

              {cart.recovery_status === "recovered" && cart.recovery_order_id && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Recovered on {new Date(cart.recovered_date).toLocaleDateString()}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}