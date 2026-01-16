"use client";
import AdvancedFeatureGenerator from "../components/generators/AdvancedFeatureGenerator";
import { Atom } from "lucide-react";

export default function FeatureGenerator() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Atom className="w-8 h-8 text-blue-400" />
          <span>Advanced Feature Generator</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Transform your ideas into production-ready code. From simple
          components to complex full-stack features, our AI generates clean,
          documented code tailored to your specifications.
        </p>
      </div>

      <AdvancedFeatureGenerator />
    </div>
  );
}
