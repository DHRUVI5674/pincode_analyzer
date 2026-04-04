import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useTheme } from '../context/ThemeContext';

const StateDistrictTalukSelector = () => {
  const { darkMode } = useTheme();
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStates, setExpandedStates] = useState(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState(new Set());
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const statesPerPage = 6;

  // Fetch all states data from MongoDB
  useEffect(() => {
    const fetchStatesData = async () => {
      try {
        setLoading(true);
        console.log('Fetching states from MongoDB...');
        const response = await fetch('http://localhost:5000/api/states');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const statesList = await response.json();
        console.log('States fetched:', statesList);

        if (!Array.isArray(statesList)) {
          throw new Error('Expected array of states');
        }

        // Fetch districts and taluks for each state
        const statesWithData = await Promise.all(
          statesList.map(async (state) => {
            try {
              const districtResponse = await fetch(
                `http://localhost:5000/api/states/${encodeURIComponent(state)}/districts`
              );
              const districts = Array.isArray(districtResponse.ok ? await districtResponse.json() : []);

              // Fetch taluks for each district
              const districtsWithTaluks = await Promise.all(
                districts.map(async (district) => {
                  try {
                    const talukResponse = await fetch(
                      `http://localhost:5000/api/states/${encodeURIComponent(state)}/districts/${encodeURIComponent(district)}/taluks`
                    );
                    const taluks = Array.isArray(talukResponse.ok ? await talukResponse.json() : []);
                    return {
                      name: district,
                      taluks: taluks || [],
                    };
                  } catch (err) {
                    console.warn(`Error fetching taluks for ${district}:`, err);
                    return {
                      name: district,
                      taluks: [],
                    };
                  }
                })
              );

              return {
                name: state,
                districts: districtsWithTaluks,
              };
            } catch (err) {
              console.warn(`Error fetching districts for ${state}:`, err);
              return {
                name: state,
                districts: [],
              };
            }
          })
        );

        setStates(statesWithData);
        setError(null);
      } catch (err) {
        console.error('Error fetching states:', err);
        setError(`Failed to load states data: ${err.message}. Make sure the backend is running on port 5000 and MongoDB is connected.`);
      } finally {
        setLoading(false);
      }
    };

    fetchStatesData();
  }, []);

  // Filter states based on search
  const filteredStates = states.filter(
    (state) =>
      state.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      state.districts.some((district) =>
        district.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        district.taluks.some((taluk) =>
          taluk.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      )
  );

  // Pagination
  const totalPages = Math.ceil(filteredStates.length / statesPerPage);
  const startIndex = (currentPage - 1) * statesPerPage;
  const endIndex = startIndex + statesPerPage;
  const paginatedStates = filteredStates.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const toggleStateExpanded = (stateName) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateName)) {
      newExpanded.delete(stateName);
    } else {
      newExpanded.add(stateName);
    }
    setExpandedStates(newExpanded);
  };

  const toggleDistrictExpanded = (districtKey) => {
    const newExpanded = new Set(expandedDistricts);
    if (newExpanded.has(districtKey)) {
      newExpanded.delete(districtKey);
    } else {
      newExpanded.add(districtKey);
    }
    setExpandedDistricts(newExpanded);
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedDistrict(null);
    setSelectedTaluk(null);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setSelectedTaluk(null);
  };

  const handleTalukSelect = (taluk) => {
    setSelectedTaluk(taluk);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading states, districts, and taluks from MongoDB...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Database: pincode</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        <h2 className="font-bold text-lg mb-2">⚠️ Error Loading MongoDB Data</h2>
        <p>{error}</p>
        <p className="text-sm mt-2">Connection: <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">mongodb://localhost:27017/pincode</code></p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalDistricts = states.reduce((acc, s) => acc + s.districts.length, 0);
  const totalTaluks = states.reduce((acc, s) => acc + s.districts.reduce((d, dis) => d + dis.taluks.length, 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        🗂️ States, Districts & Taluks Browser
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        Complete hierarchy from MongoDB database
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
        📊 Database: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">mongodb://localhost:27017/pincode</code>
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{states.length}</div>
          <div className="text-sm text-blue-800 dark:text-blue-300">Total States</div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalDistricts}</div>
          <div className="text-sm text-green-800 dark:text-green-300">Total Districts</div>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalTaluks}</div>
          <div className="text-sm text-purple-800 dark:text-purple-300">Total Taluks</div>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{filteredStates.length}</div>
          <div className="text-sm text-orange-800 dark:text-orange-300">Search Results</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search states, districts, or taluks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Selected Values Display */}
      {(selectedState || selectedDistrict || selectedTaluk) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3">📍 Selected Values:</h3>
          <div className="space-y-2 text-sm">
            {selectedState && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                <p className="text-blue-800 dark:text-blue-300"><strong>State:</strong> {selectedState}</p>
                <button onClick={() => copyToClipboard(selectedState)} className="text-blue-600 hover:text-blue-800">
                  {copiedText === selectedState ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            )}
            {selectedDistrict && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                <p className="text-blue-800 dark:text-blue-300"><strong>District:</strong> {selectedDistrict}</p>
                <button onClick={() => copyToClipboard(selectedDistrict)} className="text-blue-600 hover:text-blue-800">
                  {copiedText === selectedDistrict ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            )}
            {selectedTaluk && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                <p className="text-blue-800 dark:text-blue-300"><strong>Taluk:</strong> {selectedTaluk}</p>
                <button onClick={() => copyToClipboard(selectedTaluk)} className="text-blue-600 hover:text-blue-800">
                  {copiedText === selectedTaluk ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* States List */}
      <div className="space-y-3 mb-6">
        {paginatedStates.length > 0 ? (
          paginatedStates.map((state) => (
            <div
              key={state.name}
              className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* State Header */}
              <button
                onClick={() => {
                  toggleStateExpanded(state.name);
                  handleStateSelect(state.name);
                }}
                className={`w-full px-4 py-4 flex items-center justify-between font-semibold transition-colors ${
                  selectedState === state.name
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">🏛️ {state.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-normal bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {state.districts.length} districts • {state.districts.reduce((d, dis) => d + dis.taluks.length, 0)} taluks
                  </span>
                  {expandedStates.has(state.name) ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>

              {/* Districts List */}
              {expandedStates.has(state.name) && (
                <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
                  {state.districts.length > 0 ? (
                    state.districts.map((district) => (
                      <div key={`${state.name}-${district.name}`} className="border-b border-gray-300 dark:border-gray-600 last:border-b-0">
                        {/* District Header */}
                        <button
                          onClick={() => {
                            toggleDistrictExpanded(`${state.name}-${district.name}`);
                            handleDistrictSelect(district.name);
                          }}
                          className={`w-full px-6 py-3 flex items-center justify-between text-sm transition-colors ${
                            selectedDistrict === district.name
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200'
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="font-medium">📍 {district.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {district.taluks.length}
                            </span>
                            {expandedDistricts.has(`${state.name}-${district.name}`) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </div>
                        </button>

                        {/* Taluks List */}
                        {expandedDistricts.has(`${state.name}-${district.name}`) && (
                          <div className="bg-white dark:bg-gray-750 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                            {district.taluks.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {district.taluks.map((taluk) => (
                                  <button
                                    key={`${state.name}-${district.name}-${taluk}`}
                                    onClick={() => handleTalukSelect(taluk)}
                                    className={`px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                                      selectedTaluk === taluk
                                        ? 'bg-blue-500 text-white dark:bg-blue-600 shadow-md'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    📌 {taluk}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs">No taluks available</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-3 text-gray-500 text-sm">
                      No districts available for this state
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-lg">No states found matching your search.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Previous
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Next →
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default StateDistrictTalukSelector;
