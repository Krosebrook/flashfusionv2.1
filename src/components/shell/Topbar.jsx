import { Search, Bell, Command, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Topbar({ onOpenCommandPalette }) {
  return (
    <header 
      className="h-16 border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-secondary))] px-6 flex items-center justify-between"
      role="banner"
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center gap-3 px-4 py-2 bg-[hsl(var(--surface-primary))] border border-[hsl(var(--border-default))] rounded-lg text-[hsl(var(--text-tertiary))] hover:border-[hsl(var(--border-interactive))] transition-colors text-left"
          aria-label="Open command palette"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-sm">Search or jump to...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-[hsl(var(--surface-tertiary))] rounded border border-[hsl(var(--border-default))]">
            <Command className="w-3 h-3" />
            K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCommandPalette}
          aria-label="Help & shortcuts"
          title="Press ? for shortcuts"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}