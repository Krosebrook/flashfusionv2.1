import { useState } from "react";
import { ChevronLeft, Briefcase, Coffee, Wine, Dumbbell, Heart, Plane, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const occasions = [
  { id: "Work/Office", label: "Work/Office", icon: Briefcase },
  { id: "Casual Outings", label: "Casual Outings", icon: Coffee },
  { id: "Evening/Gala", label: "Evening/Gala", icon: Wine },
  { id: "Gym/Athleisure", label: "Gym/Athleisure", icon: Dumbbell },
  { id: "Date Night", label: "Date Night", icon: Heart },
  { id: "Travel", label: "Travel", icon: Plane },
  { id: "Special Events", label: "Special Events", icon: PartyPopper }
];

export default function StyleQuizStep3({ onComplete, progress }) {
  const [selected, setSelected] = useState(["Casual Outings", "Gym/Athleisure"]);

  const toggleOccasion = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (selected.length > 0) {
      onComplete(selected);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Step 3 of 3</h2>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pt-2 pb-32">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-tighter">Completion</span>
            <span className="text-3xl font-extrabold leading-none tracking-tighter">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-600/10 text-purple-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            Final Step
          </span>
          <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-tight mb-4 text-gray-900 dark:text-white">
            What occasions do you dress for most?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
            Select your lifestyle needs so your AI stylist can curate the perfect wardrobe for every moment.
          </p>
        </div>

        {/* Multi-select Chips Grid */}
        <div className="flex flex-wrap gap-3 mb-10">
          {occasions.map((occasion) => {
            const Icon = occasion.icon;
            const isSelected = selected.includes(occasion.id);
            return (
              <button
                key={occasion.id}
                onClick={() => toggleOccasion(occasion.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-purple-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-sm font-semibold">{occasion.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lifestyle Image Preview */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 group">
          <img
            alt="High-end fashion editorial"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <p className="text-white text-xs font-medium uppercase tracking-widest opacity-80">AI Analysis Ready</p>
            <p className="text-white font-bold">Curating your unique vibe...</p>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent">
        <Button
          onClick={handleGenerate}
          disabled={selected.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-full flex items-center justify-center gap-3 shadow-2xl shadow-purple-600/40 active:scale-[0.98] transition-all"
        >
          <span>Generate My Style Profile</span>
          <Sparkles className="w-5 h-5" />
        </Button>
        <p className="text-center mt-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">
          Personalized results in 5 seconds
        </p>
      </div>
    </div>
  );
}