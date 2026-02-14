import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FileText, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AIActivityFeed from './AIActivityFeed';
import { toast } from 'sonner';

/**
 * EntityHistory - Display entity history with AI-powered analysis
 * Props:
 * - entityType: string (e.g., "Project", "DealData")
 * - entityId: string
 * - title: string (optional)
 */
export default function EntityHistory({ entityType, entityId, title }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [changelog, setChangelog] = useState(null);
  const [isGeneratingChangelog, setIsGeneratingChangelog] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchHistory();
  }, [entityType, entityId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Fetch usage logs related to this entity
      const logs = await base44.entities.UsageLog.filter({
        entity_type: entityType,
        entity_id: entityId
      }, '-created_date');

      const formattedActivities = logs.map(log => ({
        id: log.id,
        type: log.action_type || 'update',
        title: log.action || 'Activity',
        description: log.details || '',
        timestamp: log.created_date,
        user: log.created_by,
        entity_type: entityType,
        entity_id: entityId,
        metadata: log.metadata
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const generateChangelog = async () => {
    if (activities.length === 0) return;

    setIsGeneratingChangelog(true);
    try {
      const activityData = activities.map(a => ({
        type: a.type,
        title: a.title,
        description: a.description,
        user: a.user,
        timestamp: a.timestamp
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional changelog for this ${entityType} (ID: ${entityId}).

Activity history:
${JSON.stringify(activityData, null, 2)}

Format as a readable changelog with:
- Version-style sections (if applicable)
- Clear categorization (Added, Changed, Fixed, Removed)
- User-friendly language
- Key milestones highlighted

Keep it concise but informative.`,
      });

      setChangelog(result);
      setActiveTab('changelog');
      toast.success('Changelog generated');
    } catch (error) {
      toast.error('Failed to generate changelog');
    } finally {
      setIsGeneratingChangelog(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[hsl(var(--surface-secondary))] border-[hsl(var(--border-primary))]">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--text-tertiary))]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[hsl(var(--surface-secondary))] border-[hsl(var(--border-primary))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {title || `${entityType} History`}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={generateChangelog}
              disabled={isGeneratingChangelog || activities.length === 0}
              size="sm"
              variant="outline"
            >
              {isGeneratingChangelog ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Generate Changelog
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Changelog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <AIActivityFeed activities={activities} enableAI={true} />
          </TabsContent>

          <TabsContent value="changelog">
            {changelog ? (
              <div className="prose prose-sm max-w-none">
                <div className="p-4 bg-[hsl(var(--surface-tertiary))] rounded-lg border border-[hsl(var(--border-secondary))]">
                  <div className="flex items-start gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-400 mb-1">AI-Generated Changelog</p>
                      <div className="text-sm text-[hsl(var(--text-primary))] whitespace-pre-wrap">
                        {changelog}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-[hsl(var(--text-tertiary))] mb-3" />
                <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                  No changelog generated yet
                </p>
                <Button
                  onClick={generateChangelog}
                  disabled={isGeneratingChangelog || activities.length === 0}
                  size="sm"
                >
                  {isGeneratingChangelog ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Now
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {activities.length === 0 && (
          <div className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto text-[hsl(var(--text-tertiary))] mb-2" />
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              No history available for this {entityType}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}