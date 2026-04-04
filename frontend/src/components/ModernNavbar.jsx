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
  Info,
  Moon,
  Sun,
  Map,
  Search,
  TrendingUp,
  Clock,
  Scale,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ModernNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [featureMenu, setFeatureMenu] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  const mainItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
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

  const otherItems = [
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 ${
        darkMode
          ? 'bg-gray-900/98 border-b border-gray-800 backdrop-blur-md'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
      } transition-all duration-300 shadow-lg`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              PINCode India
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            ))}

            {/* Features Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}>
                <Search className="w-4 h-4" />
                Features
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className={`absolute left-0 mt-0 w-80 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="p-4 grid grid-cols-1 gap-2">
                  {features.map(({ path, label, icon: Icon, desc }) => (
                    <Link key={path} to={path}>
                      <div className={`px-3 py-3 rounded-lg flex items-start gap-3 transition-colors ${
                        darkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-indigo-50'
                      }`}>
                        <Icon className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{label}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {otherItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-lg transition-all duration-300 border-2 ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-indigo-300 shadow-sm'
              }`}
              title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2.5 rounded-lg transition-all ${
                darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className={`lg:hidden pb-4 space-y-1 border-t ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            {/* Mobile Theme Toggle */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleDarkMode}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all w-full text-left ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-indigo-50'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                Switch to {darkMode ? 'Light' : 'Dark'} Mode
              </button>
            </div>

            {mainItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setIsOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-indigo-50'
                }`}>
                  <Icon className="w-5 h-5" />
                  {label}
                </div>
              </Link>
            ))}

            <div className={`px-4 py-2 text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Features
            </div>
            {features.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setIsOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ml-2 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-indigo-50'
                }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            ))}

            {otherItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setIsOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-indigo-50'
                }`}>
                  <Icon className="w-5 h-5" />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default ModernNavbar;
