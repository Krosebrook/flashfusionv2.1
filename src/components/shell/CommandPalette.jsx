import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Rocket, FileText, Atom, Palette, Zap, FolderOpen, Workflow,
  Clock, Users, ShoppingCart, BarChart3, Plug, Settings, Book,
  Command as CommandIcon, Keyboard
} from 'lucide-react';

const commands = [
  { id: 'nav-universal', name: 'Universal Generator', icon: Rocket, action: 'navigate', target: 'UniversalGenerator', keywords: ['generate', 'create', 'build', 'app'], shortcut: 'G U' },
  { id: 'nav-content', name: 'Content Studio', icon: FileText, action: 'navigate', target: 'ContentCreator', keywords: ['content', 'write', 'post'], shortcut: 'G C' },
  { id: 'nav-feature', name: 'Feature Generator', icon: Atom, action: 'navigate', target: 'FeatureGenerator', keywords: ['feature', 'code'] },
  { id: 'nav-brand', name: 'Brand Kit', icon: Palette, action: 'navigate', target: 'BrandKitGenerator', keywords: ['brand', 'design', 'logo'] },
  { id: 'nav-deals', name: 'Deal Sourcer', icon: Zap, action: 'navigate', target: 'DealSourcer', keywords: ['deals', 'invest'] },
  { id: 'nav-projects', name: 'Projects', icon: FolderOpen, action: 'navigate', target: 'Projects', keywords: ['project'], shortcut: 'G P' },
  { id: 'nav-workflows', name: 'Workflows', icon: Workflow, action: 'navigate', target: 'AdvancedWorkflows', keywords: ['workflow', 'automation'], shortcut: 'G W' },
  { id: 'nav-analytics', name: 'Analytics', icon: BarChart3, action: 'navigate', target: 'Analytics', keywords: ['analytics', 'stats'], shortcut: 'G A' },
  { id: 'nav-team', name: 'Team Management', icon: Users, action: 'navigate', target: 'TeamManagement', keywords: ['team', 'users'] },
  { id: 'nav-integrations', name: 'Integrations', icon: Plug, action: 'navigate', target: 'Integrations', keywords: ['integrations', 'connect'] },
  { id: 'shortcuts', name: 'View Keyboard Shortcuts', icon: Keyboard, action: 'shortcuts', keywords: ['help', 'keyboard', 'shortcuts'] },
];

const shortcuts = [
  { keys: ['⌘/Ctrl', 'K'], description: 'Open command palette' },
  { keys: ['?'], description: 'Show shortcuts' },
  { keys: ['G', 'U'], description: 'Go to Universal Generator' },
  { keys: ['G', 'C'], description: 'Go to Content Studio' },
  { keys: ['G', 'P'], description: 'Go to Projects' },
  { keys: ['G', 'W'], description: 'Go to Workflows' },
  { keys: ['G', 'A'], description: 'Go to Analytics' },
  { keys: ['Esc'], description: 'Close dialogs / Cancel' },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.name.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setShowShortcuts(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => (s + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => (s - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' && filtered[selected]) {
        e.preventDefault();
        executeCommand(filtered[selected]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selected]);

  const executeCommand = (cmd) => {
    if (cmd.action === 'navigate') {
      navigate(createPageUrl(cmd.target));
      onClose();
    } else if (cmd.action === 'shortcuts') {
      setShowShortcuts(true);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl p-0 bg-[hsl(var(--surface-secondary))] border-[hsl(var(--border-interactive))] overflow-hidden"
        aria-label="Command palette"
      >
        {showShortcuts ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </h2>
            <div className="space-y-2">
              {shortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border-default))] last:border-0">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd key={i} className="px-2 py-1 text-xs bg-[hsl(var(--surface-tertiary))] rounded border border-[hsl(var(--border-default))]">
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              ← Back to commands
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-[hsl(var(--border-default))]">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="border-0 bg-transparent focus-visible:ring-0 text-base"
                autoFocus
                aria-label="Command search"
              />
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-[hsl(var(--text-tertiary))]">
                  No results found
                </div>
              ) : (
                <div role="listbox" aria-label="Commands">
                  {filtered.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        idx === selected
                          ? 'bg-[hsl(var(--surface-tertiary))]'
                          : 'hover:bg-[hsl(var(--surface-tertiary))]'
                      }`}
                      role="option"
                      aria-selected={idx === selected}
                    >
                      <cmd.icon className="w-5 h-5 text-[hsl(var(--text-tertiary))]" />
                      <span className="flex-1 text-sm font-medium">{cmd.name}</span>
                      {cmd.shortcut && (
                        <span className="text-xs text-[hsl(var(--text-tertiary))]">
                          {cmd.shortcut}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}