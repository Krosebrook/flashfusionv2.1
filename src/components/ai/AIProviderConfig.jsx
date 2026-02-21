import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

// Current supported providers
export const SUPPORTED_PROVIDERS = [
    { 
        id: 'claude', 
        name: 'Claude (Anthropic)', 
        status: 'active',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        strengths: 'Long context, reasoning, coding, analysis',
        secretKey: 'ANTHROPIC_API_KEY'
    },
    { 
        id: 'openai', 
        name: 'OpenAI (GPT)', 
        status: 'active',
        models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
        strengths: 'General purpose, creative writing, coding',
        secretKey: 'OPENAI_API_KEY'
    },
    { 
        id: 'gemini', 
        name: 'Google Gemini', 
        status: 'active',
        models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
        strengths: 'Multimodal, fast, cost-effective',
        secretKey: 'GEMINI_API_KEY'
    },
    { 
        id: 'grok', 
        name: 'Grok (xAI)', 
        status: 'active',
        models: ['grok-2-1212', 'grok-beta'],
        strengths: 'Real-time data, conversational',
        secretKey: 'GROK_API_KEY'
    },
    { 
        id: 'perplexity', 
        name: 'Perplexity', 
        status: 'active',
        models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
        strengths: 'Research, real-time search, citations',
        secretKey: 'PERPLEXITY_API_KEY'
    }
];

// Next 15 providers to integrate (priority order)
export const UPCOMING_PROVIDERS = [
    { 
        id: 'mistral', 
        name: 'Mistral AI', 
        priority: 'high',
        reason: 'European alternative, strong performance, open models',
        apiEndpoint: 'https://api.mistral.ai/v1',
        secretKey: 'MISTRAL_API_KEY'
    },
    { 
        id: 'cohere', 
        name: 'Cohere', 
        priority: 'high',
        reason: 'Enterprise RAG, embeddings, command models',
        apiEndpoint: 'https://api.cohere.ai/v1',
        secretKey: 'COHERE_API_KEY'
    },
    { 
        id: 'deepseek', 
        name: 'DeepSeek', 
        priority: 'high',
        reason: 'Cost-effective, strong coding capabilities',
        apiEndpoint: 'https://api.deepseek.com/v1',
        secretKey: 'DEEPSEEK_API_KEY'
    },
    { 
        id: 'together', 
        name: 'Together AI', 
        priority: 'medium',
        reason: 'Access to many open-source models, fast inference',
        apiEndpoint: 'https://api.together.xyz/v1',
        secretKey: 'TOGETHER_API_KEY'
    },
    { 
        id: 'replicate', 
        name: 'Replicate', 
        priority: 'medium',
        reason: 'Image generation, specialized models, Flux, SDXL',
        apiEndpoint: 'https://api.replicate.com/v1',
        secretKey: 'REPLICATE_API_KEY'
    },
    { 
        id: 'fireworks', 
        name: 'Fireworks AI', 
        priority: 'medium',
        reason: 'Fast inference, cost-effective, function calling',
        apiEndpoint: 'https://api.fireworks.ai/inference/v1',
        secretKey: 'FIREWORKS_API_KEY'
    },
    { 
        id: 'groq', 
        name: 'Groq', 
        priority: 'high',
        reason: 'Extremely fast inference, LPU architecture',
        apiEndpoint: 'https://api.groq.com/openai/v1',
        secretKey: 'GROQ_API_KEY'
    },
    { 
        id: 'ai21', 
        name: 'AI21 Labs (Jamba)', 
        priority: 'medium',
        reason: 'Long context, hybrid SSM-Transformer architecture',
        apiEndpoint: 'https://api.ai21.com/studio/v1',
        secretKey: 'AI21_API_KEY'
    },
    { 
        id: 'cerebras', 
        name: 'Cerebras', 
        priority: 'medium',
        reason: 'Ultra-fast inference, wafer-scale engines',
        apiEndpoint: 'https://api.cerebras.ai/v1',
        secretKey: 'CEREBRAS_API_KEY'
    },
    { 
        id: 'huggingface', 
        name: 'HuggingFace Inference', 
        priority: 'high',
        reason: 'Access to thousands of open models',
        apiEndpoint: 'https://api-inference.huggingface.co/models',
        secretKey: 'HUGGINGFACE_API_KEY'
    },
    { 
        id: 'anthropic-vertex', 
        name: 'Claude on Vertex AI', 
        priority: 'low',
        reason: 'Enterprise deployment, Google Cloud integration',
        apiEndpoint: 'vertex-ai-endpoint',
        secretKey: 'GOOGLE_CLOUD_PROJECT'
    },
    { 
        id: 'azure-openai', 
        name: 'Azure OpenAI', 
        priority: 'medium',
        reason: 'Enterprise compliance, Microsoft ecosystem',
        apiEndpoint: 'azure-openai-endpoint',
        secretKey: 'AZURE_OPENAI_KEY'
    },
    { 
        id: 'bedrock', 
        name: 'AWS Bedrock', 
        priority: 'medium',
        reason: 'Multi-model access, AWS integration, enterprise',
        apiEndpoint: 'bedrock-runtime',
        secretKey: 'AWS_ACCESS_KEY_ID'
    },
    { 
        id: 'writesonic', 
        name: 'WriteSonic (Chatsonic)', 
        priority: 'low',
        reason: 'Marketing copy, real-time web search',
        apiEndpoint: 'https://api.writesonic.com/v2',
        secretKey: 'WRITESONIC_API_KEY'
    },
    { 
        id: 'aleph-alpha', 
        name: 'Aleph Alpha', 
        priority: 'low',
        reason: 'European sovereignty, multimodal Luminous models',
        apiEndpoint: 'https://api.aleph-alpha.com',
        secretKey: 'ALEPH_ALPHA_API_KEY'
    }
];

export default function AIProviderConfig() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Active AI Providers</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {SUPPORTED_PROVIDERS.map((provider) => (
                        <Card key={provider.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{provider.name}</CardTitle>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                                <CardDescription className="text-xs">{provider.strengths}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground">
                                        <strong>Models:</strong> {provider.models.length} available
                                    </div>
                                    <Badge variant="outline" className="text-xs">{provider.secretKey}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Upcoming Providers (Next 15)</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {UPCOMING_PROVIDERS.map((provider) => (
                        <Card key={provider.id} className="opacity-75">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{provider.name}</CardTitle>
                                    <Circle className={`h-5 w-5 ${
                                        provider.priority === 'high' ? 'text-orange-500' :
                                        provider.priority === 'medium' ? 'text-blue-500' :
                                        'text-gray-400'
                                    }`} />
                                </div>
                                <CardDescription className="text-xs">{provider.reason}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Badge 
                                        variant={provider.priority === 'high' ? 'default' : 'secondary'} 
                                        className="text-xs"
                                    >
                                        Priority: {provider.priority}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground">
                                        {provider.secretKey}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}