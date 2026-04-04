import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, Loader } from 'lucide-react';
import * as API from '../services/api';
import { useTheme } from '../context/ThemeContext';

const FilterPanel = ({ onApplyFilters }) => {
  const { darkMode } = useTheme();
  // State management
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);

  // Selected values
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');

  // Loading states
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTaluks, setLoadingTaluks] = useState(false);

  // Error states
  const [errorStates, setErrorStates] = useState(null);
  const [errorDistricts, setErrorDistricts] = useState(null);
  const [errorTaluks, setErrorTaluks] = useState(null);

  // 1. Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoadingStates(true);
        setErrorStates(null);
        console.log('[FilterPanel] Loading states...');
        const data = await API.getStates();
        setStates(data);
        console.log(`[FilterPanel] Loaded ${data.length} states`);
      } catch (error) {
        console.error('[FilterPanel] Error loading states:', error);
        setErrorStates(error.message || 'Failed to load states');
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // 2. Load districts when state changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistrict('');
      setTaluks([]);
      setSelectedTaluk('');
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        setErrorDistricts(null);
        console.log(`[FilterPanel] Loading districts for state: ${selectedState}`);
        const data = await API.getDistricts(selectedState);
        setDistricts(data);
        setSelectedDistrict(''); // Reset district
        setTaluks([]); // Reset taluks
        setSelectedTaluk(''); // Reset taluk
        console.log(`[FilterPanel] Loaded ${data.length} districts for ${selectedState}`);
      } catch (error) {
        console.error('[FilterPanel] Error loading districts:', error);
        setErrorDistricts(error.message || 'Failed to load districts');
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [selectedState]);

  // 3. Load taluks when district changes
  useEffect(() => {
    if (!selectedState || !selectedDistrict) {
      setTaluks([]);
      setSelectedTaluk('');
      return;
    }

    const loadTaluks = async () => {
      try {
        setLoadingTaluks(true);
        setErrorTaluks(null);
        console.log(
          `[FilterPanel] Loading taluks for state: ${selectedState}, district: ${selectedDistrict}`
        );
        const data = await API.getTaluks(selectedState, selectedDistrict);
        setTaluks(data);
        setSelectedTaluk(''); // Reset taluk
        console.log(`[FilterPanel] Loaded ${data.length} taluks`);
      } catch (error) {
        console.error('[FilterPanel] Error loading taluks:', error);
        setErrorTaluks(error.message || 'Failed to load taluks');
        setTaluks([]);
      } finally {
        setLoadingTaluks(false);
      }
    };

    loadTaluks();
  }, [selectedState, selectedDistrict]);

  // Handle form submission
  const handleApplyFilters = () => {
    const filters = {
      state: selectedState,
      district: selectedDistrict,
      taluk: selectedTaluk,
    };
    console.log('[FilterPanel] Applying filters:', filters);
    onApplyFilters(filters);
  };

  // Handle reset
  const handleReset = () => {
    console.log('[FilterPanel] Resetting filters');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedTaluk('');
    setDistricts([]);
    setTaluks([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Filter PIN Codes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* States Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State
          </label>
          <div className="relative">
            {loadingStates && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Loader className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            )}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={loadingStates}
              className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${
                loadingStates ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <option value="">
                {loadingStates ? 'Loading states...' : 'Select a state'}
              </option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          {errorStates && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorStates}
            </div>
          )}
        </div>

        {/* Districts Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            District
          </label>
          <div className="relative">
            {loadingDistricts && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Loader className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            )}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState || loadingDistricts}
              className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${
                !selectedState || loadingDistricts ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <option value="">
                {!selectedState
                  ? 'Select a state first'
                  : loadingDistricts
                    ? 'Loading districts...'
                    : 'Select a district'}
              </option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          {errorDistricts && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorDistricts}
            </div>
          )}
        </div>

        {/* Taluks Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Taluk
          </label>
          <div className="relative">
            {loadingTaluks && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Loader className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            )}
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              disabled={!selectedDistrict || loadingTaluks}
              className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${
                !selectedDistrict || loadingTaluks ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <option value="">
                {!selectedDistrict
                  ? 'Select a district first'
                  : loadingTaluks
                    ? 'Loading taluks...'
                    : 'Select a taluk (optional)'}
              </option>
              {taluks.map((taluk) => (
                <option key={taluk} value={taluk}>
                  {taluk}
                </option>
              ))}
            </select>
          </div>
          {errorTaluks && (
            <div className="flex items-center mt-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorTaluks}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleApplyFilters}
          disabled={!selectedState || !selectedDistrict}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Clear/Reset
        </button>
      </div>

      {/* Selected Values Info */}
      {(selectedState || selectedDistrict || selectedTaluk) && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Current Selection:</strong>
            {selectedState && ` State: ${selectedState}`}
            {selectedDistrict && `, District: ${selectedDistrict}`}
            {selectedTaluk && `, Taluk: ${selectedTaluk}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
