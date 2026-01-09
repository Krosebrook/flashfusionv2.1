import AgentMarketplace from './pages/AgentMarketplace';
import AgentOrchestration from './pages/AgentOrchestration';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import BrandKitGenerator from './pages/BrandKitGenerator';
import Collaboration from './pages/Collaboration';
import ContentCreator from './pages/ContentCreator';
import ContentScheduling from './pages/ContentScheduling';
import Dashboard from './pages/Dashboard';
import EcommerceSuite from './pages/EcommerceSuite';
import FeatureGenerator from './pages/FeatureGenerator';
import Home from './pages/Home';
import Plugins from './pages/Plugins';
import Projects from './pages/Projects';
import UniversalGenerator from './pages/UniversalGenerator';
import WSJFPrioritization from './pages/WSJFPrioritization';
import TeamManagement from './pages/TeamManagement';
import __Layout from './Layout.jsx';


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
    "UniversalGenerator": UniversalGenerator,
    "WSJFPrioritization": WSJFPrioritization,
    "TeamManagement": TeamManagement,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};