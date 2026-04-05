import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Explore from './components/Explore';
import PincodeDetail from './components/PincodeDetail';
import About from './components/About';
import MapVisualization from './components/MapVisualization';
import NearbySearch from './components/NearbySearch';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Favorites from './components/Favorites';
import StateDistrictTalukSelector from './components/StateDistrictTalukSelector';
import PincodeAutocomplete from './components/PincodeAutocomplete';
import BulkPincodeSearch from './components/BulkPincodeSearch';
import AddressAutofillForm from './components/AddressAutofillForm';
import DeliveryTimeEstimator from './components/DeliveryTimeEstimator';
import MapIntegration from './components/MapIntegration';
import FavoritesSystem from './components/FavoritesSystem';
import PincodeComparison from './components/PincodeComparison';
import PrintLabel from './components/PrintLabel';
import RecentlyViewed from './components/RecentlyViewed';
import ExplorePage from './components/explore/ExplorePage';
import ModernPincodeDashboard from './components/ModernPincodeDashboard';
import ModernNavbar from './components/ModernNavbar';
import ModernFooter from './components/ModernFooter';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppInner = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Router>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? 'bg-[#0d0f14]' : 'bg-slate-50'
      }`}>
        <ModernNavbar />
        
        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/landing" element={<ModernPincodeDashboard />} />
              <Route path="/map" element={<MapVisualization />} />
              <Route path="/nearby" element={<NearbySearch />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/selector" element={<StateDistrictTalukSelector />} />
              <Route path="/autocomplete" element={<PincodeAutocomplete />} />
              <Route path="/bulk-search" element={<BulkPincodeSearch />} />
              <Route path="/address-autofill" element={<AddressAutofillForm />} />
              <Route path="/delivery-estimator" element={<DeliveryTimeEstimator />} />
              <Route path="/map-integration" element={<MapIntegration />} />
              <Route path="/favorites-system" element={<FavoritesSystem />} />
              <Route path="/recently-viewed" element={<RecentlyViewed />} />
              <Route path="/comparison" element={<PincodeComparison />} />
              <Route path="/print-label" element={<PrintLabel />} />
              <Route path="/pincode/:pincode" element={<PincodeDetail />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
        
        <ModernFooter />
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: darkMode ? {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            } : {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

const App = () => (
  <AppInner />
);

export default App;
