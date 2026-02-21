import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const colorPalettes = [
  { id: "Neutrals", label: "Neutrals", colors: ["#FFFFFF", "#E5E7EB", "#374151", "#000000", "#D1D5DB"] },
  { id: "Earth Tones", label: "Earth Tones", colors: ["#6B705C", "#A5A58D", "#CB997E", "#B7B7A4", "#7B3F00"] },
  { id: "Pastels", label: "Pastels", colors: ["#F8D7DA", "#D1E7DD", "#FFF3CD", "#CFE2FF", "#E2E3E5"] },
  { id: "Jewel Tones", label: "Jewel Tones", colors: ["#0047AB", "#50C878", "#9B111E", "#4B0082", "#FFD700"] }
];

const patterns = [
  { id: "Solid", label: "Solid", icon: "▪️" },
  { id: "Stripes", label: "Stripes", icon: "📏" },
  { id: "Florals", label: "Florals", icon: "🌸" },
  { id: "Plaid", label: "Plaid", icon: "⚡" }
];

export default function StyleQuizStep2({ onComplete, progress }) {
  const [selectedColors, setSelectedColors] = useState(["Neutrals"]);
  const [selectedPatterns, setSelectedPatterns] = useState(["Solid"]);

  const toggleColor = (id) => {
    setSelectedColors(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePattern = (id) => {
    setSelectedPatterns(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedColors.length > 0 && selectedPatterns.length > 0) {
      onComplete(selectedColors, selectedPatterns);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-2 justify-between">
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10">Style Quiz</h2>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2 px-6 pt-4">
        <div className="flex justify-between items-end">
          <p className="text-sm font-semibold">Step 2 of 3</p>
          <p className="text-xs text-gray-500">Color & Patterns</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <h1 className="text-2xl font-bold leading-tight pt-8 pb-6">Which colors dominate your wardrobe?</h1>

        {/* Color Palettes */}
        <div className="grid grid-cols-1 gap-4">
          {colorPalettes.map((palette) => (
            <label
              key={palette.id}
              className={`relative flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedColors.includes(palette.id)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedColors.includes(palette.id)}
                onChange={() => toggleColor(palette.id)}
              />
              <div className="flex justify-between items-center">
                <span className="font-bold text-base">{palette.label}</span>
                <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                  selectedColors.includes(palette.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {selectedColors.includes(palette.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="size-8 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </label>
          ))}
        </div>

        {/* Patterns */}
        <h3 className="text-xl font-bold pt-10 pb-4">Patterns you love</h3>
        <div className="grid grid-cols-2 gap-4 pb-12">
          {patterns.map((pattern) => (
            <label
              key={pattern.id}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPatterns.includes(pattern.id)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedPatterns.includes(pattern.id)}
                onChange={() => togglePattern(pattern.id)}
              />
              <div className="text-3xl">{pattern.icon}</div>
              <span className="text-sm font-medium">{pattern.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
        <Button
          onClick={handleContinue}
          disabled={selectedColors.length === 0 || selectedPatterns.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl"
        >
          Next
        </Button>
      </div>
    </div>
  );
}