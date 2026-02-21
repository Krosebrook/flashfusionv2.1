import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Layers, FileText, Workflow, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ContextPanel({ context, loading }) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Current Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!context) {
        return null;
    }

    const contextItems = [
        {
            icon: Layers,
            label: 'Active Projects',
            value: context.projects?.length || 0,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            icon: FileText,
            label: 'Content Pieces',
            value: context.content?.length || 0,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            icon: Workflow,
            label: 'Workflows',
            value: context.workflows?.length || 0,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            icon: TrendingUp,
            label: 'Recent Activities',
            value: context.recentActivity?.length || 0,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Current Context
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {contextItems.map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${item.bgColor}`}>
                        <div className="flex items-center gap-2">
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {item.value}
                        </Badge>
                    </div>
                ))}

                {context.projects && context.projects.length > 0 && (
                    <div className="pt-3 border-t">
                        <p className="text-xs text-slate-500 mb-2">Latest Project</p>
                        <div className="bg-white p-2 rounded border border-slate-200">
                            <p className="text-sm font-medium text-slate-900">{context.projects[0].name}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {context.projects[0].type} • {context.projects[0].status}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}