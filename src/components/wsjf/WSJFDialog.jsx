import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, TrendingUp, Clock, Shield, Box } from "lucide-react";

const ScoreSlider = ({ label, value, onChange, icon: Icon, description }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      <span className="text-lg font-bold text-blue-400">{value}</span>
    </div>
    <Slider
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      min={1}
      max={10}
      step={1}
      className="w-full"
    />
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

export default function WSJFDialog({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    business_value: 5,
    time_criticality: 5,
    risk_reduction: 5,
    job_size: 5,
    status: "backlog",
    owner_email: "",
    tags: []
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        business_value: item.business_value || 5,
        time_criticality: item.time_criticality || 5,
        risk_reduction: item.risk_reduction || 5,
        job_size: item.job_size || 5,
        status: item.status || "backlog",
        owner_email: item.owner_email || "",
        tags: item.tags || []
      });
    }
  }, [item]);

  const calculateWSJF = () => {
    const cod = formData.business_value + formData.time_criticality + formData.risk_reduction;
    return formData.job_size > 0 ? cod / formData.job_size : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const wsjf_score = calculateWSJF();
    onSave({ ...formData, wsjf_score });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">
            {item ? "Edit WSJF Item" : "New WSJF Item"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter item title"
              required
              className="bg-gray-900 border-gray-700"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="bg-gray-900 border-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Owner Email</Label>
              <Input
                value={formData.owner_email}
                onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                placeholder="owner@example.com"
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-center mb-2">WSJF Scoring</h3>
            
            <ScoreSlider
              label="Business Value"
              value={formData.business_value}
              onChange={(v) => setFormData({ ...formData, business_value: v })}
              icon={TrendingUp}
              description="User/business value delivered"
            />

            <ScoreSlider
              label="Time Criticality"
              value={formData.time_criticality}
              onChange={(v) => setFormData({ ...formData, time_criticality: v })}
              icon={Clock}
              description="How time-sensitive is this?"
            />

            <ScoreSlider
              label="Risk Reduction"
              value={formData.risk_reduction}
              onChange={(v) => setFormData({ ...formData, risk_reduction: v })}
              icon={Shield}
              description="Risk reduction or opportunity enablement"
            />

            <ScoreSlider
              label="Job Size"
              value={formData.job_size}
              onChange={(v) => setFormData({ ...formData, job_size: v })}
              icon={Box}
              description="Effort/complexity estimate"
            />

            <div className="text-center p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <div className="text-sm text-gray-200">Calculated WSJF Score</div>
              <div className="text-3xl font-bold">{calculateWSJF().toFixed(2)}</div>
              <div className="text-xs text-gray-300 mt-1">
                (BV + TC + RR) / Job Size = ({formData.business_value} + {formData.time_criticality} + {formData.risk_reduction}) / {formData.job_size}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {item ? "Update" : "Create"} Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}