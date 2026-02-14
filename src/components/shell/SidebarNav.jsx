import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Rocket, FileText, Atom, Palette, Zap,
  FolderOpen, Workflow, Clock, Users, ShoppingCart,
  BarChart3, Plug, Settings, CreditCard, Book,
  Shield, ChevronLeft, ChevronRight, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navGroups = [
  {
    label: 'CREATE',
    items: [
      { name: 'Universal Generator', href: createPageUrl('UniversalGenerator'), icon: Rocket, shortcut: 'G U' },
      { name: 'Content Studio', href: createPageUrl('ContentCreator'), icon: FileText, shortcut: 'G C' },
      { name: 'Feature Gen', href: createPageUrl('FeatureGenerator'), icon: Atom },
      { name: 'Brand Kit', href: createPageUrl('BrandKitGenerator'), icon: Palette },
    ]
  },
  {
    label: 'MANAGE',
    items: [
      { name: 'Projects', href: createPageUrl('Projects'), icon: FolderOpen, shortcut: 'G P' },
      { name: 'Workflows', href: createPageUrl('AdvancedWorkflows'), icon: Workflow, shortcut: 'G W' },
      { name: 'Scheduling', href: createPageUrl('ContentScheduling'), icon: Clock },
      { name: 'E-commerce', href: createPageUrl('EcommerceSuite'), icon: ShoppingCart },
    ]
  },
  {
    label: 'ANALYZE',
    items: [
      { name: 'Analytics', href: createPageUrl('Analytics'), icon: BarChart3, shortcut: 'G A' },
      { name: 'Deal Sourcer', href: createPageUrl('DealSourcer'), icon: Zap },
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { name: 'Team', href: createPageUrl('TeamManagement'), icon: Users },
      { name: 'Integrations', href: createPageUrl('Integrations'), icon: Plug },
      { name: 'API & Webhooks', href: createPageUrl('APIWebhooks'), icon: Settings },
    ]
  }
];

export default function SidebarNav({ collapsed, onToggle }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user');
      }
    };
    fetchUser();
  }, []);

  return (
    <aside 
      className={`${collapsed ? 'w-16' : 'w-64'} bg-[hsl(var(--surface-secondary))] border-r border-[hsl(var(--border-default))] flex flex-col transition-all duration-200`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[hsl(var(--border-default))]">
        {!collapsed && (
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-lg">FlashFusion</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" role="navigation">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2 rounded-lg transition-all group ${
                      isActive
                        ? 'bg-[hsl(var(--action-primary))] text-white'
                        : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-tertiary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                    title={collapsed ? item.name : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {item.shortcut && (
                          <span className="text-xs text-[hsl(var(--text-tertiary))]">
                            {item.shortcut}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      {user && (
        <div className="border-t border-[hsl(var(--border-default))] p-4">
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium mx-auto">
              {user.full_name?.charAt(0) || 'U'}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[hsl(var(--text-tertiary))]">Credits</span>
                <span className="font-medium text-yellow-400">{user.credits_remaining?.toLocaleString()}</span>
              </div>
              <Link to={createPageUrl('Billing')}>
                <Button variant="outline" size="sm" className="w-full">
                  <CreditCard className="w-3 h-3 mr-2" />
                  Billing
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}