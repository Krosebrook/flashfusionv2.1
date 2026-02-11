import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function SplashPagePrompt() {
  const splashPrompt = `Create a modern, engaging splash page for "FlashFusion" - a Universal AI Platform

BRAND IDENTITY:
- App Name: FlashFusion
- Tagline: "Universal AI Platform"
- Logo: Stylized bot icon in a rounded square
- Color Palette:
  * Primary: Blue to Purple gradient (#3B82F6 to #9333EA)
  * Background: Dark gray (#111827)
  * Accent: Electric blue (#60A5FA)
  * Text: White (#FFFFFF) and light gray (#E5E7EB)

DESIGN REQUIREMENTS:
- Full-screen immersive design
- Minimalist with high visual impact
- Modern glassmorphism or gradient mesh background
- Subtle animated elements (floating particles, gradient shifts, or pulsing glow)
- Single prominent call-to-action button

CONTENT:
- Hero Headline: "Transform Ideas Into Reality With AI"
- Subheadline: "The only platform you need to generate, automate, and scale"
- Primary CTA Button: "Enter FlashFusion" (with gradient background)
- Logo placement: Top center or center of screen
- Optional: Subtle rotating feature words (e.g., "Generate • Automate • Scale • Deploy")

VISUAL STYLE:
- Futuristic and sophisticated
- Clean, uncluttered layout
- High-quality abstract AI/tech background (neural networks, data flows, or geometric patterns)
- Smooth animations (fade-ins, gentle pulse effects)
- Mobile-responsive design

TECHNICAL SPECIFICATIONS:
- Keep load time under 2 seconds
- Ensure accessibility (WCAG AA compliance)
- Include skip button for returning users (subtle, bottom right)
- Auto-transition to landing page after 3 seconds OR on CTA click`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(splashPrompt);
    toast.success('Splash page prompt copied to clipboard!');
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Splash Page Generation Prompt
          <Button 
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
          {splashPrompt}
        </pre>
      </CardContent>
    </Card>
  );
}