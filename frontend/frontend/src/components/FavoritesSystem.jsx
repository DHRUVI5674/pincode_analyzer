import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Star, MapPin, Search, Download } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const FavoritesSystem = () => {
  const { darkMode } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'pincode'

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('pincodeFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
        localStorage.removeItem('pincodeFavorites');
      }
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('pincodeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handlePincodeSelect = (pincodeData) => {
    setSelectedPincode(pincodeData);
  };

  const addToFavorites = () => {
    if (!selectedPincode) {
      toast.error('Please select a PIN code first');
      return;
    }

    // Check if already in favorites
    const exists = favorites.some(fav => fav.pincode === selectedPincode.pincode);
    if (exists) {
      toast.error('This PIN code is already in your favorites');
      return;
    }

    const newFavorite = {
      ...selectedPincode,
      addedAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    setFavorites(prev => [newFavorite, ...prev]);
    setSelectedPincode(null);
    toast.success('Added to favorites!');
  };

  const removeFromFavorites = (pincode) => {
    setFavorites(prev => prev.filter(fav => fav.pincode !== pincode));
    toast.success('Removed from favorites');
  };

  const clearAllFavorites = () => {
    if (favorites.length === 0) return;

    if (window.confirm(`Are you sure you want to remove all ${favorites.length} favorites?`)) {
      setFavorites([]);
      toast.success('All favorites cleared');
    }
  };

  const exportFavorites = () => {
    if (favorites.length === 0) {
      toast.error('No favorites to export');
      return;
    }

    const csvContent = [
      ['PIN Code', 'Office Name', 'District', 'State', 'Taluk', 'Added Date'],
      ...favorites.map(fav => [
        fav.pincode,
        fav.officeName,
        fav.district,
        fav.state,
        fav.taluk || '',
        new Date(fav.addedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pincode-favorites-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Favorites exported to CSV');
  };

  // Filter and sort favorites
  const filteredFavorites = favorites
    .filter(fav =>
      fav.pincode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fav.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fav.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fav.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.officeName.localeCompare(b.officeName);
        case 'pincode':
          return a.pincode.localeCompare(b.pincode);
        case 'date':
        default:
          return new Date(b.addedAt) - new Date(a.addedAt);
      }
    });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        ❤️ Favorites System
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Save and manage your favorite PIN codes for quick access
      </p>

      {/* Add to Favorites Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          ➕ Add to Favorites
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search PIN Code
            </label>
            <PincodeAutocomplete
              onSelect={handlePincodeSelect}
              placeholder="Enter PIN code to add..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addToFavorites}
              disabled={!selectedPincode}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Add to Favorites
            </button>
          </div>
        </div>

        {selectedPincode && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  {selectedPincode.officeName}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  PIN: {selectedPincode.pincode} • {selectedPincode.district}, {selectedPincode.state}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Favorites Management */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            ⭐ Your Favorites ({favorites.length})
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="pincode">Sort by PIN</option>
          </select>

          {/* Export */}
          <button
            onClick={exportFavorites}
            disabled={favorites.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {/* Clear All */}
          <button
            onClick={clearAllFavorites}
            disabled={favorites.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          {favorites.length === 0 ? (
            <div>
              <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Search for PIN codes above and add them to your favorites for quick access.
              </p>
            </div>
          ) : (
            <div>
              <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No matches found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((favorite) => (
            <div
              key={favorite.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Favorite
                  </span>
                </div>
                <button
                  onClick={() => removeFromFavorites(favorite.pincode)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {favorite.officeName}
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    PIN: {favorite.pincode}
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>{favorite.district}, {favorite.state}</div>
                  {favorite.taluk && <div>Taluk: {favorite.taluk}</div>}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                  Added: {new Date(favorite.addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {favorites.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">📊 Favorites Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Total Favorites</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{favorites.length}</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">States</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {new Set(favorites.map(f => f.state)).size}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Districts</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {new Set(favorites.map(f => f.district)).size}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Added Today</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {favorites.filter(f => {
                  const today = new Date().toDateString();
                  return new Date(f.addedAt).toDateString() === today;
                }).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 How to use:</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Search for PIN codes using the autocomplete above</li>
          <li>• Click "Add to Favorites" to save PIN codes for quick access</li>
          <li>• Use the search bar to find specific favorites</li>
          <li>• Sort favorites by date added, name, or PIN code</li>
          <li>• Export your favorites to CSV for backup</li>
          <li>• Click the trash icon to remove individual favorites</li>
        </ul>
      </div>
    </div>
  );
};

export default FavoritesSystem;