import { useEffect, useState } from "react";
import { X, Wifi, Battery, Signal } from "lucide-react";

export default function AIProfileGeneration() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col justify-between overflow-hidden px-6 pt-12 pb-8 bg-gray-900 text-white">
      {/* Top Status Bar */}
      <div className="flex justify-between items-center w-full px-4 absolute top-4 left-0 right-0 text-sm">
        <span className="font-semibold">9:41</span>
        <div className="flex gap-1.5 items-center">
          <Signal className="w-4 h-4" />
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <button className="size-10 flex items-center justify-center rounded-full bg-gray-800/20 backdrop-blur-md border border-gray-700/30">
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <div className="px-4 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/20 backdrop-blur-md">
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">AI Engine Active</span>
        </div>
        <div className="size-10"></div>
      </div>

      {/* Central AI Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 to-transparent opacity-20 scale-150 blur-3xl"></div>

        {/* Orbital Rings */}
        <div className="absolute size-80 rounded-full border border-purple-600/10 animate-spin" style={{ animationDuration: '12s' }}></div>
        <div className="absolute size-64 rounded-full border border-purple-600/20 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}></div>

        {/* Progress Ring */}
        <div className="absolute size-[320px] flex items-center justify-center">
          <svg className="size-full transform -rotate-90">
            <circle
              className="text-gray-800/30"
              cx="160"
              cy="160"
              fill="transparent"
              r="150"
              stroke="currentColor"
              strokeWidth="2"
            ></circle>
            <circle
              className="text-purple-600 transition-all duration-300"
              cx="160"
              cy="160"
              fill="transparent"
              r="150"
              stroke="currentColor"
              strokeDasharray="942"
              strokeDashoffset={942 - (942 * progress) / 100}
              strokeLinecap="round"
              strokeWidth="4"
            ></circle>
          </svg>
        </div>

        {/* Central Orb */}
        <div className="relative size-48 flex items-center justify-center animate-pulse">
          <div className="absolute inset-0 rounded-full bg-purple-600 blur-2xl opacity-40"></div>
          <div className="relative size-40 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 shadow-[0_0_50px_rgba(139,92,246,0.5)] flex flex-col items-center justify-center border border-white/10">
            <span className="text-4xl font-bold tracking-tighter">{progress}<span className="text-lg opacity-60">%</span></span>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] mt-1 opacity-70">Computing</span>
          </div>
          {/* Floating particles */}
          <div className="absolute -top-4 -right-2 size-3 rounded-full bg-purple-600 shadow-[0_0_10px_#8b5cf6] animate-bounce"></div>
          <div className="absolute bottom-6 -left-4 size-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Text Feedback */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-12">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Analyzing your fashion DNA...
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex space-x-1">
              <span className="size-1 rounded-full bg-purple-600 animate-bounce"></span>
              <span className="size-1 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="size-1 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Matching aesthetics...</p>
          </div>
        </div>

        {/* Context Card */}
        <div className="w-full max-w-xs p-4 rounded-xl bg-gray-900/40 backdrop-blur-xl border border-white/5 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
            <span className="text-2xl">🎨</span>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Current Step</p>
            <p className="text-sm text-gray-300">Analyzing color preferences and patterns...</p>
          </div>
        </div>
      </div>
    </div>
  );
}