import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2, CheckCircle2, Code, FileText, Workflow, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function AIOrchestrator({ context, onActionComplete, loading: contextLoading }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0 && context && !contextLoading) {
            generateInitialSuggestions();
        }
    }, [context, contextLoading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const generateInitialSuggestions = async () => {
        if (!context) return;

        setProcessing(true);
        try {
            const contextSummary = `
User has:
- ${context.projects?.length || 0} active projects
- ${context.content?.length || 0} recent content pieces
- ${context.workflows?.length || 0} workflows
- ${context.deals?.length || 0} deals
Recent activity: ${context.recentActivity?.slice(0, 5).map(a => a.event_name).join(', ') || 'None'}
`;

            const response = await base44.functions.invoke('unifiedAI', {
                provider: 'claude',
                model: 'claude-3-5-sonnet-20241022',
                system_prompt: `You are an intelligent AI orchestrator for a project management and content creation platform. 
Your role is to proactively suggest next steps, identify opportunities, and help users navigate between different modules (projects, content, workflows, deals).
Be concise, actionable, and friendly. Suggest specific actions the user can take.`,
                prompt: `Based on this user context, provide a warm greeting and 3-4 proactive suggestions for what they could do next:\n\n${contextSummary}`
            });

            setMessages([{
                role: 'assistant',
                content: response.response,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Error generating initial suggestions:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || processing) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setProcessing(true);

        try {
            const contextSummary = context ? `
Current context:
- ${context.projects?.length || 0} projects (Latest: ${context.projects?.[0]?.name || 'None'})
- ${context.content?.length || 0} content pieces
- ${context.workflows?.length || 0} workflows
- ${context.deals?.length || 0} deals
` : 'No context available';

            const conversationHistory = messages.slice(-6).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await base44.functions.invoke('unifiedAI', {
                provider: 'claude',
                model: 'claude-3-5-sonnet-20241022',
                system_prompt: `You are an intelligent AI orchestrator for a project management platform with modules for:
- Projects (create, manage web/mobile/ecommerce projects)
- Content Creation (blog posts, social media, video scripts, ads)
- Workflows (automation, triggers, integrations)
- Deal Sourcing (business opportunities, scoring)
- E-commerce (product management, multi-platform publishing)
- Brand Kit (logos, colors, fonts, voice)
- Analytics (performance tracking, insights)

Your role:
1. Help users navigate between modules
2. Suggest concrete next steps based on their request and context
3. Offer to execute actions when appropriate (create projects, generate content, etc.)
4. Be concise and actionable

User's current context: ${contextSummary}`,
                messages: [
                    ...conversationHistory,
                    { role: 'user', content: input }
                ]
            });

            const assistantMessage = {
                role: 'assistant',
                content: response.response,
                timestamp: new Date().toISOString(),
                suggestions: extractActionSuggestions(response.response)
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error processing message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I encountered an error processing your request. Please try again.',
                timestamp: new Date().toISOString(),
                error: true
            }]);
        } finally {
            setProcessing(false);
        }
    };

    const extractActionSuggestions = (content) => {
        const suggestions = [];
        
        if (content.toLowerCase().includes('create project') || content.toLowerCase().includes('new project')) {
            suggestions.push({ type: 'project', label: 'Go to Projects', url: '/Projects' });
        }
        if (content.toLowerCase().includes('content') || content.toLowerCase().includes('blog') || content.toLowerCase().includes('social')) {
            suggestions.push({ type: 'content', label: 'Content Creator', url: '/ContentCreator' });
        }
        if (content.toLowerCase().includes('workflow') || content.toLowerCase().includes('automation')) {
            suggestions.push({ type: 'workflow', label: 'Build Workflow', url: '/AdvancedWorkflows' });
        }
        if (content.toLowerCase().includes('deal') || content.toLowerCase().includes('sourcing')) {
            suggestions.push({ type: 'deal', label: 'Deal Sourcer', url: '/DealSourcer' });
        }

        return suggestions;
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { icon: Code, label: 'Create Project', prompt: 'Help me create a new web application project' },
        { icon: FileText, label: 'Generate Content', prompt: 'I need help creating marketing content' },
        { icon: Workflow, label: 'Build Workflow', prompt: 'Help me automate a process with workflows' },
        { icon: TrendingUp, label: 'Analyze Performance', prompt: 'Show me insights on my recent activity' }
    ];

    return (
        <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Orchestrator
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-5rem)]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.length === 0 && !processing && (
                        <div className="text-center py-12">
                            <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                            <p className="text-slate-600 mb-6">Ask me anything or choose a quick action below</p>
                            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                                {quickActions.map((action, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        className="h-auto py-3 flex flex-col items-center gap-2"
                                        onClick={() => setInput(action.prompt)}
                                    >
                                        <action.icon className="h-5 w-5" />
                                        <span className="text-sm">{action.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-4 ${
                                msg.role === 'user' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-slate-100 text-slate-900'
                            }`}>
                                {msg.role === 'assistant' ? (
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sm">{msg.content}</p>
                                )}
                                
                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-300 flex flex-wrap gap-2">
                                        {msg.suggestions.map((sug, i) => (
                                            <Link key={i} to={createPageUrl(sug.url.replace('/', ''))}>
                                                <Badge variant="secondary" className="cursor-pointer hover:bg-slate-300">
                                                    {sug.label} →
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {processing && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                <span className="text-sm text-slate-600">Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything... (e.g., 'Help me create a marketing campaign for my SaaS product')"
                        className="resize-none"
                        rows={2}
                        disabled={processing}
                    />
                    <Button 
                        onClick={handleSend}
                        disabled={!input.trim() || processing}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}