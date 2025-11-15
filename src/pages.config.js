import Dashboard from './pages/Dashboard';
import FeatureGenerator from './pages/FeatureGenerator';
import BrandKitGenerator from './pages/BrandKitGenerator';
import Plugins from './pages/Plugins';
import Billing from './pages/Billing';
import Projects from './pages/Projects';
import UniversalGenerator from './pages/UniversalGenerator';
import EcommerceSuite from './pages/EcommerceSuite';
import ContentCreator from './pages/ContentCreator';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FeatureGenerator": FeatureGenerator,
    "BrandKitGenerator": BrandKitGenerator,
    "Plugins": Plugins,
    "Billing": Billing,
    "Projects": Projects,
    "UniversalGenerator": UniversalGenerator,
    "EcommerceSuite": EcommerceSuite,
    "ContentCreator": ContentCreator,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};