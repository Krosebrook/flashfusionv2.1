// Safe: Convert large pages to lazy-loaded imports to improve initial load time
// Using React.lazy() for code splitting - only loads pages when needed
// The 4 largest pages: Dashboard (448 lines), UniversalGenerator (462 lines),
// ContentCreator (423 lines), EcommerceSuite (362 lines)
import { lazy } from 'react';

import AgentMarketplace from './pages/AgentMarketplace';
import AgentOrchestration from './pages/AgentOrchestration';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import BrandKitGenerator from './pages/BrandKitGenerator';
import Collaboration from './pages/Collaboration';
import ContentScheduling from './pages/ContentScheduling';
import FeatureGenerator from './pages/FeatureGenerator';
import Home from './pages/Home';
import Plugins from './pages/Plugins';
import Projects from './pages/Projects';
import TeamManagement from './pages/TeamManagement';
import WSJFPrioritization from './pages/WSJFPrioritization';
import Integrations from './pages/Integrations';
import __Layout from './Layout.jsx';

// Lazy load the 4 largest pages for better performance
// Safe: These will be loaded on-demand when user navigates to them
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UniversalGenerator = lazy(() => import('./pages/UniversalGenerator'));
const ContentCreator = lazy(() => import('./pages/ContentCreator'));
const EcommerceSuite = lazy(() => import('./pages/EcommerceSuite'));


export const PAGES = {
    "AgentMarketplace": AgentMarketplace,
    "AgentOrchestration": AgentOrchestration,
    "Analytics": Analytics,
    "Billing": Billing,
    "BrandKitGenerator": BrandKitGenerator,
    "Collaboration": Collaboration,
    "ContentCreator": ContentCreator,
    "ContentScheduling": ContentScheduling,
    "Dashboard": Dashboard,
    "EcommerceSuite": EcommerceSuite,
    "FeatureGenerator": FeatureGenerator,
    "Home": Home,
    "Plugins": Plugins,
    "Projects": Projects,
    "TeamManagement": TeamManagement,
    "UniversalGenerator": UniversalGenerator,
    "WSJFPrioritization": WSJFPrioritization,
    "Integrations": Integrations,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};