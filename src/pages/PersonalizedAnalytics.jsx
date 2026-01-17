import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomDashboardBuilder from '../components/analytics/CustomDashboardBuilder';
import GoalTracker from '../components/analytics/GoalTracker';
import AIInsightsPanel from '../components/analytics/AIInsightsPanel';
import { BarChart3, Target, Sparkles } from 'lucide-react';

export default function PersonalizedAnalytics() {
  return (
    <Tabs defaultValue="dashboards" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboards" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          Dashboards
        </TabsTrigger>
        <TabsTrigger value="goals" className="gap-2">
          <Target className="w-4 h-4" />
          Goals
        </TabsTrigger>
        <TabsTrigger value="insights" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboards">
        <CustomDashboardBuilder />
      </TabsContent>

      <TabsContent value="goals">
        <GoalTracker />
      </TabsContent>

      <TabsContent value="insights">
        <AIInsightsPanel />
      </TabsContent>
    </Tabs>
  );
}