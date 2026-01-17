import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

export default function TutorialSpotlight({
  steps,
  currentStep,
  onNext,
  onPrev,
  onComplete,
  onSkip,
  tutorialTitle
}) {
  const [highlightRect, setHighlightRect] = useState(null);
  const step = steps[currentStep];

  useEffect(() => {
    if (step?.target_element) {
      const element = document.querySelector(step.target_element);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        });
      }
    }
  }, [step, currentStep]);

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onSkip} />

      {/* Highlight Box */}
      {highlightRect && (
        <div
          className="fixed border-2 border-blue-500 rounded-lg shadow-lg z-41 pointer-events-none"
          style={{
            top: `${highlightRect.top}px`,
            left: `${highlightRect.left}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)'
          }}
        />
      )}

      {/* Tooltip */}
      <Card className="fixed z-50 max-w-sm p-4 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{step.description}</p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {step.image_url && (
            <img
              src={step.image_url}
              alt={step.title}
              className="w-full rounded-lg"
            />
          )}

          {/* Progress */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <span>{currentStep + 1} of {steps.length}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isFirst && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPrev}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {isLast ? (
              <Button
                size="sm"
                onClick={onComplete}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Done
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onNext}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {step.cta_text || 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <button
            onClick={onSkip}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Skip Tutorial
          </button>
        </div>
      </Card>
    </>
  );
}