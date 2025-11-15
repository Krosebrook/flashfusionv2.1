"use client";
import { useState, useEffect } from "react";
import { User, UsageLog } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const plans = {
  Free: { name: "Free", price: 0, credits: "1,000", features: ["Basic feature access", "Community support"] },
  Creator: { name: "Creator", price: 29, credits: "50,000", features: ["All features", "Priority support", "Higher usage limits"] },
  Pro: { name: "Pro", price: 99, credits: "250,000", features: ["All features in Creator", "Dedicated support", "Custom integrations"] },
};

const PricingCard = ({ plan, currentPlan, onSelectPlan }) => (
  <div className={`p-6 rounded-lg border ${currentPlan === plan.name ? 'border-blue-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'}`}>
      <h3 className="text-xl font-semibold">{plan.name}</h3>
      <p className="mt-2 text-4xl font-bold">${plan.price}<span className="text-lg font-normal text-gray-400">/mo</span></p>
      <p className="mt-1 text-sm text-gray-400">{plan.credits} credits per month</p>
      <ul className="mt-6 space-y-3">
          {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">{feature}</span>
              </li>
          ))}
      </ul>
      <Button 
          onClick={() => onSelectPlan(plan.name)} 
          disabled={currentPlan === plan.name}
          className={`w-full mt-6 ${currentPlan === plan.name ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
          {currentPlan === plan.name ? 'Current Plan' : 'Select Plan'}
      </Button>
  </div>
);

export default function BillingPage() {
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const [currentUser, usageLogs] = await Promise.all([
              User.me(),
              UsageLog.list("-created_date", 20)
          ]);
          setUser(currentUser);
          setUsage(usageLogs);
      } catch(e) {
          console.error(e);
      }
      setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPlan = async (planName) => {
      try {
          await User.updateMyUserData({ plan: planName });
          alert("Plan updated! Note: This is a demo and not connected to a real payment gateway.")
          await fetchData(); // Refresh data
      } catch (e) {
          console.error("Failed to update plan:", e);
      }
  };
  
  if(isLoading) return <Skeleton className="w-full h-96" />;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-yellow-400" />
          <span>Billing & Plans</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage your subscription and credit usage.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(plans).map(plan => (
              <PricingCard key={plan.name} plan={plan} currentPlan={user?.plan} onSelectPlan={handleSelectPlan} />
          ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Current Usage</h2>
          <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-bold">{user?.credits_remaining?.toLocaleString()}</p>
              <p className="text-gray-400">credits remaining</p>
          </div>
          {/* A progress bar could go here */}
      </div>

      <div>
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700">
              <Table>
                  <TableHeader>
                      <TableRow className="border-gray-700">
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Credits Used</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {usage.map(log => (
                          <TableRow key={log.id} className="border-gray-700">
                              <TableCell>{format(new Date(log.created_date), 'MMM d, yyyy')}</TableCell>
                              <TableCell>{log.details || log.feature}</TableCell>
                              <TableCell className="text-right font-mono">{log.credits_used}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
      </div>

    </div>
  );
}