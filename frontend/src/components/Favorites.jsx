import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Copy, ExternalLink, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL as API_URL } from '../services/api';

const Favorites = () => {
  const { darkMode } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('pincodeFavorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      toast.error('Failed to load favorites');
      console.error(error);
    }
  };

  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem('pincodeFavorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      toast.error('Failed to save favorites');
      console.error(error);
    }
  };

  const removeFavorite = (pincode) => {
    const updated = favorites.filter(fav => fav.pincode !== pincode);
    saveFavorites(updated);
    toast.success('Removed from favorites');
  };

  const addFavorite = async (pincode) => {
    const cleanPincode = pincode.trim().toUpperCase();
    
    // Validate PIN code format (must be numeric)
    if (!cleanPincode || !/^\d+$/.test(cleanPincode)) {
      toast.error('Please enter a valid numeric PIN code');
      return;
    }

    setLoading(true);
    try {
      // Check if already in favorites first
      if (favorites.some(fav => fav.pincode === cleanPincode)) {
        toast.error('Already in favorites');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/pincode/${cleanPincode}`);
      
      // Validate response has required data
      if (!response.data || !response.data.pincode) {
        toast.error('Invalid PIN code data received from server');
        setLoading(false);
        return;
      }

      const newFave = {
        ...response.data,
        addedAt: new Date().toISOString(),
      };

      const updated = [newFave, ...favorites];
      saveFavorites(updated);
      toast.success(`✓ Added PIN ${cleanPincode}: ${response.data.officeName}`);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error(`PIN code "${cleanPincode}" not found in database. Check your entry and try again.`);
      } else if (error.response?.status === 400) {
        toast.error('Invalid PIN code format');
      } else {
        toast.error('Failed to add to favorites - Check if MongoDB is running');
      }
      console.error('Error adding favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportFavorites = () => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favorites_${new Date().getTime()}.json`;
    link.click();
    toast.success('Favorites exported');
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Favorite PIN Codes
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Save and manage your frequently accessed PIN codes
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No favorites yet. Start adding PIN codes to your favorites!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={exportFavorites}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Export as JSON
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg text-pink-700 dark:text-pink-300">
                        {fav.pincode}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {fav.officeName}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(fav.pincode)}
                      className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs mb-3">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">District:</span> {fav.district}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">State:</span> {fav.state}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Type:</span> {fav.officeType}
                    </p>
                    {fav.addedAt && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                        Added: {new Date(fav.addedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(fav.pincode)}
                      className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center space-x-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      disabled
                      className="flex-1 px-2 py-1 bg-gray-400 text-white text-xs rounded cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Favorite Section */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Add to Favorites
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter a valid PIN code from the database to add it to your favorites.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter PIN code (e.g., 110001, 400001, 560001)..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-600"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                addFavorite(e.target.value.trim());
                e.target.value = '';
              }
            }}
            id="addPincodeInput"
            disabled={loading}
            maxLength="6"
          />
          <button
            onClick={async () => {
              const input = document.getElementById('addPincodeInput');
              const pincodeValue = input.value.trim();
              if (pincodeValue) {
                await addFavorite(pincodeValue);
                input.value = '';
                input.focus();
              } else {
                toast.error('Please enter a PIN code');
              }
            }}
            disabled={loading}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

        {/* Sample PIN codes reference */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">📌 Sample PIN Codes to Try:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {['110001', '400001', '560001', '600001', '700001', '226001', '302001', '395001', '412001', '500001'].map((code) => (
              <button
                key={code}
                onClick={() => {
                  const input = document.getElementById('addPincodeInput');
                  input.value = code;
                  input.focus();
                }}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors font-bold"
              >
                {code}
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            💡 Tip: Click any PIN code above to auto-fill the input field, then click Add.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
