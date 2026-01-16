import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Separated search component for clarity and potential reuse
export default function MarketplaceSearch({ searchQuery, onSearchChange }) {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-gray-800 border-gray-600"
      />
    </div>
  );
}
