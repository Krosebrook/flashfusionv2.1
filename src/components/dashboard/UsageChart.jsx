import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-3 rounded-lg border border-gray-600 shadow-lg">
        <p className="text-white font-medium">{label}</p>
        <p className="text-blue-400">
          Credits Used: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function UsageChart({ data, type = "line" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-80 flex items-center justify-center">
        <p className="text-gray-400">No usage data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-80">
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="credits_used"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCredits)"
            />
          </AreaChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="credits_used"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3B82F6" }}
              activeDot={{ r: 8, fill: "#60A5FA" }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
