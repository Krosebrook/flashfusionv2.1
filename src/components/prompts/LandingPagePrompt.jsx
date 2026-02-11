import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPagePrompt() {
  const landingPrompt = `Create a high-converting landing page for "FlashFusion" - a Universal AI Platform

BRAND IDENTITY:
- App Name: FlashFusion
- Tagline: "Universal AI Platform"
- Logo: Stylized bot icon with gradient background (blue to purple)
- Color Palette:
  * Primary Gradient: #3B82F6 (blue) to #9333EA (purple)
  * Background: Dark (#111827) with subtle gradient to #1F2937
  * Card/Section backgrounds: #1F2937 with glassmorphism effect
  * Accent: #60A5FA (electric blue) and #A78BFA (light purple)
  * Text: White (#FFFFFF), light gray (#E5E7EB), dark gray (#6B7280)

CORE VALUE PROPOSITION:
"The only AI platform that generates apps, content, and business solutions in minutes - not months"

=== PAGE STRUCTURE ===

1. HERO SECTION (Above the fold)
- Headline: "Build Anything With AI"
- Subheadline: "Generate full-stack applications, marketing content, and business workflows using advanced AI agents"
- Primary CTA: "Start Free Trial" (gradient button)
- Secondary CTA: "Watch Demo" (outline button)
- Hero Visual: Animated dashboard mockup or AI workflow visualization
- Trust indicators: "10,000+ projects generated" "99% uptime"

2. PROBLEM/SOLUTION SECTION
- Problem headline: "Stop spending months on what AI can do in minutes"
- Solution: "FlashFusion combines 15+ specialized AI agents to automate your entire workflow"
- Visual: Before/After comparison or pain point icons

3. KEY FEATURES GRID (3 columns, 6 features)
Feature 1: "Universal Generator"
- Icon: Rocket
- Description: "Generate complete web apps, mobile apps, and desktop software from natural language"

Feature 2: "AI Agent Orchestration"
- Icon: Workflow
- Description: "Coordinate multiple AI agents to handle complex, multi-step business processes"

Feature 3: "Deal Intelligence"
- Icon: Target
- Description: "AI-powered deal sourcing with sentiment analysis, predictions, and smart recommendations"

Feature 4: "Content Creator Suite"
- Icon: Sparkles
- Description: "Generate marketing copy, social media posts, videos, and branded assets instantly"

Feature 5: "E-commerce Automation"
- Icon: ShoppingCart
- Description: "Auto-generate product listings, descriptions, and sync across 8+ platforms"

Feature 6: "Smart Analytics"
- Icon: BarChart
- Description: "Real-time insights, custom dashboards, and AI-generated business recommendations"

4. AI CAPABILITIES HIGHLIGHT
- Section headline: "Powered by Advanced AI"
- 4 capability cards:
  * "GPT-4, Claude, and 10+ LLMs" - Multi-model intelligence
  * "Real-time Web Search" - Always current information
  * "Vision & Document AI" - Process images, PDFs, and data
  * "Predictive Analytics" - ML-powered outcome forecasting

5. USE CASES / PERSONAS
- Entrepreneur: "Launch your startup MVP in days"
- Marketing Team: "Scale content production 10x"
- Investor: "Find and analyze deals faster"
- Agency: "Deliver client projects faster"

6. INTEGRATION ECOSYSTEM
- Headline: "Connects With Your Tools"
- Logo grid: Google Workspace, Slack, Notion, LinkedIn, TikTok, Shopify, WooCommerce, Stripe
- "15+ native integrations + custom API support"

7. SOCIAL PROOF
- Testimonial cards (3 featured)
- Company logos of users
- Stats: "500K+ AI tasks completed" "4.9/5 user rating"

8. PRICING SECTION
- 3 tiers:
  * Starter: Free - "Get started with 100 credits/month"
  * Pro: $49/month - "Unlimited generations, priority support"
  * Enterprise: Custom - "White-label, custom AI agents, SLA"
- Annual discount badge: "Save 20%"

9. FINAL CTA SECTION
- Headline: "Start Building With AI Today"
- Subheadline: "Join 10,000+ creators already using FlashFusion"
- Primary CTA: "Get Started Free" (gradient button)
- Secondary: "Schedule Demo"
- Visual: Abstract AI network background

10. FOOTER
- Logo + tagline
- Links: Features, Pricing, Docs, Blog, Support, Privacy, Terms
- Social icons: Twitter, LinkedIn, GitHub, Discord
- Copyright: "© 2026 FlashFusion. All rights reserved."

=== DESIGN GUIDELINES ===

VISUAL STYLE:
- Modern, futuristic aesthetic with glassmorphism cards
- Subtle gradient backgrounds throughout
- Dark theme with high contrast for readability
- Animated elements: Floating particles, gradient shifts, hover effects
- Generous white space between sections
- Consistent border-radius: 12px for cards, 8px for buttons

TYPOGRAPHY:
- Headlines: Bold, 48-72px, white
- Subheadlines: Medium, 24-32px, light gray
- Body: Regular, 16-18px, gray
- CTAs: Bold, 16-18px, white

ANIMATION & INTERACTIONS:
- Smooth scroll animations (fade-in, slide-up on scroll)
- Hover effects on cards (lift, glow)
- Gradient button hover states
- Parallax effect on hero section
- Micro-interactions on CTAs

LAYOUT:
- Max content width: 1280px
- Section padding: 80-120px vertical
- Grid system: 12-column
- Responsive breakpoints: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)

CONVERSION OPTIMIZATION:
- CTAs above the fold and every 2-3 sections
- Directional cues pointing to CTAs
- Trust signals near sign-up forms
- Exit-intent popup (optional): "Wait! Get 50 bonus credits"
- Chat widget: Bottom right corner

PERFORMANCE:
- Lazy load images below the fold
- Optimize for Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Progressive image loading
- Minified CSS/JS`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(landingPrompt);
    toast.success('Landing page prompt copied to clipboard!');
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Landing Page Generation Prompt
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
          {landingPrompt}
        </pre>
      </CardContent>
    </Card>
  );
}