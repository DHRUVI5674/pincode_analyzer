import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Check } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const AddressAutofillForm = () => {
  const { darkMode } = useTheme();
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    pincode: '',
    postOffice: '',
    taluk: '',
    district: '',
    state: '',
    division: '',
    region: '',
    circle: '',
    country: 'INDIA'
  });

  const handlePincodeSelect = async (pincodeData) => {
    setSelectedPincode(pincodeData);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/address-autofill/${pincodeData.pincode}`);
      const data = await response.json();

      if (data.success) {
        setAddressData(data.address);
        setManualEntry({
          pincode: data.address.pincode,
          postOffice: data.address.postOffice,
          taluk: data.address.taluk,
          district: data.address.district,
          state: data.address.state,
          division: data.address.division,
          region: data.address.region,
          circle: data.address.circle,
          country: data.address.country
        });
        toast.success('Address auto-filled successfully!');
      } else {
        toast.error('Failed to fetch address data');
      }
    } catch (error) {
      console.error('Address autofill error:', error);
      toast.error('Failed to auto-fill address');
    } finally {
      setLoading(false);
    }
  };

  const handleManualChange = (field, value) => {
    setManualEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setSelectedPincode(null);
    setAddressData(null);
    setManualEntry({
      pincode: '',
      postOffice: '',
      taluk: '',
      district: '',
      state: '',
      division: '',
      region: '',
      circle: '',
      country: 'INDIA'
    });
  };

  const copyAddress = () => {
    const addressText = `${manualEntry.postOffice}
${manualEntry.taluk}, ${manualEntry.district}
${manualEntry.state} - ${manualEntry.pincode}
${manualEntry.country}`;

    navigator.clipboard.writeText(addressText.trim());
    toast.success('Address copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        📍 Address Auto-fill Form
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Enter a PIN code to automatically fill address details
      </p>

      {/* PIN Code Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          PIN Code *
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <PincodeAutocomplete
              onSelect={handlePincodeSelect}
              placeholder="Enter PIN code to auto-fill address..."
            />
          </div>
          <button
            onClick={resetForm}
            className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-blue-700 dark:text-blue-300">Fetching address details...</span>
          </div>
        </div>
      )}

      {/* Address Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Post Office
            </label>
            <input
              type="text"
              value={manualEntry.postOffice}
              onChange={(e) => handleManualChange('postOffice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Post office name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taluk
            </label>
            <input
              type="text"
              value={manualEntry.taluk}
              onChange={(e) => handleManualChange('taluk', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Taluk name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District *
            </label>
            <input
              type="text"
              value={manualEntry.district}
              onChange={(e) => handleManualChange('district', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="District name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State *
            </label>
            <input
              type="text"
              value={manualEntry.state}
              onChange={(e) => handleManualChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="State name"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Division
            </label>
            <input
              type="text"
              value={manualEntry.division}
              onChange={(e) => handleManualChange('division', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Division name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Region
            </label>
            <input
              type="text"
              value={manualEntry.region}
              onChange={(e) => handleManualChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Region name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Circle
            </label>
            <input
              type="text"
              value={manualEntry.circle}
              onChange={(e) => handleManualChange('circle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Circle name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <input
              type="text"
              value={manualEntry.country}
              onChange={(e) => handleManualChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Country name"
            />
          </div>
        </div>
      </div>

      {/* Address Preview */}
      {(manualEntry.postOffice || manualEntry.district || manualEntry.state) && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📬 Address Preview:</h3>
          <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border">
            {manualEntry.postOffice && <div>{manualEntry.postOffice}</div>}
            {(manualEntry.taluk || manualEntry.district) && (
              <div>{[manualEntry.taluk, manualEntry.district].filter(Boolean).join(', ')}</div>
            )}
            {manualEntry.state && <div>{manualEntry.state}{manualEntry.pincode && ` - ${manualEntry.pincode}`}</div>}
            {manualEntry.country && <div>{manualEntry.country}</div>}
          </div>
          <button
            onClick={copyAddress}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Copy Address
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Start typing a PIN code to see autocomplete suggestions</li>
          <li>• Select a PIN code to auto-fill all address fields</li>
          <li>• Edit any field manually if needed</li>
          <li>• Use "Copy Address" to copy the formatted address</li>
          <li>• Click "Reset" to clear all fields</li>
        </ul>
      </div>
    </div>
  );
};

export default AddressAutofillForm;