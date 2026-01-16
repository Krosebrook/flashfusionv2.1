import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

export default function ScheduleList({ schedules, onRefresh }) {
  const handleDelete = async (schedule) => {
    if (!confirm("Cancel this scheduled post?")) return;
    try {
      await base44.entities.ContentSchedule.delete(schedule.id);
      onRefresh?.();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const handlePublishNow = async (schedule) => {
    if (!confirm("Publish this content now?")) return;
    try {
      await base44.entities.ContentSchedule.update(schedule.id, {
        status: "published",
        published_date: new Date().toISOString(),
      });
      onRefresh?.();
    } catch (error) {
      console.error("Failed to publish:", error);
    }
  };

  const upcomingSchedules = schedules.filter(
    (s) => s.status === "scheduled" && new Date(s.scheduled_date) > new Date()
  );

  const pastSchedules = schedules.filter(
    (s) => s.status === "published" || new Date(s.scheduled_date) <= new Date()
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Schedules</h3>
        {upcomingSchedules.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No upcoming scheduled posts
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingSchedules.map((schedule) => (
              <div key={schedule.id} className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">
                      {schedule.content_title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(
                          new Date(schedule.scheduled_date),
                          "PPP 'at' p"
                        )}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    {schedule.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {schedule.platforms?.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePublishNow(schedule)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-2" />
                    Publish Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(schedule)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Published & Past</h3>
        <div className="space-y-3">
          {pastSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-gray-900 p-4 rounded-lg opacity-75"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    {schedule.content_title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      {schedule.status === "published" &&
                      schedule.published_date
                        ? `Published ${format(new Date(schedule.published_date), "PPP")}`
                        : `Scheduled for ${format(new Date(schedule.scheduled_date), "PPP")}`}
                    </span>
                  </div>
                </div>
                <Badge
                  className={
                    schedule.status === "published"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }
                >
                  {schedule.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
