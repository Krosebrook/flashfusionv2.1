import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export default function OptimizationBadge({ suggestions = [], onClick }) {
  if (!suggestions || suggestions.length === 0) return null;

  const unapplied = suggestions.filter(s => !s.applied);
  if (unapplied.length === 0) return null;

  const hasCritical = unapplied.some(s => s.priority === 'critical');

  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all group"
    >
      {hasCritical ? (
        <AlertTriangle className="w-4 h-4 text-yellow-300 animate-pulse" />
      ) : (
        <Sparkles className="w-4 h-4 text-white" />
      )}
      <span className="text-sm font-medium text-white">
        {unapplied.length} optimization{unapplied.length > 1 ? 's' : ''}
      </span>
      <TrendingUp className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}