import React, { useState } from 'react';
import { Plus, X, BarChart3, MapPin, ArrowRight, Scale } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const PincodeComparison = () => {
  const { darkMode } = useTheme();
  const [selectedPincodes, setSelectedPincodes] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePincodeSelect = (pincodeData) => {
    setCurrentSelection(pincodeData);
  };

  const addToComparison = () => {
    if (!currentSelection) {
      toast.error('Please select a PIN code first');
      return;
    }

    if (selectedPincodes.length >= 4) {
      toast.error('Maximum 4 PIN codes can be compared at once');
      return;
    }

    if (selectedPincodes.some(p => p.pincode === currentSelection.pincode)) {
      toast.error('This PIN code is already added to comparison');
      return;
    }

    setSelectedPincodes(prev => [...prev, currentSelection]);
    setCurrentSelection(null);
    toast.success('Added to comparison');
  };

  const removeFromComparison = (pincode) => {
    setSelectedPincodes(prev => prev.filter(p => p.pincode !== pincode));
    toast.success('Removed from comparison');
  };

  const clearComparison = () => {
    setSelectedPincodes([]);
    setComparisonData(null);
    toast.success('Comparison cleared');
  };

  const performComparison = async () => {
    if (selectedPincodes.length < 2) {
      toast.error('Please select at least 2 PIN codes to compare');
      return;
    }

    setLoading(true);
    try {
      const pincodes = selectedPincodes.map(p => p.pincode).join(',');
      const response = await fetch(`http://localhost:5000/api/compare-pincodes?pincodes=${pincodes}`);
      const data = await response.json();

      if (data.success) {
        setComparisonData(data);
        toast.success('Comparison completed!');
      } else {
        toast.error('Failed to compare PIN codes');
      }
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Failed to perform comparison');
    } finally {
      setLoading(false);
    }
  };

  const getDistanceBetween = (pin1, pin2) => {
    if (!comparisonData?.distances) return null;

    const key = [pin1.pincode, pin2.pincode].sort().join('-');
    return comparisonData.distances[key];
  };

  const renderComparisonTable = () => {
    if (!comparisonData) return null;

    const attributes = [
      { key: 'pincode', label: 'PIN Code', type: 'text' },
      { key: 'officeName', label: 'Office Name', type: 'text' },
      { key: 'district', label: 'District', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'taluk', label: 'Taluk', type: 'text' },
      { key: 'latitude', label: 'Latitude', type: 'number' },
      { key: 'longitude', label: 'Longitude', type: 'number' }
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">
                Attribute
              </th>
              {selectedPincodes.map((pin, index) => (
                <th key={pin.pincode} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-blue-${(index % 4) + 1}00`}></div>
                    <span className="text-gray-900 dark:text-white font-medium">{pin.pincode}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr) => (
              <tr key={attr.key} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-900 dark:text-white">
                  {attr.label}
                </td>
                {selectedPincodes.map((pin) => (
                  <td key={pin.pincode} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                    {pin[attr.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDistanceMatrix = () => {
    if (!comparisonData?.distances || selectedPincodes.length < 2) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          📏 Distance Matrix (km)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                  From → To
                </th>
                {selectedPincodes.map((pin) => (
                  <th key={pin.pincode} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                    {pin.pincode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedPincodes.map((fromPin) => (
                <tr key={fromPin.pincode} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-900 dark:text-white">
                    {fromPin.pincode}
                  </td>
                  {selectedPincodes.map((toPin) => {
                    const distance = getDistanceBetween(fromPin, toPin);
                    return (
                      <td key={toPin.pincode} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        {fromPin.pincode === toPin.pincode ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {distance ? `${distance.toFixed(1)} km` : '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        ⚖️ PIN Code Comparison
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Compare multiple PIN codes side by side with distances and details
      </p>

      {/* Add PIN Codes Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          ➕ Add PIN Codes to Compare
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search PIN Code
            </label>
            <PincodeAutocomplete
              onSelect={handlePincodeSelect}
              placeholder="Enter PIN code..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addToComparison}
              disabled={!currentSelection || selectedPincodes.length >= 4}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add to Comparison
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearComparison}
              disabled={selectedPincodes.length === 0}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>

        {currentSelection && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  {currentSelection.officeName}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  PIN: {currentSelection.pincode} • {currentSelection.district}, {currentSelection.state}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected PIN Codes */}
      {selectedPincodes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📍 Selected PIN Codes ({selectedPincodes.length}/4)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {selectedPincodes.map((pin, index) => (
              <div
                key={pin.pincode}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-4 h-4 rounded-full bg-blue-${(index % 4) + 1}00 flex-shrink-0`}></div>
                  <button
                    onClick={() => removeFromComparison(pin.pincode)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {pin.officeName}
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {pin.pincode}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {pin.district}, {pin.state}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compare Button */}
          <div className="text-center">
            <button
              onClick={performComparison}
              disabled={loading || selectedPincodes.length < 2}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Comparing...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4" />
                  Compare PIN Codes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedPincodes.length}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">PIN Codes Compared</div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {new Set(selectedPincodes.map(p => p.state)).size}
              </div>
              <div className="text-sm text-green-800 dark:text-green-300">States Covered</div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {new Set(selectedPincodes.map(p => p.district)).size}
              </div>
              <div className="text-sm text-orange-800 dark:text-orange-300">Districts Covered</div>
            </div>
          </div>

          {/* Comparison Table */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              📊 Detailed Comparison
            </h2>
            {renderComparisonTable()}
          </div>

          {/* Distance Matrix */}
          {renderDistanceMatrix()}

          {/* Insights */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              💡 Comparison Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Geographic Distribution</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• States: {[...new Set(selectedPincodes.map(p => p.state))].join(', ')}</li>
                  <li>• Districts: {[...new Set(selectedPincodes.map(p => p.district))].join(', ')}</li>
                  <li>• Coverage: {comparisonData.coverage || 'Local to regional'}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Distance Analysis</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Closest pair: {comparisonData.closestPair ? `${comparisonData.closestPair.distance.toFixed(1)} km` : 'N/A'}</li>
                  <li>• Furthest pair: {comparisonData.furthestPair ? `${comparisonData.furthestPair.distance.toFixed(1)} km` : 'N/A'}</li>
                  <li>• Average distance: {comparisonData.averageDistance ? `${comparisonData.averageDistance.toFixed(1)} km` : 'N/A'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 How to use:</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Search and add up to 4 PIN codes to compare</li>
          <li>• Click "Compare PIN Codes" to generate detailed comparison</li>
          <li>• View side-by-side attribute comparison in the table</li>
          <li>• Check distance matrix for distances between all PIN code pairs</li>
          <li>• Review insights for geographic distribution and distance analysis</li>
          <li>• Remove individual PIN codes or clear all to start over</li>
        </ul>
      </div>
    </div>
  );
};

export default PincodeComparison;