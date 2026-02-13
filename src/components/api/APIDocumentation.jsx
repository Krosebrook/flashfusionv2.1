import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Lock, Zap } from 'lucide-react';

export default function APIDocumentation() {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            API Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            FlashFusion provides a RESTful API for programmatic access to your data.
            All API requests require authentication using an API key.
          </p>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Base URL</p>
            <code className="text-blue-300">https://your-app.base44.com/api</code>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-300">
            Include your API key in the request header:
          </p>
          <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
            <span className="text-gray-400">curl -H </span>
            <span className="text-green-400">"X-API-Key: ffl_your_api_key_here"</span>
            <span className="text-gray-400"> \</span><br />
            <span className="text-gray-400 ml-4">https://your-app.base44.com/api/deals</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deals Endpoint */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Deals</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-green-600">GET</Badge>
                  <code className="text-sm">/api/deals</code>
                </div>
                <p className="text-sm text-gray-400">List all deals</p>
                <div className="bg-gray-900 p-3 rounded mt-2 text-xs font-mono">
                  ?limit=50&status=active
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-green-600">GET</Badge>
                  <code className="text-sm">/api/deals?id=:id</code>
                </div>
                <p className="text-sm text-gray-400">Get a specific deal</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-600">POST</Badge>
                  <code className="text-sm">/api/deals</code>
                </div>
                <p className="text-sm text-gray-400">Create a new deal</p>
                <div className="bg-gray-900 p-3 rounded mt-2 text-xs font-mono">
                  {`{
  "company_name": "Acme Inc",
  "industry": "Technology",
  "stage": "series_a"
}`}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-yellow-600">PUT</Badge>
                  <code className="text-sm">/api/deals?id=:id</code>
                </div>
                <p className="text-sm text-gray-400">Update a deal</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-red-600">DELETE</Badge>
                  <code className="text-sm">/api/deals?id=:id</code>
                </div>
                <p className="text-sm text-gray-400">Delete a deal</p>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Response Format</h4>
            <div className="bg-gray-900 p-3 rounded text-xs font-mono">
              {`{
  "data": [...],
  "count": 10
}`}
            </div>
          </div>

          {/* Error Handling */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Error Responses</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">401</Badge>
                <span className="text-gray-400">Unauthorized - Invalid API key</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">403</Badge>
                <span className="text-gray-400">Forbidden - Insufficient permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">404</Badge>
                <span className="text-gray-400">Not Found - Resource doesn't exist</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">429</Badge>
                <span className="text-gray-400">Rate Limit Exceeded</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            Webhooks allow you to receive real-time notifications when events occur in your app.
          </p>
          <div>
            <h4 className="font-semibold mb-2">Webhook Payload</h4>
            <div className="bg-gray-900 p-4 rounded font-mono text-xs">
              {`{
  "event": "deal.created",
  "timestamp": "2026-02-13T10:30:00Z",
  "data": {
    "id": "deal_123",
    "company_name": "Acme Inc",
    ...
  }
}`}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Signature Verification</h4>
            <p className="text-sm text-gray-400 mb-2">
              Verify webhook authenticity using the X-Webhook-Signature header:
            </p>
            <div className="bg-gray-900 p-4 rounded font-mono text-xs">
              {`const crypto = require('crypto');
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const hash = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
  
if (hash !== signature) {
  throw new Error('Invalid signature');
}`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}