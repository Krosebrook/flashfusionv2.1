/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAssistant from './pages/AIAssistant';
import APIWebhooks from './pages/APIWebhooks';
import ActivationDashboard from './pages/ActivationDashboard';
import AdvancedWorkflows from './pages/AdvancedWorkflows';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import BrandKitGenerator from './pages/BrandKitGenerator';
import Collaboration from './pages/Collaboration';
import ContentCreator from './pages/ContentCreator';
import ContentScheduling from './pages/ContentScheduling';
import Dashboard from './pages/Dashboard';
import DealSourcer from './pages/DealSourcer';
import Documentation from './pages/Documentation';
import EcommerceSuite from './pages/EcommerceSuite';
import FeatureGenerator from './pages/FeatureGenerator';
import FlashFusionDemo from './pages/FlashFusionDemo';
import Home from './pages/Home';
import IntegrationHub from './pages/IntegrationHub';
import Integrations from './pages/Integrations';
import IntegrationsAdmin from './pages/IntegrationsAdmin';
import LifecycleIntelligence from './pages/LifecycleIntelligence';
import MobileDeploymentGuide from './pages/MobileDeploymentGuide';
import MyDeals from './pages/MyDeals';
import Onboarding from './pages/Onboarding';
import OnboardingComplete from './pages/OnboardingComplete';
import PRDGenerator from './pages/PRDGenerator';
import PersonalizedAnalytics from './pages/PersonalizedAnalytics';
import Plugins from './pages/Plugins';
import PowerUserExpansion from './pages/PowerUserExpansion';
import Projects from './pages/Projects';
import PromptGenerator from './pages/PromptGenerator';
import RetentionDashboard from './pages/RetentionDashboard';
import RolesAndPermissions from './pages/RolesAndPermissions';
import SyncConfiguration from './pages/SyncConfiguration';
import TeamManagement from './pages/TeamManagement';
import UniversalGenerator from './pages/UniversalGenerator';
import UserSettings from './pages/UserSettings';
import WSJFPrioritization from './pages/WSJFPrioritization';
import StyleQuiz from './pages/StyleQuiz';
import StyleProfile from './pages/StyleProfile';
import DigitalWardrobe from './pages/DigitalWardrobe';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "APIWebhooks": APIWebhooks,
    "ActivationDashboard": ActivationDashboard,
    "AdvancedWorkflows": AdvancedWorkflows,
    "Analytics": Analytics,
    "Billing": Billing,
    "BrandKitGenerator": BrandKitGenerator,
    "Collaboration": Collaboration,
    "ContentCreator": ContentCreator,
    "ContentScheduling": ContentScheduling,
    "Dashboard": Dashboard,
    "DealSourcer": DealSourcer,
    "Documentation": Documentation,
    "EcommerceSuite": EcommerceSuite,
    "FeatureGenerator": FeatureGenerator,
    "FlashFusionDemo": FlashFusionDemo,
    "Home": Home,
    "IntegrationHub": IntegrationHub,
    "Integrations": Integrations,
    "IntegrationsAdmin": IntegrationsAdmin,
    "LifecycleIntelligence": LifecycleIntelligence,
    "MobileDeploymentGuide": MobileDeploymentGuide,
    "MyDeals": MyDeals,
    "Onboarding": Onboarding,
    "OnboardingComplete": OnboardingComplete,
    "PRDGenerator": PRDGenerator,
    "PersonalizedAnalytics": PersonalizedAnalytics,
    "Plugins": Plugins,
    "PowerUserExpansion": PowerUserExpansion,
    "Projects": Projects,
    "PromptGenerator": PromptGenerator,
    "RetentionDashboard": RetentionDashboard,
    "RolesAndPermissions": RolesAndPermissions,
    "SyncConfiguration": SyncConfiguration,
    "TeamManagement": TeamManagement,
    "UniversalGenerator": UniversalGenerator,
    "UserSettings": UserSettings,
    "WSJFPrioritization": WSJFPrioritization,
    "StyleQuiz": StyleQuiz,
    "StyleProfile": StyleProfile,
    "DigitalWardrobe": DigitalWardrobe,
}

export const pagesConfig = {
    mainPage: "SyncConfiguration",
    Pages: PAGES,
    Layout: __Layout,
};