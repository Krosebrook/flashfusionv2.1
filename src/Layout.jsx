"use client";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// Fixed: Import base44 client instead of non-existent @/entities/User
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Atom,
  Palette,
  Plug,
  CreditCard,
  Menu,
  Bot,
  Rocket,
  FolderOpen,
  ShoppingCart,
  FileText,
  Users,
  BarChart3,
  Workflow,
  Clock,
  Store,
  ArrowUpDown,
  ClipboardList,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  { name: "Projects", href: createPageUrl("Projects"), icon: FolderOpen },
  {
    name: "Agent Orchestration",
    href: createPageUrl("AgentOrchestration"),
    icon: Workflow,
  },
  {
    name: "Universal Generator",
    href: createPageUrl("UniversalGenerator"),
    icon: Rocket,
  },
  {
    name: "Feature Generator",
    href: createPageUrl("FeatureGenerator"),
    icon: Atom,
  },
  {
    name: "PRD Generator",
    href: createPageUrl("PRDGenerator"),
    icon: ClipboardList,
  },
  {
    name: "BrandKit Generator",
    href: createPageUrl("BrandKitGenerator"),
    icon: Palette,
  },
  {
    name: "E-commerce Suite",
    href: createPageUrl("EcommerceSuite"),
    icon: ShoppingCart,
  },
  {
    name: "Content Creator",
    href: createPageUrl("ContentCreator"),
    icon: FileText,
  },
  { name: "Collaboration", href: createPageUrl("Collaboration"), icon: Users },
  {
    name: "Content Scheduling",
    href: createPageUrl("ContentScheduling"),
    icon: Clock,
  },
  {
    name: "Agent Marketplace",
    href: createPageUrl("AgentMarketplace"),
    icon: Store,
  },
  {
    name: "WSJF Prioritization",
    href: createPageUrl("WSJFPrioritization"),
    icon: ArrowUpDown,
  },
  { name: "Analytics", href: createPageUrl("Analytics"), icon: BarChart3 },
  { name: "Personalized Analytics", href: createPageUrl("PersonalizedAnalytics"), icon: BarChart3 },
  { name: "Advanced Workflows", href: createPageUrl("AdvancedWorkflows"), icon: Workflow },
  { name: "Sync Configuration", href: createPageUrl("SyncConfiguration"), icon: Plug },
  {
    name: "Team Management",
    href: createPageUrl("TeamManagement"),
    icon: Users,
  },
  { name: "Integrations", href: createPageUrl("Integrations"), icon: Plug },
  { name: "Integration Hub", href: createPageUrl("IntegrationHub"), icon: Plug },
  { name: "Integrations Admin", href: createPageUrl("IntegrationsAdmin"), icon: Settings },
  { name: "Agent Collaboration", href: createPageUrl("AgentCollaboration"), icon: Users },
  { name: "Plugins", href: createPageUrl("Plugins"), icon: Plug },
  { name: "Billing", href: createPageUrl("Billing"), icon: CreditCard },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("User not logged in");
      }
    };
    fetchUser();
  }, [location.pathname]);

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-center h-16 border-b border-gray-700 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FlashFusion</h1>
            <p className="text-xs text-gray-400">Universal AI Platform</p>
          </div>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group ${
                location.pathname === item.href
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-4 w-4 ${
                  location.pathname === item.href
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-blue-400 font-bold">{user.plan}</div>
                <div className="text-gray-400">Plan</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-green-400 font-bold">
                  {user.credits_remaining?.toLocaleString()}
                </div>
                <div className="text-gray-400">Credits</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={() => base44.auth.login()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <Link
          to={createPageUrl("Dashboard")}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">FlashFusion</h1>
          </div>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="w-64 bg-gray-800 flex flex-col">
          <SidebarContent />
        </div>
        <div
          className="flex-1 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800 border-r border-gray-700">
          <SidebarContent />
        </div>
      </div>

      <main className="md:pl-64 flex flex-col flex-1">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}