"use client";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
  Settings,
  Zap,
  Book,
  Shield,
  Sparkles,
  Smartphone,
  Home,
  ChevronLeft,
} from "lucide-react";

const navigationGroups = [
  {
    name: "AI ASSISTANT",
    items: [
      { name: "AI Assistant", href: createPageUrl("AIAssistant"), icon: Sparkles, dataTour: "ai-assistant", featured: true },
    ]
  },
  {
    name: "CREATE",
    items: [
      { name: "Universal Generator", href: createPageUrl("UniversalGenerator"), icon: Rocket, dataTour: "universal-generator", featured: true },
      { name: "Content Studio", href: createPageUrl("ContentCreator"), icon: FileText, dataTour: "content-creator" },
      { name: "Feature Generator", href: createPageUrl("FeatureGenerator"), icon: Atom, dataTour: "feature-generator" },
      { name: "Brand Kit", href: createPageUrl("BrandKitGenerator"), icon: Palette, dataTour: "brand-kit" },
      { name: "PRD Generator", href: createPageUrl("PRDGenerator"), icon: ClipboardList },
    ]
  },
  {
    name: "MANAGE",
    items: [
      { name: "Projects", href: createPageUrl("Projects"), icon: FolderOpen },
      { name: "Workflows", href: createPageUrl("AdvancedWorkflows"), icon: Workflow },
      { name: "Scheduling", href: createPageUrl("ContentScheduling"), icon: Clock },
      { name: "Collaboration", href: createPageUrl("Collaboration"), icon: Users },
      { name: "E-commerce", href: createPageUrl("EcommerceSuite"), icon: ShoppingCart },
      { name: "WSJF", href: createPageUrl("WSJFPrioritization"), icon: ArrowUpDown },
    ]
  },
  {
    name: "ANALYZE",
    items: [
      { name: "Analytics", href: createPageUrl("Analytics"), icon: BarChart3, dataTour: "analytics" },
      { name: "Deal Sourcer", href: createPageUrl("DealSourcer"), icon: Zap, dataTour: "deal-sourcer" },
      { name: "Insights", href: createPageUrl("PersonalizedAnalytics"), icon: BarChart3 },
    ]
  },
  {
    name: "CONNECT",
    items: [
      { name: "API & Webhooks", href: createPageUrl("APIWebhooks"), icon: Zap },
      { name: "Integrations", href: createPageUrl("Integrations"), icon: Plug, dataTour: "integrations" },
      { name: "Sync Config", href: createPageUrl("SyncConfiguration"), icon: Settings },
      { name: "Plugins", href: createPageUrl("Plugins"), icon: Plug },
    ]
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isRootDashboard = location.pathname === '/' || location.pathname === '/Dashboard';

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
        <nav className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.name}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.name}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    data-tour={item.dataTour}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all group ${
                      location.pathname === item.href
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : item.featured
                          ? "text-purple-300 hover:bg-gray-700/50 hover:text-white font-medium"
                          : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-4 w-4 ${
                        location.pathname === item.href
                          ? "text-white"
                          : item.featured
                            ? "text-purple-400"
                            : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Utility Nav */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="space-y-1">
            <Link to={createPageUrl("MobileDeploymentGuide")} className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50">
              <Smartphone className="mr-3 h-4 w-4" />
              Mobile Deploy
            </Link>
            <Link to={createPageUrl("TeamManagement")} className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50">
              <Users className="mr-3 h-4 w-4" />
              Team
            </Link>
            <Link to={createPageUrl("RolesAndPermissions")} className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50">
              <Shield className="mr-3 h-4 w-4" />
              Roles
            </Link>
            <Link to={createPageUrl("Documentation")} className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50">
              <Book className="mr-3 h-4 w-4" />
              Docs
            </Link>
            <Link to={createPageUrl("Billing")} data-tour="billing" className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50">
              <CreditCard className="mr-3 h-4 w-4" />
              Billing
            </Link>
            <Link to={createPageUrl("UserSettings")} className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
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
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 safe-top">
        {!isRootDashboard && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors no-select"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
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
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors no-select"
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

      <main className="md:pl-64 flex flex-col flex-1 pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 safe-bottom z-50">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            to={createPageUrl("Dashboard")}
            className={`flex flex-col items-center justify-center flex-1 h-full no-select ${
              location.pathname === '/' || location.pathname === '/Dashboard'
                ? 'text-purple-400'
                : 'text-gray-400'
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to={createPageUrl("UniversalGenerator")}
            className={`flex flex-col items-center justify-center flex-1 h-full no-select ${
              location.pathname === '/UniversalGenerator'
                ? 'text-purple-400'
                : 'text-gray-400'
            }`}
          >
            <Rocket className="h-5 w-5 mb-1" />
            <span className="text-xs">Create</span>
          </Link>
          <Link
            to={createPageUrl("Projects")}
            className={`flex flex-col items-center justify-center flex-1 h-full no-select ${
              location.pathname === '/Projects'
                ? 'text-purple-400'
                : 'text-gray-400'
            }`}
          >
            <FolderOpen className="h-5 w-5 mb-1" />
            <span className="text-xs">Manage</span>
          </Link>
          <Link
            to={createPageUrl("Analytics")}
            className={`flex flex-col items-center justify-center flex-1 h-full no-select ${
              location.pathname === '/Analytics'
                ? 'text-purple-400'
                : 'text-gray-400'
            }`}
          >
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-xs">Analytics</span>
          </Link>
        </div>
      </nav>
      </div>
      );
      }