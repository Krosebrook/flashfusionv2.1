import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, ChevronRight } from 'lucide-react';

export default function QuickStartModal({ onSelect }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');

  const handleQuickStart = () => {
    if (selectedSize && selectedRisk) {
      onSelect({
        path: 'quick_start',
        quick_prefs: {
          investment_size_range: selectedSize,
          risk_tolerance: selectedRisk
        }
      });
    }
  };

  const handleFullOnboarding = () => {
    onSelect({ path: 'full' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <CardTitle>Get Started in Seconds</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Jump straight into deal discovery or customize your preferences
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Start Path */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Quick Start (2 min)</h3>
            <p className="text-xs text-gray-600">
              Answer 2 questions, unlock the app, customize later
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Investment Size Range
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1m">$0M - $1M</SelectItem>
                    <SelectItem value="1-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5-20m">$5M - $20M</SelectItem>
                    <SelectItem value="20m+">$20M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Risk Appetite
                </label>
                <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleQuickStart}
              disabled={!selectedSize || !selectedRisk}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Start with Quick Setup
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-600">or</span>
            </div>
          </div>

          {/* Full Onboarding Path */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Full Setup (10 min)</h3>
            <p className="text-xs text-gray-600">
              Complete profile → better recommendations & personalization
            </p>
            <Button
              onClick={handleFullOnboarding}
              variant="outline"
              className="w-full"
            >
              Full Onboarding Wizard
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can update preferences anytime in Settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}