import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, Search, ArrowUpDown, LayoutGrid, List,
  TrendingUp, Clock, Shield, Box
} from "lucide-react";

import WSJFCard from "../components/wsjf/WSJFCard";
import WSJFDialog from "../components/wsjf/WSJFDialog";

export default function WSJFPrioritization() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("wsjf_desc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsData, historyData, user] = await Promise.all([
        base44.entities.WSJFItem.list("-wsjf_score"),
        base44.entities.WSJFItemHistory.list("-created_date", 500),
        base44.auth.me()
      ]);
      setItems(itemsData);
      setHistory(historyData);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setIsLoading(false);
  };

  const getItemHistory = (itemId) => {
    return history.filter(h => h.item_id === itemId);
  };

  const trackHistory = async (action, item, oldItem = null) => {
    const historyEntry = {
      item_id: item.id,
      item_title: item.title,
      action,
      actor_email: currentUser?.email || "unknown"
    };

    if (action === "update" && oldItem) {
      const changedFields = [];
      const oldValues = {};
      const newValues = {};
      
      const fieldsToTrack = ["title", "description", "business_value", "time_criticality", 
                            "risk_reduction", "job_size", "status", "owner_email"];
      
      fieldsToTrack.forEach(field => {
        if (oldItem[field] !== item[field]) {
          changedFields.push(field);
          oldValues[field] = oldItem[field];
          newValues[field] = item[field];
        }
      });

      if (changedFields.length > 0) {
        historyEntry.changed_fields = changedFields;
        historyEntry.old_values = oldValues;
        historyEntry.new_values = newValues;
        historyEntry.old_wsjf_score = oldItem.wsjf_score;
        historyEntry.new_wsjf_score = item.wsjf_score;
      }
    }

    if (action === "insert") {
      historyEntry.new_wsjf_score = item.wsjf_score;
    }

    if (action === "delete") {
      historyEntry.old_wsjf_score = item.wsjf_score;
    }

    await base44.entities.WSJFItemHistory.create(historyEntry);
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        const updatedItem = await base44.entities.WSJFItem.update(editingItem.id, formData);
        await trackHistory("update", { ...updatedItem, ...formData }, editingItem);
      } else {
        const newItem = await base44.entities.WSJFItem.create(formData);
        await trackHistory("insert", newItem);
      }
      fetchData();
      setShowDialog(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await trackHistory("delete", item);
      await base44.entities.WSJFItem.delete(item.id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowDialog(true);
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "wsjf_desc": return (b.wsjf_score || 0) - (a.wsjf_score || 0);
        case "wsjf_asc": return (a.wsjf_score || 0) - (b.wsjf_score || 0);
        case "title": return a.title.localeCompare(b.title);
        case "newest": return new Date(b.created_date) - new Date(a.created_date);
        default: return 0;
      }
    });

  const stats = {
    total: items.length,
    avgScore: items.length > 0 ? (items.reduce((sum, i) => sum + (i.wsjf_score || 0), 0) / items.length).toFixed(1) : 0,
    inProgress: items.filter(i => i.status === "in_progress").length,
    ready: items.filter(i => i.status === "ready").length
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <ArrowUpDown className="w-8 h-8 text-purple-400" />
          <span>WSJF Prioritization</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Weighted Shortest Job First - prioritize work by maximizing value delivery
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Items</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.avgScore}</div>
          <div className="text-sm text-gray-400">Avg WSJF Score</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
          <div className="text-sm text-gray-400">In Progress</div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-400">{stats.ready}</div>
          <div className="text-sm text-gray-400">Ready</div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wsjf_desc">Highest WSJF</SelectItem>
              <SelectItem value="wsjf_asc">Lowest WSJF</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={() => { setEditingItem(null); setShowDialog(true); }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12 text-center">
          <ArrowUpDown className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No items yet</h3>
          <p className="text-gray-400 mb-6">
            Start prioritizing by adding your first WSJF item
          </p>
          <Button 
            onClick={() => { setEditingItem(null); setShowDialog(true); }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </Button>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
          : "space-y-4"
        }>
          {filteredItems.map((item) => (
            <WSJFCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              history={getItemHistory(item.id)}
            />
          ))}
        </div>
      )}

      {showDialog && (
        <WSJFDialog
          item={editingItem}
          onSave={handleSave}
          onClose={() => { setShowDialog(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}