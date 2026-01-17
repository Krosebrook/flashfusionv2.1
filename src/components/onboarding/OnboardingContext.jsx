import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    deal_sourcing_criteria: {
      target_industries: [],
      investment_size_min: 1,
      investment_size_max: 10,
      deal_structures: [],
      geographic_preferences: [],
      risk_tolerance: 'moderate'
    },
    portfolio_goals: {
      time_horizon: 'medium_term',
      target_annual_return: 15,
      diversification_strategy: 'balanced',
      sector_priorities: []
    },
    community_preferences: {
      peer_group_interests: [],
      engagement_preference: 'both',
      notification_frequency: 'weekly',
      privacy_level: 'semi_private',
      willing_to_share_deals: false
    }
  });

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const value = {
    formData,
    setFormData,
    updateFormData
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};