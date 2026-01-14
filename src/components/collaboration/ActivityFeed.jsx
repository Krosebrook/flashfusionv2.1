import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed({ collaborations }) {
  const allActivities = collaborations
    .flatMap(collab => 
      (collab.activity_log || []).map(activity => ({
        ...activity,
        resource_title: collab.resource_title,
        resource_type: collab.resource_type
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50);

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>

      {allActivities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No activity yet
        </div>
      ) : (
        <div className="space-y-3">
          {allActivities.map((activity, index) => (
            <div key={index} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.resource_title}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.resource_type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
                <span>•</span>
                <span>{activity.user_email}</span>
              </div>
              {activity.details && (
                <p className="text-xs text-gray-400 mt-2">{activity.details}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}