import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Webhook, Book } from 'lucide-react';
import APIKeyManager from '../components/api/APIKeyManager';
import WebhookManager from '../components/api/WebhookManager';
import APIDocumentation from '../components/api/APIDocumentation';

export default function APIWebhooks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Key className="w-8 h-8 text-blue-400" />
          API & Webhooks
        </h1>
        <p className="text-gray-400 mt-2">
          Manage API keys, webhook subscriptions, and view documentation
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="api-keys">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <Book className="w-4 h-4 mr-2" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="mt-6">
          <APIKeyManager />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <APIDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}