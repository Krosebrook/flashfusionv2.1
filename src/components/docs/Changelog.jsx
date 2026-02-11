import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Changelog() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Changelog</CardTitle>
          <p className="text-gray-400">All notable changes to FlashFusion</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-blue-600">v2.0.0</Badge>
              <span className="text-gray-400">2026-02-11</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Major Refactoring & Cleanup</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-red-400 mb-2">Removed</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Agent Orchestration System pages and components</li>
                  <li>Agent Marketplace and Agent Collaboration pages</li>
                  <li>AgentTask and AgentTemplate entities</li>
                  <li>Complex agent-specific navigation items</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-yellow-400 mb-2">Changed</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Streamlined navigation - removed agent-specific items</li>
                  <li>Updated Dashboard to focus on core generators</li>
                  <li>Simplified onboarding tour paths</li>
                  <li>Improved quick actions and feature cards</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-green-400 mb-2">Improved</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Code quality and maintainability</li>
                  <li>User experience with clearer feature focus</li>
                  <li>Performance by reducing bundle size</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-600">v1.5.0</Badge>
              <span className="text-gray-400">2026-02-10</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Interactive Onboarding</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Added personalized welcome screen</li>
              <li>Role-based tour paths (entrepreneur, marketer, investor, agency, developer)</li>
              <li>UserProfile.onboarding_goal tracking</li>
              <li>Real-time tour guidance using react-joyride</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-600">v1.4.0</Badge>
              <span className="text-gray-400">2026-02-09</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Integration Reliability</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Generic integration reconciliation system</li>
              <li>ReconcileRun entity for audit trails</li>
              <li>IntegrationConfig for centralized settings</li>
              <li>Improved error handling and rate limit management</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-600">v1.3.0</Badge>
              <span className="text-gray-400">2026-02-08</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Integration Outbox Pattern</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>IntegrationOutbox entity with retry logic</li>
              <li>dispatchOutbox function with rate limiting</li>
              <li>Email, SMS, and notification logging</li>
              <li>Idempotency guarantees</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-600">v1.2.0</Badge>
              <span className="text-gray-400">2026-02-07</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Deal Intelligence</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Deal Sourcer with AI-powered analysis</li>
              <li>Sentiment analysis and outcome prediction</li>
              <li>Deal collaboration tools (notes, tasks)</li>
              <li>Pipeline management</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-green-600">v1.0.0</Badge>
              <span className="text-gray-400">2026-02-01</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Initial Release</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Universal AI Platform launch</li>
              <li>Core generators: Universal, Feature, PRD, BrandKit</li>
              <li>E-commerce suite and content creator</li>
              <li>Analytics dashboard and team collaboration</li>
              <li>Integration hub with OAuth connectors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}