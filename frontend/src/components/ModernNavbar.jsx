import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Compass,
  BarChart3,
  Heart,
  MapPin,
  Moon,
  Sun,
  Map,
  Search,
  TrendingUp,
  Clock,
  Scale,
  Printer,
  ChevronDown,
  Zap,
  Globe,
  Truck,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ModernNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  const mainItems = [
    { path: '/', label: 'DASHBOARD', icon: Home },
    { path: '/explore', label: 'GEO_EXPLORE', icon: Compass },
    { path: '/analytics', label: 'METRICS', icon: BarChart3 },
  ];

  const features = [
    { path: '/autocomplete', label: 'Autocomplete', icon: Search, desc: 'Real-time suggestions' },
    { path: '/bulk-search', label: 'Bulk Search', icon: TrendingUp, desc: 'Multiple PIN codes' },
    { path: '/address-autofill', label: 'Address Fill', icon: MapPin, desc: 'Auto-populate fields' },
    { path: '/delivery-estimator', label: 'Delivery Time', icon: Clock, desc: 'Estimate days' },
    { path: '/map-integration', label: 'Map View', icon: Map, desc: 'Interactive maps' },
    { path: '/favorites-system', label: 'Favorites', icon: Heart, desc: 'Save PIN codes' },
    { path: '/recently-viewed', label: 'Recent', icon: Clock, desc: 'History' },
    { path: '/comparison', label: 'Compare', icon: Scale, desc: 'Side by side' },
    { path: '/print-label', label: 'Print Label', icon: Printer, desc: 'Printable labels' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        darkMode
          ? 'bg-[#0d0f14]/80 border-white/5 backdrop-blur-2xl shadow-2xl'
          : 'bg-white/80 border-gray-100 backdrop-blur-2xl shadow-sm'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] rounded-2xl group-hover:shadow-[0_0_20px_#4f46e5] transition-all duration-300">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
                <span className={`font-black text-xl tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'} leading-none`}>
                  LOGISTICS <span className="text-[#6366f1]">ENGINE</span>
                </span>
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.4em] mt-1">V2.0 STABLE_BUILD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {mainItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <div className={`px-5 py-2.5 rounded-2xl font-bold text-[10px] tracking-widest transition-all ${
                  isActive(path)
                    ? darkMode
                      ? 'bg-white/10 text-white border border-white/5 shadow-xl'
                      : 'bg-[#6366f1] text-white shadow-xl shadow-indigo-200'
                    : darkMode
                    ? 'text-gray-500 hover:text-white'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}>
                  {label}
                </div>
              </Link>
            ))}

            {/* Features Dropdown */}
            <div className="relative group mx-2">
              <button className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-[10px] tracking-widest transition-all ${
                darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-indigo-800'
              }`}>
                EXTENSIONS
                <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover:rotate-180 transition-transform" />
              </button>
              
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[500px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-4">
                <div className={`p-6 rounded-[3rem] border shadow-2xl ${
                  darkMode ? 'bg-[#16181d] border-white/5' : 'bg-white border-gray-100'
                }`}>
                  <div className="grid grid-cols-2 gap-4">
                    {features.map(({ path, label, icon: Icon, desc }) => (
                      <Link key={path} to={path}>
                        <div className={`px-4 py-4 rounded-3xl flex items-center gap-4 transition-all ${
                          darkMode ? 'hover:bg-white/5' : 'hover:bg-indigo-50'
                        }`}>
                          <div className={`p-3 rounded-2xl ${darkMode ? 'bg-[#1c1f26] text-[#6366f1]' : 'bg-indigo-100 text-indigo-600'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className={`font-bold text-xs uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>{label}</div>
                            <div className={`text-[9px] font-bold opacity-30 mt-1 uppercase tracking-widest`}>{desc}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-2xl border transition-all duration-300 ${
                darkMode
                  ? 'bg-white/5 text-yellow-400 border-white/5 hover:bg-white/10'
                  : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-3 rounded-2xl transition-all ${
                darkMode ? 'text-gray-400 hover:bg-white/10' : 'text-gray-600'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className={`lg:hidden border-t px-6 py-4 ${darkMode ? 'border-white/5 bg-[#0d0f14]' : 'border-gray-100 bg-white'}`}>
          <div className="flex flex-col gap-2">
            {mainItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setIsOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs tracking-widest transition-all ${
                  isActive(path)
                    ? darkMode
                      ? 'bg-white/10 text-white border border-white/5'
                      : 'bg-[#6366f1] text-white shadow-lg shadow-indigo-200'
                    : darkMode
                    ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            ))}
            
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <div className={`px-4 mb-2 font-bold text-[10px] tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                EXTENSIONS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map(({ path, label, icon: Icon, desc }) => (
                  <Link key={path} to={path} onClick={() => setIsOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      darkMode ? 'hover:bg-white/5' : 'hover:bg-indigo-50'
                    }`}>
                      <div className={`p-2 rounded-xl ${darkMode ? 'bg-[#1c1f26] text-[#6366f1]' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`font-bold text-[11px] uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>{label}</div>
                        <div className={`text-[9px] font-bold opacity-40 mt-0.5 tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ModernNavbar;
