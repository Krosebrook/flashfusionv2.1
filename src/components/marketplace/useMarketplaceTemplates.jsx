import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";

// Custom hook for template data management - separates business logic from UI
export function useMarketplaceTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await base44.entities.AgentTemplate.list("-rating");
      setTemplates(data);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized derived data to prevent unnecessary recalculations
  const featuredTemplates = useMemo(
    () => templates.filter(t => t.is_featured),
    [templates]
  );

  const popularTemplates = useMemo(
    () => [...templates].sort((a, b) => b.installs - a.installs).slice(0, 6),
    [templates]
  );

  const stats = useMemo(
    () => ({
      total: templates.length,
      featured: featuredTemplates.length,
      totalInstalls: templates.reduce((sum, t) => sum + (t.installs || 0), 0)
    }),
    [templates, featuredTemplates]
  );

  return {
    templates,
    featuredTemplates,
    popularTemplates,
    stats,
    isLoading,
    error,
    refetch: fetchTemplates
  };
}