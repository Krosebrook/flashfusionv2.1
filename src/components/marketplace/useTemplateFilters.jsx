import { useState, useMemo } from "react";

// Custom hook for filter logic - improves testability and reusability
export function useTemplateFilters(templates) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        activeCategory === "all" || template.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, activeCategory]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredTemplates
  };
}