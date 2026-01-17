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
import Integrations from './pages/Integrations';
import PRDGenerator from './pages/PRDGenerator';
import Plugins from './pages/Plugins';
import Projects from './pages/Projects';
import TeamManagement from './pages/TeamManagement';
import UniversalGenerator from './pages/UniversalGenerator';
import WSJFPrioritization from './pages/WSJFPrioritization';
import IntegrationHub from './pages/IntegrationHub';
import AgentCollaboration from './pages/AgentCollaboration';
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
    "Integrations": Integrations,
    "PRDGenerator": PRDGenerator,
    "Plugins": Plugins,
    "Projects": Projects,
    "TeamManagement": TeamManagement,
    "UniversalGenerator": UniversalGenerator,
    "WSJFPrioritization": WSJFPrioritization,
    "IntegrationHub": IntegrationHub,
    "AgentCollaboration": AgentCollaboration,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};