import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, Lock, Zap } from 'lucide-react';

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Fetch user profile
        const profiles = await base44.entities.UserProfile.filter({
          created_by: currentUser.email
        });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <Settings className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="investment" className="gap-2">
            <Zap className="w-4 h-4" />
            Investment
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
                <Input value={user?.full_name || ''} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
                <Input value={user?.email || ''} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Role</label>
                <div className="flex items-center gap-2">
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment Tab */}
        <TabsContent value="investment" className="space-y-4">
          {profile ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Deal Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Industries</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.deal_sourcing_criteria.target_industries.map(ind => (
                        <Badge key={ind} className="bg-blue-100 text-blue-800">{ind}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Investment Range</p>
                    <p className="text-gray-900">
                      ${profile.deal_sourcing_criteria.investment_size_min}M - ${profile.deal_sourcing_criteria.investment_size_max}M
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Risk Tolerance</p>
                    <Badge variant="outline" className="capitalize">
                      {profile.deal_sourcing_criteria.risk_tolerance}
                    </Badge>
                  </div>

                  <Button className="w-full mt-4">Edit Deal Criteria</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Time Horizon</p>
                    <p className="text-gray-900 capitalize">
                      {profile.portfolio_goals.time_horizon.replace('_', ' ')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Target Annual Return</p>
                    <p className="text-gray-900 font-semibold">{profile.portfolio_goals.target_annual_return}%</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Diversification</p>
                    <Badge variant="outline" className="capitalize">
                      {profile.portfolio_goals.diversification_strategy}
                    </Badge>
                  </div>

                  <Button className="w-full mt-4">Edit Portfolio Goals</Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-gray-600">Complete onboarding to set investment preferences.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {profile ? (
            <Card>
              <CardHeader>
                <CardTitle>Community Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Notification Frequency</p>
                  <Badge variant="outline" className="capitalize">
                    {profile.community_preferences.notification_frequency}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Engagement Preference</p>
                  <Badge variant="outline" className="capitalize">
                    {profile.community_preferences.engagement_preference.replace('_', ' ')}
                  </Badge>
                </div>

                <Button className="w-full mt-4">Edit Notification Settings</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-gray-600">Complete onboarding to customize notifications.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Profile Visibility</p>
                    <Badge variant="outline" className="capitalize">
                      {profile.community_preferences.privacy_level.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Share Deal Opportunities</p>
                    <p className="text-gray-900">
                      {profile.community_preferences.willing_to_share_deals ? '✓ Enabled' : '✗ Disabled'}
                    </p>
                  </div>
                </>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-4">Danger Zone</p>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}