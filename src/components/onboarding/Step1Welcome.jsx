import React from 'react';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Step1Welcome({ onNext }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Welcome to DealFlow</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your intelligent platform for deal sourcing, portfolio management, and investment community.
        </p>
      </div>

      {/* Benefits Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 bg-blue-50">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Curated Deals</h3>
            <p className="text-sm text-gray-700">
              Get deal recommendations matched to your investment criteria and risk profile.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-purple-50">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Investor Network</h3>
            <p className="text-sm text-gray-700">
              Connect with like-minded investors, share opportunities, and build relationships.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-green-50">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Smart Analytics</h3>
            <p className="text-sm text-gray-700">
              Track portfolio performance and get insights on your investment decisions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3">
        <p className="font-semibold text-gray-900">What comes next?</p>
        <p className="text-sm text-gray-700">
          We'll ask a few quick questions about your investment preferences to personalize your experience. This usually takes about 5 minutes and you can adjust these settings anytime.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-base"
        >
          Let's Get Started
        </Button>
      </div>
    </div>
  );
}