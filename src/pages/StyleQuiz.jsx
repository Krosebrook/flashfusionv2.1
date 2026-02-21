import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import StyleQuizStep1 from "../components/style/StyleQuizStep1";
import StyleQuizStep2 from "../components/style/StyleQuizStep2";
import StyleQuizStep3 from "../components/style/StyleQuizStep3";
import AIProfileGeneration from "../components/style/AIProfileGeneration";

export default function StyleQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState(null);
  
  const [quizData, setQuizData] = useState({
    aesthetic: null,
    colorPalettes: [],
    patterns: [],
    occasions: []
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("User not authenticated");
        navigate(createPageUrl("Dashboard"));
      }
    };
    fetchUser();
  }, [navigate]);

  const handleStep1Complete = (aesthetic) => {
    setQuizData({ ...quizData, aesthetic });
    setCurrentStep(2);
  };

  const handleStep2Complete = (colorPalettes, patterns) => {
    setQuizData({ ...quizData, colorPalettes, patterns });
    setCurrentStep(3);
  };

  const handleStep3Complete = async (occasions) => {
    setQuizData({ ...quizData, occasions });
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Create style profile
    const archetype = generateArchetype(quizData.aesthetic);
    const signatureColors = generateSignatureColors(quizData.colorPalettes);
    
    await base44.entities.StyleProfile.create({
      user_email: user.email,
      aesthetic: quizData.aesthetic,
      color_palettes: quizData.colorPalettes,
      patterns: quizData.patterns,
      occasions: [...quizData.occasions, ...occasions],
      archetype: archetype,
      signature_colors: signatureColors,
      completion_percentage: 100,
      quiz_completed: true
    });
    
    navigate(createPageUrl("StyleProfile"));
  };

  const generateArchetype = (aesthetic) => {
    const archetypes = {
      "Minimalist": "Urban Minimalist",
      "Boho-Chic": "Free Spirit",
      "Streetwear": "Street Icon",
      "Classic Pro": "Timeless Professional",
      "Artsy": "Creative Visionary",
      "Sporty": "Athletic Innovator"
    };
    return archetypes[aesthetic] || "Style Maven";
  };

  const generateSignatureColors = (palettes) => {
    const colorSets = {
      "Neutrals": ["#2D2D2D", "#58636D", "#E2E0D8", "#1A237E", "#FFFFFF"],
      "Earth Tones": ["#6B705C", "#A5A58D", "#CB997E", "#B7B7A4", "#7B3F00"],
      "Pastels": ["#F8D7DA", "#D1E7DD", "#FFF3CD", "#CFE2FF", "#E2E3E5"],
      "Jewel Tones": ["#0047AB", "#50C878", "#9B111E", "#4B0082", "#FFD700"]
    };
    return palettes.length > 0 ? colorSets[palettes[0]] : colorSets["Neutrals"];
  };

  const progress = (currentStep / 3) * 100;

  if (isGenerating) {
    return <AIProfileGeneration />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <StyleQuizStep1 onComplete={handleStep1Complete} progress={33} />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <StyleQuizStep2 onComplete={handleStep2Complete} progress={66} />
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <StyleQuizStep3 onComplete={handleStep3Complete} progress={100} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}