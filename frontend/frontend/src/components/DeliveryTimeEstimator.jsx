import React, { useState } from 'react';
import { Clock, MapPin, ArrowRight, Calculator } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const DeliveryTimeEstimator = () => {
  const { darkMode } = useTheme();
  const [sourcePincode, setSourcePincode] = useState(null);
  const [destinationPincode, setDestinationPincode] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSourceSelect = (pincodeData) => {
    setSourcePincode(pincodeData);
  };

  const handleDestinationSelect = (pincodeData) => {
    setDestinationPincode(pincodeData);
  };

  const calculateEstimate = async () => {
    if (!sourcePincode || !destinationPincode) {
      toast.error('Please select both source and destination PIN codes');
      return;
    }

    if (sourcePincode.pincode === destinationPincode.pincode) {
      toast.error('Source and destination PIN codes cannot be the same');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/delivery-estimate?from=${sourcePincode.pincode}&to=${destinationPincode.pincode}`
      );
      const data = await response.json();

      if (data.success) {
        setEstimate(data);
        toast.success('Delivery estimate calculated!');
      } else {
        toast.error('Failed to calculate delivery estimate');
      }
    } catch (error) {
      console.error('Delivery estimate error:', error);
      toast.error('Failed to calculate delivery time');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSourcePincode(null);
    setDestinationPincode(null);
    setEstimate(null);
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case 'Local Delivery': return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200';
      case 'Regional Delivery': return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
      case 'National Delivery': return 'bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <h1 className={`text-3xl font-bold mb-2 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        ⏱️ Delivery Time Estimator
      </h1>
      <p className={`${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      } mb-6`}>
        Estimate delivery time between two PIN codes
      </p>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Source PIN Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📍 From (Source PIN Code)
          </label>
          <PincodeAutocomplete
            onSelect={handleSourceSelect}
            placeholder="Enter source PIN code..."
          />
          {sourcePincode && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
              <div className="font-medium text-green-800 dark:text-green-200">
                {sourcePincode.officeName}
              </div>
              <div className="text-green-600 dark:text-green-400">
                {sourcePincode.district}, {sourcePincode.state}
              </div>
            </div>
          )}
        </div>

        {/* Destination PIN Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🎯 To (Destination PIN Code)
          </label>
          <PincodeAutocomplete
            onSelect={handleDestinationSelect}
            placeholder="Enter destination PIN code..."
          />
          {destinationPincode && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                {destinationPincode.officeName}
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                {destinationPincode.district}, {destinationPincode.state}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={calculateEstimate}
          disabled={loading || !sourcePincode || !destinationPincode}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Calculate Delivery Time
            </>
          )}
        </button>

        <button
          onClick={resetForm}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {/* Results Section */}
      {estimate && (
        <div className="space-y-6">
          {/* Route Overview */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              📦 Delivery Route Overview
            </h2>

            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <MapPin className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {estimate.source.pincode}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {estimate.source.district}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {estimate.source.state}
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400" />

                <div className="text-center">
                  <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {estimate.destination.pincode}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {estimate.destination.district}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {estimate.destination.state}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-gray-700 rounded">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {estimate.distance}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Distance (km)</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {estimate.estimate.estimatedDays}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Est. Days</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {estimate.estimate.minDays}-{estimate.estimate.maxDays}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Range</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(estimate.estimate.serviceType)}`}>
                  {estimate.estimate.serviceType}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Estimate */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              📊 Detailed Estimate
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⏰ Time Estimate</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estimated Days:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {estimate.estimate.estimatedDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Minimum:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {estimate.estimate.minDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Maximum:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {estimate.estimate.maxDays} days
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Factors Considered</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Same State:</span>
                    <span className={`font-medium ${estimate.estimate.factors.sameState ? 'text-green-600' : 'text-red-600'}`}>
                      {estimate.estimate.factors.sameState ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Same Region:</span>
                    <span className={`font-medium ${estimate.estimate.factors.sameRegion ? 'text-green-600' : 'text-red-600'}`}>
                      {estimate.estimate.factors.sameRegion ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {estimate.estimate.factors.distance}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">ℹ️ Service Information</h3>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>• Estimates are based on standard postal service delivery times</p>
              <p>• Actual delivery may vary due to weather, holidays, or special circumstances</p>
              <p>• Express services may deliver faster than estimated</p>
              <p>• Remote areas may take additional time</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!estimate && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 How to use:</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Enter source PIN code (where the package is sent from)</li>
            <li>• Enter destination PIN code (where the package is sent to)</li>
            <li>• Click "Calculate Delivery Time" to get estimate</li>
            <li>• Estimates consider distance, state boundaries, and service types</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DeliveryTimeEstimator;