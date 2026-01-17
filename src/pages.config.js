import AdvancedWorkflows from './pages/AdvancedWorkflows';
import AgentCollaboration from './pages/AgentCollaboration';
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
import IntegrationHub from './pages/IntegrationHub';
import Integrations from './pages/Integrations';
import PRDGenerator from './pages/PRDGenerator';
import PersonalizedAnalytics from './pages/PersonalizedAnalytics';
import Plugins from './pages/Plugins';
import Projects from './pages/Projects';
import SyncConfiguration from './pages/SyncConfiguration';
import TeamManagement from './pages/TeamManagement';
import UniversalGenerator from './pages/UniversalGenerator';
import WSJFPrioritization from './pages/WSJFPrioritization';
import IntegrationsAdmin from './pages/IntegrationsAdmin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdvancedWorkflows": AdvancedWorkflows,
    "AgentCollaboration": AgentCollaboration,
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
    "IntegrationHub": IntegrationHub,
    "Integrations": Integrations,
    "PRDGenerator": PRDGenerator,
    "PersonalizedAnalytics": PersonalizedAnalytics,
    "Plugins": Plugins,
    "Projects": Projects,
    "SyncConfiguration": SyncConfiguration,
    "TeamManagement": TeamManagement,
    "UniversalGenerator": UniversalGenerator,
    "WSJFPrioritization": WSJFPrioritization,
    "IntegrationsAdmin": IntegrationsAdmin,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};