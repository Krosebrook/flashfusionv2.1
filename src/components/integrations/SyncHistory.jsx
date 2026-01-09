import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, CheckCircle2, XCircle, RefreshCw, Clock } from "lucide-react";
import { format } from "date-fns";

export default function SyncHistory({ platformId }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (platformId) {
      fetchLogs();
    }
  }, [platformId]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.SyncLog.list("-created_date", 50);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch sync logs:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Sync History
        </h3>
        <Button size="sm" variant="outline" onClick={fetchLogs}>
          <RefreshCw className="w-3 h-3 mr-2" />
          Refresh
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No sync history yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="mt-1">
                {log.status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{log.product_title}</p>
                  <Badge variant="outline" className="text-xs">
                    {log.platform}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                    {log.sync_type}
                  </Badge>
                  {log.duration_ms && (
                    <span className="text-xs">{log.duration_ms}ms</span>
                  )}
                </div>

                {log.error_message && (
                  <p className="text-xs text-red-400 mt-1">{log.error_message}</p>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(log.created_date), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}