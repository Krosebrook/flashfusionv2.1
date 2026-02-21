import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Share2, Download, Copy, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StyleProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.StyleProfile.filter({ user_email: user.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">No profile found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#191121] text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center bg-transparent p-4 pb-2 justify-between">
        <button className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest flex-1 text-center opacity-80">
          Share Analysis
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 z-0"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-900/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>

        {/* Share Card */}
        <div className="relative z-10 w-full max-w-sm aspect-[4/5] bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Corner Accents */}
          <div className="absolute top-4 left-4 size-2 border-t border-l border-white/40"></div>
          <div className="absolute top-4 right-4 size-2 border-t border-r border-white/40"></div>
          <div className="absolute bottom-4 left-4 size-2 border-b border-l border-white/40"></div>
          <div className="absolute bottom-4 right-4 size-2 border-b border-r border-white/40"></div>

          {/* Card Header */}
          <div className="text-center space-y-1 mt-2">
            <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Style DNA Analysis</p>
            <h3 className="text-lg text-white font-medium">{profile.user_email.split('@')[0]}</h3>
          </div>

          {/* Archetype & Chart */}
          <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-4">
            <h1 className="text-4xl text-center font-bold text-white italic tracking-wide" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              {profile.archetype?.split(' ').map((word, i) => (
                <span key={i}>{word}<br/></span>
              ))}
            </h1>

            {/* Radar Chart */}
            <div className="relative size-48 flex items-center justify-center">
              <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 200 200">
                <polygon fill="none" points="100,20 176,76 147,164 53,164 24,76" stroke="rgba(255,255,255,0.1)" strokeWidth="1"></polygon>
                <polygon fill="none" points="100,40 157,82 135,148 65,148 43,82" stroke="rgba(255,255,255,0.1)" strokeWidth="1"></polygon>
                <polygon fill="none" points="100,60 138,88 123,132 77,132 62,88" stroke="rgba(255,255,255,0.1)" strokeWidth="1"></polygon>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="100" x2="100" y1="100" y2="20"></line>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="100" x2="176" y1="100" y2="76"></line>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="100" x2="147" y1="100" y2="164"></line>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="100" x2="53" y1="100" y2="164"></line>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="100" x2="24" y1="100" y2="76"></line>
                <polygon fill="rgba(115,23,207,0.2)" points="100,25 165,76 120,150 70,140 35,76" stroke="#7317cf" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 4px #7317cf)' }}></polygon>
                <circle cx="100" cy="25" fill="#fff" r="3"></circle>
                <circle cx="165" cy="76" fill="#fff" r="3"></circle>
                <circle cx="120" cy="150" fill="#fff" r="3"></circle>
                <circle cx="70" cy="140" fill="#fff" r="3"></circle>
                <circle cx="35" cy="76" fill="#fff" r="3"></circle>
              </svg>
              <span className="absolute top-0 text-[10px] uppercase tracking-wider text-purple-400 font-bold">Bold</span>
              <span className="absolute right-0 top-[35%] text-[10px] uppercase tracking-wider text-gray-400">Color</span>
              <span className="absolute right-4 bottom-[15%] text-[10px] uppercase tracking-wider text-gray-400">Form</span>
              <span className="absolute left-4 bottom-[15%] text-[10px] uppercase tracking-wider text-gray-400">Vol</span>
              <span className="absolute left-0 top-[35%] text-[10px] uppercase tracking-wider text-gray-400">Tex</span>
            </div>
          </div>

          {/* Signature Palette */}
          <div className="mb-6">
            <p className="text-xs text-center text-gray-400 uppercase tracking-wider mb-3">Signature Palette</p>
            <div className="flex justify-center gap-3">
              {profile.signature_colors?.map((color, idx) => (
                <div
                  key={idx}
                  className="size-8 rounded-full border border-white/20 shadow-lg"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl">S</div>
              <div>
                <p className="text-sm font-bold text-white leading-none">StyleDNA</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">AI Stylist</p>
              </div>
            </div>
            <div className="bg-white p-1 rounded-sm">
              <div className="grid grid-cols-4 grid-rows-4 gap-0.5 size-8">
                <div className="bg-black col-span-2 row-span-2"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black col-span-2 row-span-2 col-start-3 row-start-3"></div>
                <div className="bg-black row-start-3"></div>
                <div className="bg-black row-start-3"></div>
                <div className="bg-black row-start-4"></div>
                <div className="bg-black row-start-4"></div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm text-center px-8 mt-6">
          This card is optimized for Instagram stories and Pinterest pins.
        </p>
      </main>

      {/* Bottom Actions */}
      <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-white/5 p-6 pb-8 z-50">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button className="flex flex-col items-center gap-2 group">
            <div className="size-12 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all text-gray-300">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400">Share</span>
          </button>
          <button className="flex flex-col items-center gap-2 group">
            <div className="size-12 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all text-gray-300">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400">Save Image</span>
          </button>
          <button className="flex flex-col items-center gap-2 group">
            <div className="size-12 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all text-gray-300">
              <Copy className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400">Copy Link</span>
          </button>
        </div>
        <div className="flex gap-4">
          <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3.5 px-4 rounded-xl border border-white/10">
            <Download className="w-5 h-5 mr-2" />
            Save
          </Button>
          <Button className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(115,23,207,0.4)]">
            <Instagram className="w-5 h-5 mr-2" />
            Share Image
          </Button>
        </div>
      </footer>
    </div>
  );
}