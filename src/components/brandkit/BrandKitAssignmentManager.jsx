import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, CheckCircle2, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CONTENT_TYPES = [
  "social_post",
  "email",
  "ad_copy",
  "blog",
  "video_script",
  "product_description",
  "meme",
  "graphic"
];

const PLATFORMS = ["Instagram", "TikTok", "Facebook", "LinkedIn", "Twitter", "YouTube", "Email"];

export default function BrandKitAssignmentManager() {
  const [assignments, setAssignments] = useState([]);
  const [brandKits, setBrandKits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    brand_kit_id: "",
    campaign_name: "",
    content_types: [],
    platforms: [],
    is_default: false,
    auto_apply: true,
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsData, brandKitsData] = await Promise.all([
        base44.entities.BrandKitAssignment.list("-created_date", 100),
        base44.entities.BrandKit.list()
      ]);
      setAssignments(assignmentsData);
      setBrandKits(brandKitsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.brand_kit_id || !formData.campaign_name) return;

    try {
      if (editingId) {
        await base44.entities.BrandKitAssignment.update(editingId, formData);
      } else {
        await base44.entities.BrandKitAssignment.create(formData);
      }
      await fetchData();
      resetForm();
    } catch (error) {
      console.error("Failed to save assignment:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand assignment?")) return;
    try {
      await base44.entities.BrandKitAssignment.delete(id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  const handleEdit = (assignment) => {
    setFormData(assignment);
    setEditingId(assignment.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      brand_kit_id: "",
      campaign_name: "",
      content_types: [],
      platforms: [],
      is_default: false,
      auto_apply: true,
      description: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleContentType = (type) => {
    setFormData(prev => ({
      ...prev,
      content_types: prev.content_types.includes(type)
        ? prev.content_types.filter(t => t !== type)
        : [...prev.content_types, type]
    }));
  };

  const togglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          Brand Kit Assignments
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit" : "Create"} Brand Assignment
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Brand Kit</label>
              <Select value={formData.brand_kit_id} onValueChange={(value) => {
                const brand = brandKits.find(b => b.id === value);
                setFormData(prev => ({
                  ...prev,
                  brand_kit_id: value,
                  brand_kit_name: brand?.name
                }));
              }}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue placeholder="Select a brand kit" />
                </SelectTrigger>
                <SelectContent>
                  {brandKits.map(kit => (
                    <SelectItem key={kit.id} value={kit.id}>
                      {kit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Campaign Name</label>
              <Input
                placeholder="e.g., Summer Sale 2024"
                value={formData.campaign_name}
                onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
                className="bg-gray-900 border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Content Types</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CONTENT_TYPES.map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.content_types.includes(type)}
                      onCheckedChange={() => toggleContentType(type)}
                    />
                    <label className="text-sm cursor-pointer">{type.replace(/_/g, " ")}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Platforms</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PLATFORMS.map(platform => (
                  <div key={platform} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.platforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                    />
                    <label className="text-sm cursor-pointer">{platform}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Input
                placeholder="e.g., Brand guidelines for summer campaign"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-900 border-gray-600"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                />
                <label className="text-sm">Set as default</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.auto_apply}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_apply: checked }))}
                />
                <label className="text-sm">Auto-apply to matching content</label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {editingId ? "Update" : "Create"} Assignment
              </Button>
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {assignments.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12 text-center">
          <Palette className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
          <p className="text-gray-400">Create your first brand kit assignment to ensure consistency across campaigns</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <Card key={assignment.id} className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {assignment.campaign_name}
                    {assignment.is_default && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">Default</Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{assignment.brand_kit_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(assignment)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(assignment.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {assignment.description && (
                <p className="text-sm text-gray-400 mb-3">{assignment.description}</p>
              )}

              <div className="space-y-3">
                {assignment.content_types?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Content Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {assignment.content_types.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {assignment.platforms?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Platforms:</p>
                    <div className="flex flex-wrap gap-2">
                      {assignment.platforms.map(platform => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 text-xs text-gray-400 pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1">
                    {assignment.auto_apply && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                    {assignment.auto_apply ? "Auto-applies" : "Manual apply"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}