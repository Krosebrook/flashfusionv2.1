import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { OnboardingProvider, useOnboarding } from '@/components/onboarding/OnboardingContext';
import StepProgress from '@/components/onboarding/StepProgress';
import Step1Welcome from '@/components/onboarding/Step1Welcome';
import Step2DealCriteria from '@/components/onboarding/Step2DealCriteria';
import Step3PortfolioGoals from '@/components/onboarding/Step3PortfolioGoals';
import Step4Community from '@/components/onboarding/Step4Community';
import Step5Summary from '@/components/onboarding/Step5Summary';
import QuickStartModal from '@/components/onboarding/QuickStartModal';
import { Card } from '@/components/ui/card';

const STEPS = [
  'Welcome',
  'Deal Criteria',
  'Goals',
  'Community',
  'Review'
];

function OnboardingContent() {
  const { formData, updateFormData } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0); // 0 = choice screen
  const [loading, setLoading] = useState(false);
  const [onboardingPath, setOnboardingPath] = useState(null); // 'full' or 'quick_start'

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Final step - save profile
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleQuickStartSelection = (selection) => {
    if (selection.path === 'quick_start') {
      setOnboardingPath('quick_start');
      // Pre-fill quick prefs
      updateFormData({
        ...formData,
        deal_sourcing_criteria: {
          ...formData.deal_sourcing_criteria,
          investment_size_range: selection.quick_prefs?.investment_size_range,
          risk_tolerance: selection.quick_prefs?.risk_tolerance
        }
      });
      // Jump to summary
      setCurrentStep(5);
    } else {
      setOnboardingPath('full');
      setCurrentStep(1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Save user profile
      await base44.entities.UserProfile.create({
        ...formData,
        onboarding_completed: true,
        onboarding_path: onboardingPath,
        quick_start_mode: onboardingPath === 'quick_start',
        onboarding_completed_at: new Date().toISOString()
      });

      // Generate initial nudges
      await base44.functions.invoke('generateNudges', {});

      // Redirect to dashboard
      window.location.href = '/Dashboard';
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setLoading(false);
    }
  };

  const renderStep = () => {
    // Show quick start choice
    if (currentStep === 0) {
      return <QuickStartModal onSelect={handleQuickStartSelection} />;
    }

    const stepProps = {
      data: currentStep === 2 ? formData.deal_sourcing_criteria : 
            currentStep === 3 ? formData.portfolio_goals :
            currentStep === 4 ? formData.community_preferences :
            formData,
      onUpdate: updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      isQuickStart: onboardingPath === 'quick_start'
    };

    switch (currentStep) {
      case 1:
        return <Step1Welcome onNext={handleNext} />;
      case 2:
        // Skip for quick start
        if (onboardingPath === 'quick_start') {
          handleNext();
          return null;
        }
        return <Step2DealCriteria {...stepProps} />;
      case 3:
        if (onboardingPath === 'quick_start') {
          handleNext();
          return null;
        }
        return <Step3PortfolioGoals {...stepProps} />;
      case 4:
        if (onboardingPath === 'quick_start') {
          handleNext();
          return null;
        }
        return <Step4Community {...stepProps} />;
      case 5:
        return <Step5Summary {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo/Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">DealFlow</h1>
          <p className="text-gray-600 mt-1">Intelligent Deal Sourcing & Portfolio Management</p>
        </div>

        {/* Progress - hide on choice screen */}
        {currentStep > 0 && (
          <div className="mb-8">
            <StepProgress 
              currentStep={currentStep} 
              totalSteps={STEPS.length}
              steps={STEPS}
            />
          </div>
        )}

        {/* Content */}
        {currentStep === 0 ? (
          renderStep()
        ) : (
          <Card className="bg-white shadow-lg border-0">
            <div className="p-8">
              {renderStep()}
            </div>
          </Card>
        )}

        {/* Footer */}
        {currentStep > 0 && (
          <p className="text-center text-sm text-gray-600 mt-6">
            {onboardingPath === 'quick_start' 
              ? 'Quick setup • You can customize later' 
              : 'Taking ~5 minutes • You can change these settings anytime'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}