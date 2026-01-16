import { Progress } from "@/components/ui/progress";
import { Zap, AlertTriangle, CheckCircle } from "lucide-react";

export default function CreditMeter({
  current,
  max = 1000,
  showDetails = true,
  size = "default",
}) {
  const percentage = Math.round((current / max) * 100);
  const isLow = percentage < 20;
  const isCritical = percentage < 5;

  const getStatusColor = () => {
    if (isCritical) return "text-red-400";
    if (isLow) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusIcon = () => {
    if (isCritical) return AlertTriangle;
    if (isLow) return Zap;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();

  if (size === "compact") {
    return (
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
        <span className="text-sm font-medium">
          {current.toLocaleString()} credits
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
          <span className="font-medium">Credits Remaining</span>
        </div>
        <span className="text-2xl font-bold">{current.toLocaleString()}</span>
      </div>

      {showDetails && (
        <>
          <Progress
            value={percentage}
            className="h-3"
            style={{
              backgroundColor: "#374151",
            }}
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{percentage}% remaining</span>
            <span>of {max.toLocaleString()}</span>
          </div>

          {isLow && (
            <div
              className={`p-3 rounded-lg border ${
                isCritical
                  ? "bg-red-900/20 border-red-700 text-red-300"
                  : "bg-yellow-900/20 border-yellow-700 text-yellow-300"
              }`}
            >
              <p className="text-sm font-medium">
                {isCritical ? "Critical: " : "Warning: "}
                {isCritical
                  ? "You're almost out of credits!"
                  : "Your credits are running low."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
