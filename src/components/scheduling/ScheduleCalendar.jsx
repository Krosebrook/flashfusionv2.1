import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

export default function ScheduleCalendar({ schedules, onRefresh }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSchedulesForDay = (day) => {
    return schedules.filter(s => 
      isSameDay(new Date(s.scheduled_date), day)
    );
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" />
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-400 p-2">
            {day}
          </div>
        ))}

        {daysInMonth.map((day) => {
          const daySchedules = getSchedulesForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-2 rounded-lg border ${
                isToday ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900'
              } ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}`}
            >
              <div className="text-sm font-semibold mb-2">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {daySchedules.slice(0, 3).map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`text-xs p-1 rounded truncate ${
                      schedule.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                      schedule.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {format(new Date(schedule.scheduled_date), 'HH:mm')} - {schedule.content_title}
                  </div>
                ))}
                {daySchedules.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{daySchedules.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}