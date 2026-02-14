import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Clock, CheckCircle2, AlertCircle, Info, Zap, Sparkles, Search, Shield, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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
 * AIActivityFeed - AI-enhanced activity feed with summarization, anomaly detection, and NL search
 * Props:
 * - activities: array of { id, type, title, description, timestamp, user, entity_type?, entity_id? }
 * - compact: boolean
 * - enableAI: boolean (default true)
 */
export default function AIActivityFeed({ activities = [], compact = false, enableAI = true }) {
  const [nlQuery, setNlQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const generateSummary = async () => {
    if (activities.length === 0) return;

    setIsSummarizing(true);
    try {
      const activityData = activities.slice(0, 100).map(a => ({
        type: a.type,
        title: a.title,
        user: a.user,
        timestamp: a.timestamp,
        entity: a.entity_type
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this activity log (${activities.length} events) and provide a concise executive summary. Focus on:
- Key trends and patterns
- Most active users
- Critical events
- Time-based insights
- Overall health assessment

Activity data (recent 100):
${JSON.stringify(activityData, null, 2)}

Provide a brief, actionable summary (3-4 sentences).`,
      });

      setSummary(result);
      toast.success('Summary generated');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  const detectAnomalies = async () => {
    if (activities.length === 0) return;

    setIsAnalyzing(true);
    try {
      const activityData = activities.slice(0, 100).map(a => ({
        type: a.type,
        title: a.title,
        user: a.user,
        timestamp: a.timestamp,
        description: a.description
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this activity log for security anomalies, critical events, and unusual patterns:

${JSON.stringify(activityData, null, 2)}

Identify:
1. Suspicious deletion spikes
2. Unusual access patterns
3. Failed operations clusters
4. Privilege escalation attempts
5. Abnormal user behavior
6. Critical system changes

Return JSON with detected anomalies.`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  type: { type: "string" },
                  description: { type: "string" },
                  affected_activities: { type: "array", items: { type: "number" } },
                  recommendation: { type: "string" }
                }
              }
            },
            overall_risk: { type: "string", enum: ["low", "medium", "high", "critical"] }
          }
        }
      });

      setAnomalies(result.anomalies || []);
      if (result.anomalies?.length > 0) {
        toast.warning(`Found ${result.anomalies.length} potential anomalies`);
      } else {
        toast.success('No anomalies detected');
      }
    } catch (error) {
      toast.error('Failed to analyze anomalies');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNaturalLanguageSearch = async () => {
    if (!nlQuery.trim()) {
      setFilteredActivities(activities);
      return;
    }

    setIsSearching(true);
    try {
      const activityData = activities.map((a, idx) => ({
        index: idx,
        type: a.type,
        title: a.title,
        description: a.description,
        user: a.user,
        timestamp: a.timestamp
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `User query: "${nlQuery}"

Activity log:
${JSON.stringify(activityData, null, 2)}

Interpret the natural language query and return matching activity indices. Consider:
- Time references (today, yesterday, last week, etc.)
- User names
- Action types (created, updated, deleted)
- Entity types
- Keywords in titles/descriptions

Return JSON with matching indices.`,
        response_json_schema: {
          type: "object",
          properties: {
            matching_indices: { type: "array", items: { type: "number" } },
            interpretation: { type: "string" }
          }
        }
      });

      const matches = result.matching_indices.map(idx => activities[idx]).filter(Boolean);
      setFilteredActivities(matches);
      
      if (matches.length === 0) {
        toast.info('No matching activities found');
      } else {
        toast.success(`Found ${matches.length} matching activities`);
      }
    } catch (error) {
      toast.error('Search failed');
      setFilteredActivities(activities);
    } finally {
      setIsSearching(false);
    }
  };

  const severityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center text-[hsl(var(--text-tertiary))]">
        No activity yet
      </div>
    );
  }

  const displayActivities = activeTab === 'filtered' ? filteredActivities : activities;

  return (
    <div className="space-y-4">
      {enableAI && (
        <Card className="bg-[hsl(var(--surface-secondary))] border-[hsl(var(--border-primary))]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Activity Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Natural Language Search */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[hsl(var(--text-tertiary))]" />
                  <Input
                    placeholder="Ask anything... (e.g., 'show me deletions by John last week')"
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
                    className="pl-10 bg-[hsl(var(--surface-tertiary))] border-[hsl(var(--border-secondary))]"
                  />
                </div>
                <Button
                  onClick={handleNaturalLanguageSearch}
                  disabled={isSearching}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
                {nlQuery && (
                  <Button
                    onClick={() => {
                      setNlQuery('');
                      setFilteredActivities(activities);
                      setActiveTab('all');
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* AI Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={generateSummary}
                disabled={isSummarizing}
                size="sm"
                variant="outline"
                className="flex-1 min-w-[140px]"
              >
                {isSummarizing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Summarize
              </Button>
              <Button
                onClick={detectAnomalies}
                disabled={isAnalyzing}
                size="sm"
                variant="outline"
                className="flex-1 min-w-[140px]"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Detect Anomalies
              </Button>
            </div>

            {/* Summary Display */}
            {summary && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-400 mb-1">Activity Summary</p>
                    <p className="text-sm text-[hsl(var(--text-secondary))]">{summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Anomalies Display */}
            {anomalies.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Detected Anomalies ({anomalies.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {anomalies.map((anomaly, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border ${severityColors[anomaly.severity]}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={severityColors[anomaly.severity]}>
                              {anomaly.severity}
                            </Badge>
                            <span className="text-xs font-medium">{anomaly.type}</span>
                          </div>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">
                            {anomaly.description}
                          </p>
                          {anomaly.recommendation && (
                            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                              💡 {anomaly.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for All vs Filtered */}
      {nlQuery && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All ({activities.length})</TabsTrigger>
            <TabsTrigger value="filtered">Filtered ({filteredActivities.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Activity List */}
      <div className={`space-y-${compact ? '3' : '4'}`} role="feed" aria-label="Activity feed">
        {displayActivities.length === 0 ? (
          <div className="p-6 text-center text-[hsl(var(--text-tertiary))]">
            No matching activities
          </div>
        ) : (
          displayActivities.map((activity, idx) => {
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
                      <div className="flex items-center gap-2 mt-1">
                        {activity.user && (
                          <p className={`text-[hsl(var(--text-tertiary))] ${compact ? 'text-xs' : 'text-xs'}`}>
                            by {activity.user}
                          </p>
                        )}
                        {activity.entity_type && (
                          <Badge variant="outline" className="text-xs">
                            {activity.entity_type}
                          </Badge>
                        )}
                      </div>
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
          })
        )}
      </div>
    </div>
  );
}