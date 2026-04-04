import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, MapPin, Building, Truck, Loader, Heart, ChevronLeft, ChevronRight, 
  Download, Filter, X, Phone, Mail, Globe, TrendingUp, Users, Zap, Award 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

const API_URL = 'http://localhost:5000/api';

const ModernPincodeDashboard = () => {
  // State Management
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [pincodeData, setPincodeData] = useState([]);
  
  // Filters
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalPincodes: 0,
    totalStates: 0,
    deliveryOffices: 0,
    nonDeliveryOffices: 0
  });

  // Load Initial Data
  useEffect(() => {
    fetchStates();
    fetchStats();
    loadFavorites();
  }, []);

  // Fetch States
  const fetchStates = async () => {
    try {
      console.log('[API] Fetching all states...');
      const response = await axios.get(`${API_URL}/states`);
      setStates(response.data);
      console.log(`[API] Loaded ${response.data.length} states`);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to load states');
    }
  };

  // Fetch Districts (ALL of them)
  useEffect(() => {
    if (selectedState) {
      fetchDistrictsByState(selectedState);
    }
  }, [selectedState]);

  const fetchDistrictsByState = async (state) => {
    try {
      console.log(`[API] Fetching ALL districts for state: ${state}`);
      const response = await axios.get(`${API_URL}/states/${encodeURIComponent(state)}/districts`);
      const allDistricts = Array.isArray(response.data) ? response.data : [];
      console.log(`[API] Loaded ${allDistricts.length} districts for ${state}`);
      setDistricts(allDistricts);
      setSelectedDistrict('');
      setSelectedTaluk('');
      setTaluks([]);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts');
      setDistricts([]);
    }
  };

  // Fetch Taluks (ALL of them)
  useEffect(() => {
    if (selectedState && selectedDistrict) {
      fetchTaluksByDistrict(selectedState, selectedDistrict);
    }
  }, [selectedState, selectedDistrict]);

  const fetchTaluksByDistrict = async (state, district) => {
    try {
      console.log(`[API] Fetching ALL taluks for: ${state} / ${district}`);
      const response = await axios.get(
        `${API_URL}/states/${encodeURIComponent(state)}/districts/${encodeURIComponent(district)}/taluks`
      );
      const allTaluks = Array.isArray(response.data) ? response.data : [];
      console.log(`[API] Loaded ${allTaluks.length} taluks`);
      setTaluks(allTaluks);
      setSelectedTaluk('');
    } catch (error) {
      console.error('Error fetching taluks:', error);
      toast.error('Failed to load taluks');
      setTaluks([]);
    }
  };

  // Fetch PIN Code Data with Pagination
  useEffect(() => {
    if (selectedState || selectedDistrict || selectedTaluk) {
      setCurrentPage(1);
    }
  }, [selectedState, selectedDistrict, selectedTaluk]);

  useEffect(() => {
    if (selectedState || selectedDistrict || selectedTaluk || currentPage > 1) {
      fetchPincodeData();
    }
  }, [currentPage]);

  const fetchPincodeData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: limit
      };
      if (selectedState) params.state = selectedState;
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedTaluk) params.taluk = selectedTaluk;

      console.log('[API] Fetching PIN codes with params:', params);
      const response = await axios.get(`${API_URL}/pincodes`, { params });
      
      setPincodeData(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
      
      console.log(`[API] Fetched ${response.data.data.length} PIN codes (Page ${response.data.page}/${response.data.totalPages})`);
    } catch (error) {
      console.error('Error fetching PIN codes:', error);
      toast.error('Failed to fetch PIN codes');
      setPincodeData([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // First page load - fetch all data
  const handleLoadAllData = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 1000 };
      console.log('[API] Loading ALL PIN codes...');
      const response = await axios.get(`${API_URL}/pincodes`, { params });
      
      setPincodeData(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(Math.ceil(response.data.total / limit) || 1);
      setCurrentPage(1);
      
      toast.success(`Loaded ${response.data.total} PIN codes!`);
    } catch (error) {
      console.error('Error loading all data:', error);
      toast.error('Failed to load all PIN codes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Search Handler
  const handleSearch = useCallback(
    debounce(async (query) => {
      if (query.length >= 2) {
        try {
          const response = await axios.get(`${API_URL}/search?q=${query}`);
          setSearchResults(response.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  const onSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  // Export Handler
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedTaluk) params.append('taluk', selectedTaluk);

      const response = await axios.get(`${API_URL}/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pincodes_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Exported successfully!');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Favorites Handler
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('pincodeFavorites');
      if (stored) {
        const faves = JSON.parse(stored);
        setFavorites(faves.map(f => f.pincode));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = (e, item) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('pincodeFavorites');
      let faves = stored ? JSON.parse(stored) : [];

      const isFavorited = favorites.includes(item.pincode);

      if (isFavorited) {
        faves = faves.filter(f => f.pincode !== item.pincode);
        setFavorites(favorites.filter(f => f !== item.pincode));
        toast.success('Removed from favorites');
      } else {
        const withTimestamp = { ...item, addedAt: new Date().toISOString() };
        faves = [withTimestamp, ...faves];
        setFavorites([...favorites, item.pincode]);
        toast.success('Added to favorites');
      }

      localStorage.setItem('pincodeFavorites', JSON.stringify(faves));
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedTaluk('');
    setCurrentPage(1);
    setPincodeData([]);
  };

  // Pagination Handlers
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const bgClass = darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold mb-3 flex items-center gap-2">
                <Zap className="h-10 w-10" />
                PIN Code Explorer
              </h1>
              <p className="text-indigo-100 text-lg">Discover postal codes across India with advanced filtering</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: MapPin, label: 'Total PIN Codes', value: stats.totalPincodes, color: 'from-blue-500 to-blue-600' },
            { icon: Globe, label: 'States', value: stats.totalStates, color: 'from-purple-500 to-purple-600' },
            { icon: Truck, label: 'Delivery Offices', value: stats.deliveryOffices, color: 'from-green-500 to-green-600' },
            { icon: Building, label: 'Non-Delivery', value: stats.nonDeliveryOffices, color: 'from-orange-500 to-orange-600' }
          ].map((stat, idx) => (
            <div key={idx} className={`${cardBg} rounded-xl p-6 shadow-lg border hover:shadow-xl transform hover:scale-105 transition-all`}>
              <div className={`bg-gradient-to-br ${stat.color} rounded-lg p-3 w-fit mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={textSecondary}>{stat.label}</div>
              <div className={`text-3xl font-bold ${textPrimary}`}>{stat.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className={`${cardBg} rounded-xl shadow-lg border p-6 mb-6`}>
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search PIN code, office name, location..."
              value={searchQuery}
              onChange={onSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {showSuggestions && searchResults.length > 0 && (
            <div className={`absolute z-10 w-full mt-2 ${cardBg} border rounded-lg shadow-2xl max-h-64 overflow-y-auto`}>
              {searchResults.map((result) => (
                <div
                  key={result._id}
                  onClick={() => {
                    setSelectedState(result.state);
                    setSelectedDistrict(result.district);
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className={`px-4 py-3 cursor-pointer transition-colors border-b ${
                    darkMode 
                      ? 'hover:bg-gray-700 border-gray-700' 
                      : 'hover:bg-indigo-50 border-gray-200'
                  } last:border-0`}
                >
                  <div className="font-semibold text-indigo-600">{result.pincode}</div>
                  <div className={`text-sm ${textSecondary}`}>{result.officeName}</div>
                  <div className={`text-xs ${textSecondary}`}>{result.taluk}, {result.district}, {result.state}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Panel Toggle */}
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="mb-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Filter className="h-5 w-5" />
          {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filters Section */}
        {showFilterPanel && (
          <div className={`${cardBg} rounded-xl shadow-lg border p-6 mb-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${textPrimary}`}>Advanced Filters</h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* State Select */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">🌍 All States ({states.length})</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* District Select */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  District {districts.length > 0 && `(${districts.length})`}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedState}
                  className={`w-full px-4 py-2 rounded-lg border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">📍 All Districts</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* Taluk Select */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Taluk {taluks.length > 0 && `(${taluks.length})`}
                </label>
                <select
                  value={selectedTaluk}
                  onChange={(e) => setSelectedTaluk(e.target.value)}
                  disabled={!selectedDistrict}
                  className={`w-full px-4 py-2 rounded-lg border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">🏘️ All Taluks</option>
                  {taluks.map(taluk => (
                    <option key={taluk} value={taluk}>{taluk}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleLoadAllData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <TrendingUp className="h-5 w-5" />
                Load All Data
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || pincodeData.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                <Download className="h-5 w-5" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>

            {/* Selected Filters Info */}
            {(selectedState || selectedDistrict || selectedTaluk) && (
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-indigo-600`}>
                <p className={`text-sm ${textSecondary}`}>
                  <strong>Filters Applied:</strong> {selectedState || 'All States'} 
                  {selectedDistrict && ` → ${selectedDistrict}`}
                  {selectedTaluk && ` → ${selectedTaluk}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Data Display Section */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : pincodeData.length > 0 ? (
          <>
            {/* Results Info */}
            <div className={`${cardBg} rounded-xl shadow-lg border p-4 mb-4 flex justify-between items-center`}>
              <div>
                <p className={textSecondary}>
                  Showing <strong className={textPrimary}>{((currentPage - 1) * limit) + 1}</strong> to <strong className={textPrimary}>{Math.min(currentPage * limit, total)}</strong> of <strong className={textPrimary}>{total.toLocaleString()}</strong> PIN codes
                </p>
              </div>
              <div className="text-sm font-medium text-indigo-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* PIN Code Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {pincodeData.map((item) => (
                <div
                  key={item._id}
                  className={`${cardBg} rounded-xl shadow-md hover:shadow-xl border transition-all transform hover:scale-105 cursor-pointer p-5 relative group`}
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(e, item)}
                    className="absolute top-3 right-3 p-2 rounded-lg transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        favorites.includes(item.pincode)
                          ? 'text-red-500 fill-red-500'
                          : darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-300 hover:text-red-500'
                      }`}
                    />
                  </button>

                  {/* PIN Code */}
                  <div className={`text-2xl font-bold text-indigo-600 mb-2`}>{item.pincode}</div>

                  {/* Office Name */}
                  <div className={`font-semibold ${textPrimary} mb-3 text-sm line-clamp-2`}>{item.officeName}</div>

                  {/* Details Grid */}
                  <div className="space-y-2 mb-3 text-xs">
                    <div className={`flex items-center gap-2 ${textSecondary}`}>
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <span>{item.taluk}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${textSecondary}`}>
                      <Building className="h-4 w-4 text-purple-600" />
                      <span>{item.district}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${textSecondary}`}>
                      <Globe className="h-4 w-4 text-teal-600" />
                      <span>{item.state}</span>
                    </div>
                  </div>

                  {/* Delivery Status */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        item.deliveryStatus === 'Delivery'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.deliveryStatus === 'Delivery' ? '✓ Delivery' : '✗ Non-Delivery'}
                    </span>
                    <span className={`text-xs ${textSecondary}`}>{item.officeType}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`${cardBg} rounded-xl shadow-lg border p-6`}>
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`${cardBg} rounded-xl shadow-lg border p-12 text-center`}>
            <MapPin className={`h-16 w-16 mx-auto mb-4 ${textSecondary}`} />
            <p className={`text-lg ${textSecondary} mb-4`}>
              {selectedState || searchQuery ? 'No PIN codes found matching your criteria' : 'Select filters or click "Load All Data" to get started'}
            </p>
            <button
              onClick={handleLoadAllData}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Load All PIN Codes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernPincodeDashboard;
