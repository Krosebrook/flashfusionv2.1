import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Edit2 } from 'lucide-react';

export default function Step5Summary({ data, onNext, onBack }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Profile</h2>
        <p className="text-gray-600">Everything looks good. Confirm to complete onboarding.</p>
      </div>

      {/* Deal Criteria Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Deal Sourcing Criteria
            <Button variant="ghost" size="sm" className="ml-auto">
              <Edit2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Industries</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.deal_sourcing_criteria.target_industries.map(ind => (
                  <span key={ind} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Investment Range</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                ${data.deal_sourcing_criteria.investment_size_min}M - ${data.deal_sourcing_criteria.investment_size_max}M
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Deal Structures</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.deal_sourcing_criteria.deal_structures.map(str => (
                  <span key={str} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {str}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Regions</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.deal_sourcing_criteria.geographic_preferences.map(region => (
                  <span key={region} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {region}
                  </span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 font-medium">Risk Tolerance</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
                {data.deal_sourcing_criteria.risk_tolerance}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Goals Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Portfolio Goals
            <Button variant="ghost" size="sm" className="ml-auto">
              <Edit2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Time Horizon</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
                {data.portfolio_goals.time_horizon.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Target Annual Return</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {data.portfolio_goals.target_annual_return}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Diversification</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
                {data.portfolio_goals.diversification_strategy}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Sector Priorities</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.portfolio_goals.sector_priorities.map(sector => (
                  <span key={sector} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Community Preferences
            <Button variant="ghost" size="sm" className="ml-auto">
              <Edit2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Peer Groups</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.community_preferences.peer_group_interests.map(group => (
                  <span key={group} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {group}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Engagement Style</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
                {data.community_preferences.engagement_preference.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Notifications</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
                {data.community_preferences.notification_frequency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Profile Visibility</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
                {data.community_preferences.privacy_level.replace('_', ' ')}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 font-medium">Share Deals</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {data.community_preferences.willing_to_share_deals ? '✓ Yes' : '✗ No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <p className="font-semibold text-gray-900">Ready to explore deals?</p>
        <p className="text-sm text-gray-700">
          Your personalized dashboard is ready. You can update these preferences anytime in settings.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 text-base"
        >
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}