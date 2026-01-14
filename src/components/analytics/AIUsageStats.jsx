import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles, Zap, TrendingUp } from "lucide-react";

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

export default function AIUsageStats({ usageLogs }) {
  const featureUsage = usageLogs.reduce((acc, log) => {
    if (!acc[log.feature]) {
      acc[log.feature] = { name: log.feature, count: 0, credits: 0 };
    }
    acc[log.feature].count += 1;
    acc[log.feature].credits += log.credits_used;
    return acc;
  }, {});

  const chartData = Object.values(featureUsage).map(item => ({
    name: item.name.replace(/([A-Z])/g, ' $1').trim(),
    value: item.count
  }));

  const totalCreditsUsed = usageLogs.reduce((sum, log) => sum + log.credits_used, 0);
  const totalFeatureUses = usageLogs.length;
  const avgCreditsPerUse = totalFeatureUses > 0 ? Math.round(totalCreditsUsed / totalFeatureUses) : 0;

  const topFeatures = Object.values(featureUsage)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total AI Uses</p>
              <p className="text-2xl font-bold text-purple-400">{totalFeatureUses}</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Credits Used</p>
              <p className="text-2xl font-bold text-yellow-400">{totalCreditsUsed.toLocaleString()}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Credits/Use</p>
              <p className="text-2xl font-bold text-blue-400">{avgCreditsPerUse}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">AI Feature Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Most Used AI Features</h3>
          <div className="space-y-3">
            {topFeatures.map((feature, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {feature.name.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{feature.count} uses</span>
                    <span className="font-bold text-yellow-400">{feature.credits} credits</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(feature.count / totalFeatureUses) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}