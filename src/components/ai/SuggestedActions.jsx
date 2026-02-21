import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SuggestedActions({ context, loading }) {
    const [suggestions, setSuggestions] = useState([]);
    const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

    useEffect(() => {
        if (context && !loading) {
            generateSuggestions();
        }
    }, [context, loading]);

    const generateSuggestions = async () => {
        if (!context) return;

        setGeneratingSuggestions(true);
        try {
            const contextSummary = `
Projects: ${context.projects?.length || 0} (${context.projects?.map(p => p.name).join(', ') || 'None'})
Content: ${context.content?.length || 0} pieces
Workflows: ${context.workflows?.length || 0}
Deals: ${context.deals?.length || 0}
Recent activity: ${context.recentActivity?.slice(0, 3).map(a => a.event_name).join(', ') || 'None'}
`;

            const response = await base44.functions.invoke('unifiedAI', {
                provider: 'claude',
                model: 'claude-3-5-sonnet-20241022',
                system_prompt: `You are an AI assistant that suggests proactive next steps for users.
Based on their current context, suggest 3-4 concrete actions they could take.
Format each suggestion as: 
ACTION_TYPE: Title | Description | Page

ACTION_TYPE must be one of: project, content, workflow, deal, analytics, brand
Page must be one of: Projects, ContentCreator, AdvancedWorkflows, DealSourcer, Analytics, BrandKitGenerator, EcommerceSuite

Example:
content: Create Marketing Blog Post | Write a blog post for your latest project | ContentCreator
project: Launch Mobile App | Start a new mobile app project | Projects`,
                prompt: `Based on this context, suggest 3-4 actionable next steps:\n\n${contextSummary}`
            });

            const parsed = parseSuggestions(response.response);
            setSuggestions(parsed);
        } catch (error) {
            console.error('Error generating suggestions:', error);
        } finally {
            setGeneratingSuggestions(false);
        }
    };

    const parseSuggestions = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        const suggestions = [];

        for (const line of lines) {
            const match = line.match(/^(\w+):\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/);
            if (match) {
                const [, type, title, description, page] = match;
                suggestions.push({
                    type: type.toLowerCase(),
                    title: title.trim(),
                    description: description.trim(),
                    page: page.trim()
                });
            }
        }

        return suggestions.slice(0, 4);
    };

    const getTypeColor = (type) => {
        const colors = {
            project: 'bg-blue-100 text-blue-700',
            content: 'bg-green-100 text-green-700',
            workflow: 'bg-purple-100 text-purple-700',
            deal: 'bg-orange-100 text-orange-700',
            analytics: 'bg-pink-100 text-pink-700',
            brand: 'bg-yellow-100 text-yellow-700'
        };
        return colors[type] || 'bg-slate-100 text-slate-700';
    };

    if (loading || generatingSuggestions) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Suggested Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Suggested Next Steps
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {suggestions.length === 0 ? (
                    <div className="text-center py-6 text-sm text-slate-500">
                        <Lightbulb className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p>No suggestions available yet</p>
                    </div>
                ) : (
                    suggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-3 space-y-2 hover:bg-slate-100 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <Badge className={`text-xs mb-2 ${getTypeColor(suggestion.type)}`}>
                                        {suggestion.type}
                                    </Badge>
                                    <h4 className="font-medium text-sm text-slate-900">{suggestion.title}</h4>
                                    <p className="text-xs text-slate-600 mt-1">{suggestion.description}</p>
                                </div>
                            </div>
                            <Link to={createPageUrl(suggestion.page)}>
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                    Go to {suggestion.page}
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}