import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { OnboardingProvider, useOnboarding } from '@/components/onboarding/OnboardingContext';
import StepProgress from '@/components/onboarding/StepProgress';
import Step1Welcome from '@/components/onboarding/Step1Welcome';
import Step2DealCriteria from '@/components/onboarding/Step2DealCriteria';
import Step3PortfolioGoals from '@/components/onboarding/Step3PortfolioGoals';
import Step4Community from '@/components/onboarding/Step4Community';
import Step5Summary from '@/components/onboarding/Step5Summary';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const handleComplete = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Save user profile
      await base44.entities.UserProfile.create({
        ...formData,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      });

      // Update current user to mark onboarding as done
      await base44.auth.updateMe({
        onboarding_completed: true
      });

      // Redirect to dashboard
      window.location.href = '/Dashboard';
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: currentStep === 2 ? formData.deal_sourcing_criteria : 
            currentStep === 3 ? formData.portfolio_goals :
            currentStep === 4 ? formData.community_preferences :
            formData,
      onUpdate: updateFormData,
      onNext: handleNext,
      onBack: handleBack
    };

    switch (currentStep) {
      case 1:
        return <Step1Welcome onNext={handleNext} />;
      case 2:
        return <Step2DealCriteria {...stepProps} />;
      case 3:
        return <Step3PortfolioGoals {...stepProps} />;
      case 4:
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

        {/* Progress */}
        <div className="mb-8">
          <StepProgress 
            currentStep={currentStep} 
            totalSteps={STEPS.length}
            steps={STEPS}
          />
        </div>

        {/* Content */}
        <Card className="bg-white shadow-lg border-0">
          <div className="p-8">
            {renderStep()}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Taking ~5 minutes • You can change these settings anytime
        </p>
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