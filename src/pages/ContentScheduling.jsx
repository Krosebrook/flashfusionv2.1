"use client";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, List, Plus, CheckCircle2, XCircle } from "lucide-react";

import ScheduleCalendar from "../components/scheduling/ScheduleCalendar";
import ScheduleList from "../components/scheduling/ScheduleList";
import ScheduleDialog from "../components/scheduling/ScheduleDialog";

export default function ContentScheduling() {
  const [schedules, setSchedules] = useState([]);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [schedulesData, contentsData] = await Promise.all([
        base44.entities.ContentSchedule.list("-scheduled_date"),
        base44.entities.ContentPiece.list("-created_date", 50)
      ]);
      setSchedules(schedulesData);
      setContents(contentsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setIsLoading(false);
  };

  const stats = {
    total: schedules.length,
    upcoming: schedules.filter(s => s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()).length,
    published: schedules.filter(s => s.status === 'published').length,
    failed: schedules.filter(s => s.status === 'failed').length
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-green-400" />
          <span>Advanced Content Scheduling</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Schedule and auto-publish your content across multiple platforms at optimal times
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Scheduled</p>
              <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.upcoming}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Published</p>
              <p className="text-2xl font-bold text-green-400">{stats.published}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setShowScheduleDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Content
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <ScheduleCalendar schedules={schedules} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <ScheduleList schedules={schedules} onRefresh={fetchData} />
        </TabsContent>
      </Tabs>

      {showScheduleDialog && (
        <ScheduleDialog
          contents={contents}
          onClose={() => setShowScheduleDialog(false)}
          onScheduled={fetchData}
        />
      )}
    </div>
  );
}