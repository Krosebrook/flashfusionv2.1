import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Calendar, Clock } from "lucide-react";

const platforms = ["Instagram", "TikTok", "Facebook", "Twitter", "LinkedIn"];

export default function ScheduleDialog({ contents, onClose, onScheduled }) {
  const [selectedContent, setSelectedContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!selectedContent || !scheduledDate || !scheduledTime || selectedPlatforms.length === 0) {
      alert("Please fill in all fields");
      return;
    }

    setIsScheduling(true);
    try {
      const content = contents.find(c => c.id === selectedContent);
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      await base44.entities.ContentSchedule.create({
        content_id: content.id,
        content_title: content.title,
        content_type: content.type,
        scheduled_date: scheduledDateTime.toISOString(),
        platforms: selectedPlatforms,
        status: "scheduled",
        auto_publish: true
      });

      onScheduled?.();
      onClose();
    } catch (error) {
      console.error("Failed to schedule:", error);
      alert("Failed to schedule content. Please try again.");
    }
    setIsScheduling(false);
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Schedule Content</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Content</label>
            <Select value={selectedContent} onValueChange={setSelectedContent}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue placeholder="Choose content to schedule" />
              </SelectTrigger>
              <SelectContent>
                {contents.map((content) => (
                  <SelectItem key={content.id} value={content.id}>
                    {content.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Platforms</label>
            <div className="space-y-2">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <label className="text-sm">{platform}</label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSchedule}
            disabled={isScheduling}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Content
          </Button>
        </div>
      </Card>
    </div>
  );
}