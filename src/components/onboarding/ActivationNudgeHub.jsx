import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import NudgeCard from './NudgeCard';

export default function ActivationNudgeHub({ maxNudges = 3 }) {
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNudges();
  }, []);

  const fetchNudges = async () => {
    try {
      const data = await base44.entities.UserNudge.filter({
        status: 'shown'
      }, '-created_date', maxNudges);
      setNudges(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch nudges:', err);
      setLoading(false);
    }
  };

  const handleDismiss = async (nudgeId) => {
    try {
      await base44.entities.UserNudge.update(nudgeId, {
        status: 'dismissed',
        dismissed_at: new Date().toISOString()
      });
      setNudges(nudges.filter(n => n.id !== nudgeId));
    } catch (err) {
      console.error('Failed to dismiss nudge:', err);
    }
  };

  const handleAction = async (nudgeId) => {
    try {
      await base44.entities.UserNudge.update(nudgeId, {
        status: 'actioned',
        clicked_at: new Date().toISOString()
      });
      setNudges(nudges.filter(n => n.id !== nudgeId));
    } catch (err) {
      console.error('Failed to action nudge:', err);
    }
  };

  if (loading || nudges.length === 0) return null;

  return (
    <div className="space-y-3">
      {nudges.map(nudge => (
        <NudgeCard
          key={nudge.id}
          nudge={nudge}
          onDismiss={handleDismiss}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}