"use client";
import SmartBrandKit from "../components/generators/SmartBrandKit";
import { Palette, Sparkles } from "lucide-react";

export default function BrandKitGenerator() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Palette className="w-8 h-8 text-purple-400" />
          <span>Smart Brand Kit Generator</span>
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Create comprehensive brand identities with multiple logo variations,
          color palettes, typography, and brand guidelines. Perfect for
          entrepreneurs, agencies, and creative professionals.
        </p>
      </div>

      <SmartBrandKit />
    </div>
  );
}
