import React, { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function OnboardingComplete() {
  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = createPageUrl('Dashboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* Animation */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-transparent bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">You're All Set!</h1>
          <p className="text-xl text-gray-600">
            Your investment profile is ready. Let's find some amazing deals.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-gray-700">
              ✓ Your deal criteria configured<br />
              ✓ Portfolio goals aligned<br />
              ✓ Community network ready
            </p>
          </div>

          <Button
            onClick={() => window.location.href = createPageUrl('Dashboard')}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 text-base gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-600">
          Redirecting in 3 seconds...
        </p>
      </div>
    </div>
  );
}