import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle2, Clock } from 'lucide-react';

export default function TutorialHub() {
  const [tutorials, setTutorials] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutorials();
    fetchProgress();
  }, []);

  const fetchTutorials = async () => {
    try {
      const data = await base44.entities.OnboardingTutorial.filter({
        is_active: true
      }, '-priority', 10);
      setTutorials(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch tutorials:', err);
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email
      });
      if (profiles[0]?.tutorial_progress?.completed_tutorials) {
        setCompleted(profiles[0].tutorial_progress.completed_tutorials);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const startTutorial = async (tutorial) => {
    try {
      await base44.functions.invoke('triggerTutorial', {
        trigger_type: 'manual',
        page_name: tutorial.tutorial_id
      });
      // Navigate to tutorial view
      window.location.href = `/tutorials/${tutorial.tutorial_id}`;
    } catch (err) {
      console.error('Failed to start tutorial:', err);
    }
  };

  if (loading) return <div>Loading tutorials...</div>;

  const grouped = tutorials.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Interactive Tutorials</h2>
        <p className="text-gray-600 mt-1">Learn key features step-by-step</p>
      </div>

      {Object.entries(grouped).map(([category, tuts]) => (
        <div key={category}>
          <h3 className="font-semibold text-gray-900 mb-3 capitalize">{category.replace('_', ' ')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {tuts.map(tutorial => {
              const isCompleted = completed.includes(tutorial.tutorial_id);
              return (
                <Card
                  key={tutorial.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{tutorial.title}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">{tutorial.description}</p>
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tutorial.estimated_duration_seconds}s
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => startTutorial(tutorial)}
                        className="w-full gap-2"
                      >
                        <Play className="w-3 h-3" />
                        Start Tutorial
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}