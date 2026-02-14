import { useState } from 'react';
import SidebarNav from './SidebarNav';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';

/**
 * AppShell - Universal layout wrapper
 * Provides: Sidebar + Topbar + Main Canvas + optional Details panel
 */
export default function AppShell({ children, showDetailsPanel = false, detailsPanel = null }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen for Cmd/Ctrl+K
  useState(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-primary))] text-[hsl(var(--text-primary))]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <SidebarNav 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
          
          <main 
            id="main-content" 
            className="flex-1 overflow-auto"
            role="main"
            tabIndex="-1"
          >
            <div className={`h-full ${showDetailsPanel ? 'flex' : ''}`}>
              <div className={`${showDetailsPanel ? 'flex-1 border-r border-[hsl(var(--border-default))]' : 'w-full'} overflow-auto`}>
                {children}
              </div>
              {showDetailsPanel && (
                <aside 
                  className="w-96 overflow-auto bg-[hsl(var(--surface-secondary))]"
                  role="complementary"
                  aria-label="Details panel"
                >
                  {detailsPanel}
                </aside>
              )}
            </div>
          </main>
        </div>
      </div>

      <CommandPalette 
        open={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </div>
  );
}