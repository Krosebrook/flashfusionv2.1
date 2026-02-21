import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import AIOrchestrator from '../components/ai/AIOrchestrator';
import ContextPanel from '../components/ai/ContextPanel';
import SuggestedActions from '../components/ai/SuggestedActions';

export default function AIAssistant() {
    const [context, setContext] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserContext();
    }, []);

    const fetchUserContext = async () => {
        try {
            setLoading(true);
            const [user, projects, recentActivity, workflows, content, deals] = await Promise.all([
                base44.auth.me(),
                base44.entities.Project.list('-updated_date', 10),
                base44.entities.Analytics.list('-created_date', 20),
                base44.entities.AdvancedWorkflow.list('-updated_date', 5),
                base44.entities.ContentPiece.list('-updated_date', 10),
                base44.entities.DealData ? base44.entities.DealData.list('-updated_date', 5) : []
            ]);

            setContext({
                user,
                projects,
                recentActivity,
                workflows,
                content,
                deals,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching context:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshContext = () => {
        fetchUserContext();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">AI Assistant</h1>
                            <p className="text-slate-600">Your intelligent orchestrator across all projects and workflows</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Assistant - 2 columns */}
                    <div className="lg:col-span-2">
                        <AIOrchestrator 
                            context={context} 
                            onActionComplete={refreshContext}
                            loading={loading}
                        />
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        <SuggestedActions 
                            context={context}
                            loading={loading}
                        />
                        <ContextPanel 
                            context={context}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}