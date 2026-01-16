import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";

export default function CustomReport({ data }) {
  const [reportType, setReportType] = useState("summary");
  const [selectedMetrics, setSelectedMetrics] = useState([
    "user_activity",
    "content_performance",
    "ai_usage",
  ]);

  const metrics = [
    { id: "user_activity", name: "User Activity" },
    { id: "content_performance", name: "Content Performance" },
    { id: "ai_usage", name: "AI Feature Usage" },
    { id: "ecommerce", name: "E-commerce Metrics" },
    { id: "credits", name: "Credit Usage" },
  ];

  const toggleMetric = (metricId) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    );
  };

  const generateReport = () => {
    const reportContent = `
FLASHFUSION ANALYTICS REPORT
Generated: ${format(new Date(), "PPpp")}
Report Type: ${reportType}
${"=".repeat(60)}

SELECTED METRICS:
${selectedMetrics
  .map((id) => {
    const metric = metrics.find((m) => m.id === id);
    return `✓ ${metric.name}`;
  })
  .join("\n")}

${"=".repeat(60)}

USER ACTIVITY SUMMARY
- Total Sessions: ${data.userActivity?.totalSessions || 0}
- Active Users: ${data.userActivity?.activeUsers || 0}
- Average Session Duration: ${data.userActivity?.avgSessionDuration || "N/A"}

CONTENT PERFORMANCE
- Total Content Pieces: ${data.content?.total || 0}
- Total Views: ${data.content?.totalViews || 0}
- Average Engagement Rate: ${data.content?.avgEngagement || 0}%

AI FEATURE USAGE
- Total AI Operations: ${data.aiUsage?.totalUses || 0}
- Credits Consumed: ${data.aiUsage?.creditsUsed || 0}
- Most Used Feature: ${data.aiUsage?.topFeature || "N/A"}

E-COMMERCE METRICS
- Total Products: ${data.ecommerce?.totalProducts || 0}
- Published Products: ${data.ecommerce?.publishedProducts || 0}
- Total Product Value: $${data.ecommerce?.totalValue || 0}

${"=".repeat(60)}
End of Report
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FlashFusion_Analytics_Report_${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold">Custom Report Generator</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Report Type
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Executive Summary</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="comparative">Comparative Report</SelectItem>
                <SelectItem value="trends">Trends & Insights</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Select Metrics to Include
            </label>
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg"
                >
                  <Checkbox
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => toggleMetric(metric.id)}
                  />
                  <label className="text-sm font-medium cursor-pointer flex-1">
                    {metric.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={generateReport}
            disabled={selectedMetrics.length === 0}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate & Download Report
          </Button>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <h4 className="font-semibold mb-3">Report Preview</h4>
        <div className="bg-gray-900 p-4 rounded-lg text-sm font-mono text-gray-300">
          <p>
            Report Type: <span className="text-green-400">{reportType}</span>
          </p>
          <p className="mt-2">
            Selected Metrics:{" "}
            <span className="text-blue-400">{selectedMetrics.length}</span>
          </p>
          <p className="mt-2 text-gray-500">
            This report will include comprehensive analytics data for the
            selected metrics.
          </p>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="text-sm text-gray-400">
          <p className="mb-2">
            📊 <strong>Pro Tips:</strong>
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Include multiple metrics for comprehensive insights</li>
            <li>Generate weekly reports to track progress</li>
            <li>Compare reports over time to identify trends</li>
            <li>Share reports with team members for collaboration</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
