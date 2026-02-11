import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  Rocket,
  Sparkles,
  Target,
  Users,
  Code,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

const goalOptions = [
  {
    id: 'entrepreneur',
    label: 'Launch a Startup',
    icon: Rocket,
    description: 'Build your MVP in days, not months',
    features: ['Universal Generator', 'Feature Generator', 'Analytics'],
  },
  {
    id: 'marketer',
    label: 'Scale Content',
    icon: Sparkles,
    description: 'Generate content 10x faster',
    features: ['Content Creator', 'Brand Kit', 'Scheduling'],
  },
  {
    id: 'investor',
    label: 'Find Deals',
    icon: Target,
    description: 'AI-powered deal sourcing & analysis',
    features: ['Deal Sourcer', 'Analytics', 'Insights'],
  },
  {
    id: 'agency',
    label: 'Deliver Projects',
    icon: Users,
    description: 'Ship client work faster',
    features: ['Collaboration', 'Content Creator', 'Workflows'],
  },
  {
    id: 'developer',
    label: 'Build Apps',
    icon: Code,
    description: 'Code generation & automation',
    features: ['Feature Generator', 'PRD Generator', 'Universal Gen'],
  },
  {
    id: 'other',
    label: 'Explore',
    icon: Zap,
    description: 'Discover all capabilities',
    features: ['All Features', 'Workflows', 'Integrations'],
  },
];

export default function WelcomeScreen({ user, onComplete, onStartTour }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedGoal) return;

    setIsSubmitting(true);
    try {
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email,
      });

      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          onboarding_goal: selectedGoal,
        });
      } else {
        await base44.entities.UserProfile.create({
          onboarding_goal: selectedGoal,
          onboarding_completed: false,
          tour_completed: false,
        });
      }

      onComplete(selectedGoal);
      if (onStartTour) onStartTour();
    } catch (error) {
      console.error('Failed to save onboarding goal:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <Card className="max-w-5xl w-full bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center border-b border-gray-700 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Welcome to FlashFusion, {user?.full_name?.split(' ')[0] || 'there'}!
          </CardTitle>
          <p className="text-gray-400 text-lg">
            Let's personalize your experience. What brings you here today?
          </p>
        </CardHeader>

        <CardContent className="pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {goalOptions.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.id;

              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-3 rounded-lg ${
                          isSelected
                            ? 'bg-blue-500/20'
                            : 'bg-gray-600/30'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isSelected ? 'text-blue-400' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {goal.label}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {goal.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {goal.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-300"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedGoal || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
            >
              {isSubmitting ? (
                'Setting up...'
              ) : (
                <>
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}