import { Clock, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const activityIcons = {
  create: CheckCircle2,
  update: Info,
  delete: AlertCircle,
  execute: Zap,
  default: Clock,
};

const activityColors = {
  create: 'text-green-400',
  update: 'text-blue-400',
  delete: 'text-red-400',
  execute: 'text-purple-400',
  default: 'text-gray-400',
};

/**
 * ActivityFeed - Timeline of events
 * Props:
 * - activities: array of { id, type, title, description, timestamp, user }
 * - compact: boolean (optional)
 */
export default function ActivityFeed({ activities = [], compact = false }) {
  if (activities.length === 0) {
    return (
      <div className="p-6 text-center text-[hsl(var(--text-tertiary))]">
        No activity yet
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`} role="feed" aria-label="Activity feed">
      {activities.map((activity, idx) => {
        const Icon = activityIcons[activity.type] || activityIcons.default;
        const colorClass = activityColors[activity.type] || activityColors.default;

        return (
          <div key={activity.id || idx} className="flex gap-3" role="article">
            <div className={`w-8 h-8 rounded-full bg-[hsl(var(--surface-tertiary))] flex items-center justify-center flex-shrink-0 ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-[hsl(var(--text-primary))] ${compact ? 'text-sm' : ''}`}>
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className={`text-[hsl(var(--text-secondary))] mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                      {activity.description}
                    </p>
                  )}
                  {activity.user && (
                    <p className={`text-[hsl(var(--text-tertiary))] mt-1 ${compact ? 'text-xs' : 'text-xs'}`}>
                      by {activity.user}
                    </p>
                  )}
                </div>
                <time 
                  className={`text-[hsl(var(--text-tertiary))] flex-shrink-0 ${compact ? 'text-xs' : 'text-sm'}`}
                  dateTime={activity.timestamp}
                >
                  {new Date(activity.timestamp).toLocaleString()}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}