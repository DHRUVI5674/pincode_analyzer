import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Download, Loader, Heart, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL as API_URL } from '../services/api';

const Explore = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [pincodeData, setPincodeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchStates();
    fetchPincodeData();
    loadFavorites();
  }, []);

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

  useEffect(() => {
    if (selectedState) {
      fetchDistrictsByState(selectedState);
      setSelectedDistrict('');
      setSelectedTaluk('');
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedState && selectedDistrict) {
      fetchTaluksByDistrict(selectedState, selectedDistrict);
      setSelectedTaluk('');
    } else {
      setTaluks([]);
    }
  }, [selectedState, selectedDistrict]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPincodeData();
  }, [selectedState, selectedDistrict, selectedTaluk]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchPincodeData();
    }
  }, [currentPage]);

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_URL}/states`);
      setStates(response.data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
      toast.error('Failed to fetch states');
    }
  };

  const fetchDistrictsByState = async (state) => {
    try {
      const response = await axios.get(`${API_URL}/states/${encodeURIComponent(state)}/districts`);
      setDistricts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      toast.error('Failed to fetch districts');
      setDistricts([]);
    }
  };

  const fetchTaluksByDistrict = async (state, district) => {
    try {
      const response = await axios.get(`${API_URL}/states/${encodeURIComponent(state)}/districts/${encodeURIComponent(district)}/taluks`);
      setTaluks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch taluks:', error);
      toast.error('Failed to fetch taluks');
      setTaluks([]);
    }
  };

  const fetchPincodeData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20
      };
      if (selectedState) params.state = selectedState;
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedTaluk) params.taluk = selectedTaluk;
      
      console.log('Fetching pincodes with params:', params);
      const response = await axios.get(`${API_URL}/pincodes`, { params });
      console.log('Pincodes response:', response.data);
      setPincodeData(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch PIN code data:', error);
      toast.error('Failed to fetch PIN code data');
      setPincodeData([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSuggestionClick = (pincode) => {
    navigate(`/pincode/${pincode}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleExportCurrentPage = () => {
    if (pincodeData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    try {
      const headers = ['PIN Code', 'Office Name', 'Type', 'Taluk', 'District', 'State', 'Delivery Status'];
      const csvContent = [
        headers.join(','),
        ...pincodeData.map(item => [
          item.pincode,
          `"${item.officeName || ''}"`,
          `"${item.officeType || ''}"`,
          `"${item.Taluk || ''}"`,
          `"${item.districtName || ''}"`,
          `"${item.stateName || ''}"`,
          `"${item.deliveryStatus || ''}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pincode_page_${currentPage}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Page exported to CSV successfully');
    } catch (error) {
      toast.error('Failed to export page');
      console.error(error);
    }
  };

  const handleExportAll = async () => {
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
      link.setAttribute('download', `pincodes_full_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Full Data Export completed successfully');
    } catch (error) {
      toast.error('Export failed. Backend might need a restart.');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedTaluk('');
    setCurrentPage(1);
  };

  const toggleFavorite = (e, item) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('pincodeFavorites');
      let faves = stored ? JSON.parse(stored) : [];
      
      const isFavorited = faves.some(f => f.pincode === item.pincode);
      
      if (isFavorited) {
        faves = faves.filter(f => f.pincode !== item.pincode);
        toast.success('Removed from favorites');
      } else {
        const withTimestamp = {
          ...item,
          addedAt: new Date().toISOString(),
        };
        faves = [withTimestamp, ...faves];
        toast.success('Added to favorites');
      }
      
      localStorage.setItem('pincodeFavorites', JSON.stringify(faves));
      setFavorites(faves.map(f => f.pincode));
    } catch (error) {
      toast.error('Failed to update favorites');
      console.error(error);
    }
  };

  return (
    <div className={`space-y-6 p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header with gradient */}
      <div className={`mb-8 p-6 rounded-xl ${
        darkMode
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-700'
          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
      }`}>
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
          Explore PIN Codes
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-indigo-100'}`}>Search and filter PIN codes across India with real-time data</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-indigo-400'}`} />
          <input
            type="text"
            placeholder="Search by PIN code, office name, or location..."
            value={searchQuery}
            onChange={onSearchChange}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-indigo-200 text-gray-900 placeholder-gray-500'
            }`}
            onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
          />
        </div>
        
        {showSuggestions && searchResults.length > 0 && (
          <div className={`absolute z-10 w-full mt-2 rounded-xl shadow-xl max-h-80 overflow-y-auto border ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-indigo-200'
          }`}>
            {searchResults.map((result) => (
              <div
                key={result._id}
                onClick={() => handleSuggestionClick(result.pincode)}
                className={`px-4 py-3 cursor-pointer transition-colors border-b last:border-0 hover:scale-100 ${
                  darkMode
                    ? 'hover:bg-gray-700 border-gray-700'
                    : 'hover:bg-indigo-50 border-indigo-100'
                }`}
              >
                <div className={`font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{result.pincode}</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{result.officeName}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{result.Taluk}, {result.districtName}, {result.stateName}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className={`rounded-xl border-2 p-6 shadow-sm ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-indigo-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <Filter className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Filters</h2>
          </div>
          {(selectedState || selectedDistrict || selectedTaluk) && (
            <button
              onClick={clearFilters}
              className={`text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                darkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-indigo-200 text-gray-900'
              }`}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:opacity-50'
                  : 'bg-white border-indigo-200 text-gray-900 disabled:bg-gray-100'
              }`}
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Taluk</label>
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              disabled={!selectedDistrict}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:opacity-50'
                  : 'bg-white border-indigo-200 text-gray-900 disabled:bg-gray-100'
              }`}
            >
              <option value="">All Taluks</option>
              {taluks.map(taluk => (
                <option key={taluk} value={taluk}>{taluk}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-between items-center gap-3">
        <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {total > 0 ? `${total.toLocaleString()} PIN codes available` : 'Select filters to view data'}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCurrentPage}
            disabled={pincodeData.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>Export Page CSV</span>
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting || total === 0}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
          >
            {exporting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{exporting ? 'Exporting...' : 'Export All Full CSV'}</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className={`rounded-xl border-2 overflow-hidden shadow-lg ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-indigo-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-0">
            <thead className={darkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}>
              <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-indigo-200'}`}>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>PIN Code</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>Office Name</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>Type</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>Taluk</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>District</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>State</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>Delivery</th>
                <th className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>Favorite</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-indigo-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan="8" className={`px-6 py-16 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                      <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading PIN codes...</p>
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Fetching data from your selection</p>
                    </div>
                  </td>
                </tr>
              ) : pincodeData.length === 0 ? (
                <tr>
                  <td colSpan="8" className={`px-6 py-16 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="h-10 w-10 text-gray-400 mb-4 opacity-50" />
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No data found</p>
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Try selecting different filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pincodeData.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => navigate(`/pincode/${item.pincode}`)}
                    className={`cursor-pointer transition-all duration-200 ${
                      darkMode
                        ? 'hover:bg-gray-700/50'
                        : 'hover:bg-indigo-50'
                    }`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{item.pincode}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.officeName}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.officeType}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.Taluk}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.districtName}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.stateName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.deliveryStatus === 'Delivery' 
                          ? darkMode
                            ? 'bg-green-900/40 text-green-300 border border-green-700'
                            : 'bg-green-100 text-green-800 border border-green-300'
                          : darkMode
                          ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {item.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => toggleFavorite(e, item)}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                          darkMode
                            ? 'hover:bg-gray-600'
                            : 'hover:bg-indigo-100'
                        }`}
                      >
                        <Heart
                          className={`h-5 w-5 transition-all ${
                            favorites.includes(item.pincode)
                              ? 'fill-red-500 text-red-500'
                              : darkMode ? 'text-gray-500 hover:text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > 0 && (
          <div className={`px-6 py-5 border-t-2 flex items-center justify-between flex-wrap gap-4 ${
            darkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
          }`}>
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-indigo-700'}`}>
              Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{((currentPage - 1) * 20) + 1}</span> to{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.min(currentPage * 20, total)}</span> of{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{total.toLocaleString()}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium ${
                  darkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-700 disabled:border-gray-800'
                    : 'border-indigo-300 text-indigo-700 hover:bg-indigo-100 disabled:border-gray-300'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-all font-semibold ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : darkMode
                          ? 'text-gray-400 hover:bg-gray-700 border border-gray-700'
                          : 'text-indigo-600 hover:bg-indigo-100 border border-indigo-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium ${
                  darkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-700 disabled:border-gray-800'
                    : 'border-indigo-300 text-indigo-700 hover:bg-indigo-100 disabled:border-gray-300'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
