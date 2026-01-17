import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Tooltip from './Tooltip';

const PEER_GROUPS = [
  'Angel Syndicates',
  'LP Networks',
  'Startup Founders',
  'Corporate VCs',
  'Growth Stage Investors',
  'Industry Specialists'
];

export default function Step4Community({ data, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const togglePeerGroup = (group) => {
    const updated = data.peer_group_interests.includes(group)
      ? data.peer_group_interests.filter(g => g !== group)
      : [...data.peer_group_interests, group];
    onUpdate('community_preferences', { peer_group_interests: updated });
  };

  const validate = () => {
    const newErrors = {};
    if (data.peer_group_interests.length === 0) newErrors.groups = 'Select at least one peer group';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Join Our Investor Community</h2>
        <p className="text-gray-600 mt-1">Connect with peers, share insights, and collaborate</p>
      </div>

      {/* Peer Group Interests */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Types of Peer Groups</CardTitle>
            <Tooltip text="Select communities aligned with your interests and experience level." />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {PEER_GROUPS.map(group => (
            <label key={group} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400" style={{
              borderColor: data.peer_group_interests.includes(group) ? '#2563eb' : '#e5e7eb',
              backgroundColor: data.peer_group_interests.includes(group) ? '#eff6ff' : 'white'
            }}>
              <input
                type="checkbox"
                checked={data.peer_group_interests.includes(group)}
                onChange={() => togglePeerGroup(group)}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium text-gray-900">{group}</span>
            </label>
          ))}
          {errors.groups && <p className="text-sm text-red-600">{errors.groups}</p>}
        </CardContent>
      </Card>

      {/* Engagement Preference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>How Do You Want to Engage?</CardTitle>
            <Tooltip text="Are you primarily looking to network, learn, or both?" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { value: 'networking', label: 'Networking', desc: 'Build relationships and find deal partners' },
            { value: 'knowledge_sharing', label: 'Knowledge Sharing', desc: 'Share insights and learn from others' },
            { value: 'both', label: 'Both Equally', desc: 'Mix networking and learning' }
          ].map(opt => (
            <label key={opt.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer" style={{
              borderColor: data.engagement_preference === opt.value ? '#9333ea' : '#e5e7eb',
              backgroundColor: data.engagement_preference === opt.value ? '#faf5ff' : 'white'
            }}>
              <input
                type="radio"
                name="engagement"
                value={opt.value}
                checked={data.engagement_preference === opt.value}
                onChange={() => onUpdate('community_preferences', { engagement_preference: opt.value })}
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{opt.label}</p>
                <p className="text-sm text-gray-600">{opt.desc}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Notification Frequency</CardTitle>
            <Tooltip text="How often would you like to hear from the community?" />
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={data.notification_frequency}
            onValueChange={(value) => onUpdate('community_preferences', { notification_frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
              <SelectItem value="monthly">Monthly Newsletter</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Privacy & Sharing</CardTitle>
            <Tooltip text="Control how visible your profile is and what you share with the community." />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900 block mb-3">Profile Visibility</label>
            <Select
              value={data.privacy_level}
              onValueChange={(value) => onUpdate('community_preferences', { privacy_level: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (Only you see your profile)</SelectItem>
                <SelectItem value="semi_private">Semi-Private (Visible to verified investors)</SelectItem>
                <SelectItem value="public">Public (Visible to all community members)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-400">
            <input
              type="checkbox"
              checked={data.willing_to_share_deals}
              onChange={(e) => onUpdate('community_preferences', { willing_to_share_deals: e.target.checked })}
              className="w-4 h-4"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Share Deal Opportunities</p>
              <p className="text-sm text-gray-600">Opt-in to share interesting deals with your network</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => validate() && onNext()}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          Review & Confirm
        </Button>
      </div>
    </div>
  );
}