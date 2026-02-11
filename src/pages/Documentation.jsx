import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Changelog from '../components/docs/Changelog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, FileText, Code, Zap } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
        <p className="text-gray-400">
          Comprehensive guides and references for FlashFusion
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="overview">
            <Book className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="architecture">
            <Code className="w-4 h-4 mr-2" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="changelog">
            <FileText className="w-4 h-4 mr-2" />
            Changelog
          </TabsTrigger>
          <TabsTrigger value="quickstart">
            <Zap className="w-4 h-4 mr-2" />
            Quick Start
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">FlashFusion Overview</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-4">
                FlashFusion is a Universal AI Platform that enables entrepreneurs, marketers, developers, and investors to generate applications, content, and business solutions using advanced AI.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Core Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Universal Generator:</strong> Create complete applications from natural language</li>
                <li><strong>Feature Generator:</strong> Convert ideas into production-ready code</li>
                <li><strong>Content Creator:</strong> Generate marketing copy, social posts, video scripts</li>
                <li><strong>Deal Sourcer:</strong> AI-powered deal discovery and analysis</li>
                <li><strong>E-commerce Suite:</strong> Multi-platform product management</li>
                <li><strong>Integration Hub:</strong> Connect Google, Slack, Notion, LinkedIn, TikTok</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Technology Stack</h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Frontend:</strong> React 18, Tailwind CSS, shadcn/ui</li>
                <li><strong>Backend:</strong> Base44 (Deno serverless functions)</li>
                <li><strong>State:</strong> React Query for caching and updates</li>
                <li><strong>AI:</strong> OpenAI, Anthropic, Perplexity, OpenRouter</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Key Concepts</h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <strong className="text-white">Entities:</strong> Data models stored in Base44's database
                  <ul className="ml-4 mt-1">
                    <li>UserProfile, Project, ContentPiece, DealData, etc.</li>
                    <li>Automatic fields: id, created_date, updated_date, created_by</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-white">Functions:</strong> Serverless backend logic
                  <ul className="ml-4 mt-1">
                    <li>dispatchOutbox, scoreDeal, generateWeeklyDigest, etc.</li>
                    <li>Auto-deployed and callable via SDK</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-white">Components:</strong> Reusable UI elements
                  <ul className="ml-4 mt-1">
                    <li>Organized by feature: generators, analytics, content, etc.</li>
                    <li>Built with shadcn/ui design system</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">File Structure</h3>
                <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`/
├── entities/              # JSON schemas
├── pages/                 # Top-level routes (flat)
├── components/
│   ├── ui/               # Design system
│   ├── analytics/
│   ├── brandkit/
│   ├── content/
│   ├── ecommerce/
│   ├── generators/
│   ├── integrations/
│   ├── onboarding/
│   └── ...
├── functions/            # Backend serverless
└── Layout.js            # App wrapper`}
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Integration Architecture</h3>
                <div className="text-gray-300 space-y-3">
                  <p><strong>Outbox Pattern:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Operations enqueued to IntegrationOutbox with idempotency keys</li>
                    <li>dispatchOutbox processes queue with rate limiting and retries</li>
                    <li>reconcileIntegration detects and fixes stuck items</li>
                  </ol>
                  
                  <p className="mt-4"><strong>Supported Integrations:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Google: Calendar, Drive, Sheets, Docs, Slides</li>
                    <li>Communication: Slack, LinkedIn</li>
                    <li>Productivity: Notion</li>
                    <li>Social: TikTok</li>
                    <li>Custom: Extensible via backend functions</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Security</h3>
                <div className="text-gray-300 space-y-2">
                  <p><strong>Authentication:</strong> Base44 managed with role-based access control</p>
                  <p><strong>Authorization:</strong> Admin-only functions verify user.role === 'admin'</p>
                  <p><strong>Secrets:</strong> Environment variables and OAuth tokens via connectors</p>
                  <p><strong>Idempotency:</strong> Keys prevent duplicate external operations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changelog">
          <Changelog />
        </TabsContent>

        <TabsContent value="quickstart">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">For Entrepreneurs</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Select "Launch a Startup" during onboarding</li>
                  <li>Use Universal Generator to create your MVP</li>
                  <li>Connect integrations (Google, Slack) for automation</li>
                  <li>Track progress in Analytics dashboard</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">For Marketers</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Choose "Scale Content" during onboarding</li>
                  <li>Create brand kit with Brand Kit Generator</li>
                  <li>Generate content with Content Creator</li>
                  <li>Schedule publishing across platforms</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">For Investors</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Select "Find Deals" during onboarding</li>
                  <li>Configure investment criteria</li>
                  <li>Let AI source and score deals automatically</li>
                  <li>Review sentiment, predictions, and insights</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Credits System</h3>
                <div className="bg-gray-900 p-4 rounded-lg space-y-2 text-gray-300">
                  <p><strong>Free:</strong> 1,000 credits/month</p>
                  <p><strong>Creator:</strong> 50,000 credits/month ($49)</p>
                  <p><strong>Enterprise:</strong> Custom limits</p>
                  <p className="text-sm text-gray-400 mt-3">
                    Costs vary: Universal Gen (200-500), Feature Gen (50-100), Brand Kit (150), Content (50)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}