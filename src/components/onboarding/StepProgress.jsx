import React from 'react';
import { Check } from 'lucide-react';

export default function StepProgress({ currentStep, totalSteps, steps }) {
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <p className={`text-xs mt-2 text-center font-medium max-w-20 ${
                isCurrent ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}