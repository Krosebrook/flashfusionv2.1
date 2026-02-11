import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SplashPagePrompt from '../components/prompts/SplashPagePrompt';
import LandingPagePrompt from '../components/prompts/LandingPagePrompt';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PromptGenerator() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Page Generation Prompts
            </h1>
            <p className="text-gray-400">
              Copy these prompts to generate your splash and landing pages in external tools
            </p>
          </div>
          <Button
            onClick={() => window.open('https://stitch.withgoogle.com', '_blank')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Stitch
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <CardTitle className="text-white">How to Use</CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              Follow these steps to generate your pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-blue-400 font-bold mb-2">Step 1</div>
                <p className="text-gray-300 text-sm">
                  Copy the prompt from the tabs below (Splash or Landing Page)
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-purple-400 font-bold mb-2">Step 2</div>
                <p className="text-gray-300 text-sm">
                  Open stitch.withgoogle.com and paste the prompt into the generation tool
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-green-400 font-bold mb-2">Step 3</div>
                <p className="text-gray-300 text-sm">
                  Review, customize, and export the generated HTML/CSS code
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="splash" className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="splash" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
              Splash Page Prompt
            </TabsTrigger>
            <TabsTrigger value="landing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
              Landing Page Prompt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="splash" className="space-y-4">
            <SplashPagePrompt />
          </TabsContent>

          <TabsContent value="landing" className="space-y-4">
            <LandingPagePrompt />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}