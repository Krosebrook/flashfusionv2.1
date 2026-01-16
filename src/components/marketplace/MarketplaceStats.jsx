import React from "react";
import { Card } from "@/components/ui/card";
import { Store, Star, Download } from "lucide-react";

// Extracted stats component for better reusability and testing
export default function MarketplaceStats({ stats }) {
  const statItems = [
    {
      label: "Total Templates",
      value: stats.total,
      icon: Store,
      color: "purple"
    },
    {
      label: "Featured",
      value: stats.featured,
      icon: Star,
      color: "yellow"
    },
    {
      label: "Total Installs",
      value: stats.totalInstalls,
      icon: Download,
      color: "green"
    }
  ];

  const colorClasses = {
    purple: "text-purple-400",
    yellow: "text-yellow-400",
    green: "text-green-400"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${colorClasses[color]}`}>
                {value}
              </p>
            </div>
            <Icon className={`w-8 h-8 ${colorClasses[color]} opacity-50`} />
          </div>
        </Card>
      ))}
    </div>
  );
}