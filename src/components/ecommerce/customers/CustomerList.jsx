import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Eye } from "lucide-react";
import CustomerProfileView from "./CustomerProfileView";

const segmentColors = {
  new: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  vip: "bg-purple-500/20 text-purple-400",
  at_risk: "bg-yellow-500/20 text-yellow-400",
  churned: "bg-red-500/20 text-red-400",
};

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.CustomerProfile.list("-total_spent");
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
    setIsLoading(false);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter;
    
    return matchesSearch && matchesSegment;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.segment === "vip").length,
    atRisk: customers.filter(c => c.segment === "at_risk").length,
    totalLTV: customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
  };

  if (selectedCustomer) {
    return (
      <CustomerProfileView
        customerEmail={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Customers</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.vip}</div>
          <div className="text-sm text-gray-400">VIP Customers</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.atRisk}</div>
          <div className="text-sm text-gray-400">At Risk</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">
            ${stats.totalLTV.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total LTV</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <p className="text-gray-400">Loading customers...</p>
          </Card>
        ) : filteredCustomers.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No customers found</p>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {customer.customer_name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{customer.customer_name}</h3>
                    <p className="text-sm text-gray-400">{customer.customer_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={segmentColors[customer.segment]}>
                        {customer.segment}
                      </Badge>
                      {customer.ai_insights?.churn_risk?.toLowerCase() === "high" && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          High Churn Risk
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-gray-400">LTV</div>
                    <div className="text-xl font-bold text-green-400">
                      ${customer.lifetime_value?.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-gray-400">Orders</div>
                    <div className="text-xl font-bold text-blue-400">
                      {customer.total_orders}
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedCustomer(customer.customer_email)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}