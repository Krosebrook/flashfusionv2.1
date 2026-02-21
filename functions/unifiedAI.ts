import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.30.1';
import OpenAI from 'npm:openai@4.73.1';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            provider, 
            prompt, 
            messages,
            model, 
            temperature = 0.7, 
            max_tokens = 4096,
            system_prompt,
            response_format
        } = await req.json();

        let response;

        switch (provider) {
            case 'claude':
            case 'anthropic':
                response = await invokeAnthropic({
                    prompt,
                    messages,
                    model: model || 'claude-3-5-sonnet-20241022',
                    temperature,
                    max_tokens,
                    system_prompt
                });
                break;

            case 'openai':
            case 'gpt':
                response = await invokeOpenAI({
                    prompt,
                    messages,
                    model: model || 'gpt-4o',
                    temperature,
                    max_tokens,
                    system_prompt,
                    response_format
                });
                break;

            case 'gemini':
            case 'google':
                response = await invokeGemini({
                    prompt,
                    messages,
                    model: model || 'gemini-2.0-flash-exp',
                    temperature,
                    max_tokens,
                    system_prompt
                });
                break;

            case 'grok':
                response = await invokeGrok({
                    prompt,
                    messages,
                    model: model || 'grok-2-1212',
                    temperature,
                    max_tokens,
                    system_prompt
                });
                break;

            case 'perplexity':
                response = await invokePerplexity({
                    prompt,
                    messages,
                    model: model || 'llama-3.1-sonar-large-128k-online',
                    temperature,
                    max_tokens,
                    system_prompt
                });
                break;

            default:
                return Response.json({ 
                    error: `Unsupported provider: ${provider}. Supported: claude, openai, gemini, grok, perplexity` 
                }, { status: 400 });
        }

        return Response.json({ 
            success: true, 
            provider,
            model,
            response 
        });

    } catch (error) {
        console.error('Unified AI Error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});

// Anthropic (Claude)
async function invokeAnthropic({ prompt, messages, model, temperature, max_tokens, system_prompt }) {
    const anthropic = new Anthropic({
        apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    const msgs = messages || [{ role: 'user', content: prompt }];

    const completion = await anthropic.messages.create({
        model,
        max_tokens,
        temperature,
        system: system_prompt,
        messages: msgs
    });

    return completion.content[0].text;
}

// OpenAI (GPT-4, GPT-4o, etc.)
async function invokeOpenAI({ prompt, messages, model, temperature, max_tokens, system_prompt, response_format }) {
    const openai = new OpenAI({
        apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const msgs = messages || [
        ...(system_prompt ? [{ role: 'system', content: system_prompt }] : []),
        { role: 'user', content: prompt }
    ];

    const completion = await openai.chat.completions.create({
        model,
        messages: msgs,
        temperature,
        max_tokens,
        ...(response_format && { response_format })
    });

    return completion.choices[0].message.content;
}

// Google Gemini
async function invokeGemini({ prompt, messages, model, temperature, max_tokens, system_prompt }) {
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    
    const geminiModel = genAI.getGenerativeModel({ 
        model,
        systemInstruction: system_prompt,
        generationConfig: {
            temperature,
            maxOutputTokens: max_tokens,
        }
    });

    let result;
    if (messages && messages.length > 0) {
        const chat = geminiModel.startChat({
            history: messages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))
        });
        const lastMessage = messages[messages.length - 1];
        result = await chat.sendMessage(lastMessage.content);
    } else {
        result = await geminiModel.generateContent(prompt);
    }

    return result.response.text();
}

// Grok (xAI)
async function invokeGrok({ prompt, messages, model, temperature, max_tokens, system_prompt }) {
    const grok = new OpenAI({
        apiKey: Deno.env.get("GROK_API_KEY"),
        baseURL: 'https://api.x.ai/v1',
    });

    const msgs = messages || [
        ...(system_prompt ? [{ role: 'system', content: system_prompt }] : []),
        { role: 'user', content: prompt }
    ];

    const completion = await grok.chat.completions.create({
        model,
        messages: msgs,
        temperature,
        max_tokens,
    });

    return completion.choices[0].message.content;
}

// Perplexity
async function invokePerplexity({ prompt, messages, model, temperature, max_tokens, system_prompt }) {
    const perplexity = new OpenAI({
        apiKey: Deno.env.get("PERPLEXITY_API_KEY"),
        baseURL: 'https://api.perplexity.ai',
    });

    const msgs = messages || [
        ...(system_prompt ? [{ role: 'system', content: system_prompt }] : []),
        { role: 'user', content: prompt }
    ];

    const completion = await perplexity.chat.completions.create({
        model,
        messages: msgs,
        temperature,
        max_tokens,
    });

    return completion.choices[0].message.content;
}