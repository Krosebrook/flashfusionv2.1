import React, { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { base44 } from '@/api/base44Client';

const goalBasedSteps = {
  entrepreneur: [
    {
      target: '[data-tour="integrations"]',
      content: 'Connect your tools here - Google Workspace, Slack, and more to supercharge your workflow.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="universal-generator"]',
      content: 'Generate complete applications from simple descriptions. Your MVP starts here.',
    },
    {
      target: '[data-tour="feature-generator"]',
      content: 'Convert feature ideas into production-ready code instantly.',
    },
    {
      target: '[data-tour="analytics"]',
      content: 'Track usage, monitor AI-generated insights, and make data-driven decisions.',
    },
  ],
  marketer: [
    {
      target: '[data-tour="content-creator"]',
      content: 'Create blog posts, social media content, and marketing copy with AI - all in one place.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="brand-kit"]',
      content: 'Generate a complete brand identity including logos, colors, and voice guidelines.',
    },
    {
      target: '[data-tour="content-scheduling"]',
      content: 'Schedule your AI-generated content across multiple platforms automatically.',
    },
    {
      target: '[data-tour="analytics"]',
      content: 'Measure content performance and get AI-powered recommendations for improvement.',
    },
  ],
  investor: [
    {
      target: '[data-tour="deal-sourcer"]',
      content: 'AI-powered deal sourcing with sentiment analysis, predictions, and smart recommendations.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="analytics"]',
      content: 'Track deal pipeline, analyze trends, and get predictive insights.',
    },
    {
      target: '[data-tour="integrations"]',
      content: 'Connect to CRMs, data sources, and communication tools for seamless deal flow.',
    },
  ],
  agency: [
    {
      target: '[data-tour="collaboration"]',
      content: 'Real-time collaboration with your team on projects and client deliverables.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="content-creator"]',
      content: 'Generate content for clients across multiple platforms and formats.',
    },
    {
      target: '[data-tour="team-management"]',
      content: 'Manage team roles, permissions, and track project assignments.',
    },
  ],
  developer: [
    {
      target: '[data-tour="feature-generator"]',
      content: 'Convert feature ideas into production-ready code instantly.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="prd-generator"]',
      content: 'Generate comprehensive PRDs and technical specifications.',
    },
    {
      target: '[data-tour="universal-generator"]',
      content: 'Build complete applications from natural language descriptions.',
    },
    {
      target: '[data-tour="integrations"]',
      content: 'Connect to your dev tools - GitHub, Notion, Slack, and more.',
    },
  ],
  other: [
    {
      target: '[data-tour="dashboard"]',
      content: 'Your command center - track credits, usage, and access all features from here.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="universal-generator"]',
      content: 'Generate complete applications and features from natural language.',
    },
    {
      target: '[data-tour="integrations"]',
      content: 'Connect your favorite tools to unlock powerful automations.',
    },
    {
      target: '[data-tour="billing"]',
      content: 'Manage your subscription and monitor credit usage here.',
    },
  ],
};

export default function InteractiveTour({ goal, userEmail, onComplete }) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Start tour after a brief delay to ensure DOM is ready
    const timer = setTimeout(() => setRun(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const steps = goalBasedSteps[goal] || goalBasedSteps.other;

  const handleJoyrideCallback = async (data) => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Mark tour as completed
      try {
        const profiles = await base44.entities.UserProfile.filter({
          created_by: userEmail,
        });

        if (profiles.length > 0) {
          await base44.entities.UserProfile.update(profiles[0].id, {
            tour_completed: true,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to mark tour as completed:', error);
      }

      setRun(false);
      if (onComplete) onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3B82F6',
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: '#1F2937',
          color: '#FFFFFF',
          borderRadius: '12px',
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
          borderRadius: '8px',
        },
        buttonBack: {
          color: '#9CA3AF',
        },
        buttonSkip: {
          color: '#9CA3AF',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}