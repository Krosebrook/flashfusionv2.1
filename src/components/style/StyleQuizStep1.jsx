import { useState } from "react";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const aesthetics = [
  { id: "Minimalist", label: "Minimalist", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
  { id: "Boho-Chic", label: "Boho-Chic", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" },
  { id: "Streetwear", label: "Streetwear", image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400" },
  { id: "Classic Pro", label: "Classic Pro", image: "https://images.unsplash.com/photo-1507680225005-9e83c8f0e4f9?w=400" },
  { id: "Artsy", label: "Artsy", image: "https://images.unsplash.com/photo-1558769132-cb1aea1c8b18?w=400" },
  { id: "Sporty", label: "Sporty", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400" }
];

export default function StyleQuizStep1({ onComplete, progress }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (selected) {
      onComplete(selected);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md px-6 pt-12 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">Style Quiz</span>
            <span className="text-xs font-semibold text-gray-500">Step 1 of 3</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 pb-32">
        <section className="mt-8 mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
            Define Your Style
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Select your favorite aesthetic to help our AI curate your wardrobe.
          </p>
        </section>

        {/* Aesthetic Grid */}
        <div className="grid grid-cols-2 gap-4">
          {aesthetics.map((aesthetic) => (
            <button
              key={aesthetic.id}
              onClick={() => setSelected(aesthetic.id)}
              className={`relative group cursor-pointer overflow-hidden rounded-xl transition-all ${
                selected === aesthetic.id ? 'ring-2 ring-blue-600' : 'hover:ring-2 hover:ring-blue-600/50'
              }`}
            >
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 relative">
                <img
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={aesthetic.image}
                  alt={aesthetic.label}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                {selected === aesthetic.id && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1 shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg leading-tight">{aesthetic.label}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-transparent pt-8 pb-10 px-6">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleContinue}
            disabled={!selected}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-center text-xs text-gray-500 mt-4">
            You can change these preferences later in settings.
          </p>
        </div>
      </footer>
    </div>
  );
}