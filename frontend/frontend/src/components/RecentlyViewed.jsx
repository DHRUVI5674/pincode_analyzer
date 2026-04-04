import React, { useState, useEffect } from 'react';
import { Clock, Eye, Trash2, History, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const RecentlyViewed = () => {
  const { darkMode } = useTheme();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxItems, setMaxItems] = useState(50);

  // Load recently viewed from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewedPincodes');
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recently viewed:', error);
        localStorage.removeItem('recentlyViewedPincodes');
      }
    }
  }, []);

  // Save to localStorage whenever recentlyViewed changes
  useEffect(() => {
    localStorage.setItem('recentlyViewedPincodes', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Function to add a PIN code to recently viewed (called from other components)
  const addToRecentlyViewed = (pincodeData) => {
    const newEntry = {
      ...pincodeData,
      viewedAt: new Date().toISOString(),
      id: `${pincodeData.pincode}_${Date.now()}`
    };

    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.pincode !== pincodeData.pincode);
      // Add to beginning and limit to maxItems
      return [newEntry, ...filtered].slice(0, maxItems);
    });
  };

  // Expose addToRecentlyViewed globally for other components
  useEffect(() => {
    window.addToRecentlyViewed = addToRecentlyViewed;
    return () => {
      delete window.addToRecentlyViewed;
    };
  }, [maxItems]);

  const removeFromRecentlyViewed = (id) => {
    setRecentlyViewed(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from recently viewed');
  };

  const clearAllRecentlyViewed = () => {
    if (recentlyViewed.length === 0) return;

    if (window.confirm(`Are you sure you want to clear all ${recentlyViewed.length} recently viewed items?`)) {
      setRecentlyViewed([]);
      toast.success('Recently viewed history cleared');
    }
  };

  const exportRecentlyViewed = () => {
    if (recentlyViewed.length === 0) {
      toast.error('No recently viewed items to export');
      return;
    }

    const csvContent = [
      ['PIN Code', 'Office Name', 'District', 'State', 'Taluk', 'Viewed Date', 'Viewed Time'],
      ...recentlyViewed.map(item => [
        item.pincode,
        item.officeName,
        item.district,
        item.state,
        item.taluk || '',
        new Date(item.viewedAt).toLocaleDateString(),
        new Date(item.viewedAt).toLocaleTimeString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recently-viewed-pincodes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Recently viewed exported to CSV');
  };

  // Filter recently viewed
  const filteredItems = recentlyViewed.filter(item =>
    item.pincode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const viewedAt = new Date(dateString);
    const diffInMinutes = Math.floor((now - viewedAt) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return viewedAt.toLocaleDateString();
  };

  const getTimeCategory = (dateString) => {
    const now = new Date();
    const viewedAt = new Date(dateString);
    const diffInHours = (now - viewedAt) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'recent';
    if (diffInHours < 24) return 'today';
    if (diffInHours < 168) return 'week'; // 7 days
    return 'older';
  };

  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = getTimeCategory(item.viewedAt);
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  const categoryLabels = {
    recent: 'Just Now (Last Hour)',
    today: 'Today',
    week: 'This Week',
    older: 'Older'
  };

  const categoryColors = {
    recent: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
    today: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
    week: 'bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200',
    older: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        🕐 Recently Viewed
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Track and revisit PIN codes you've recently looked up
      </p>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📋 Recent Activity ({recentlyViewed.length})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatically tracks PIN codes you view across the app
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Max Items */}
          <select
            value={maxItems}
            onChange={(e) => setMaxItems(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={25}>Max 25</option>
            <option value={50}>Max 50</option>
            <option value={100}>Max 100</option>
            <option value={200}>Max 200</option>
          </select>

          {/* Export */}
          <button
            onClick={exportRecentlyViewed}
            disabled={recentlyViewed.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {/* Clear All */}
          <button
            onClick={clearAllRecentlyViewed}
            disabled={recentlyViewed.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Recently Viewed List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          {recentlyViewed.length === 0 ? (
            <div>
              <History className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No recently viewed PIN codes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start exploring PIN codes and they'll appear here automatically.
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
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[category]}`}>
                  {categoryLabels[category]} ({items.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Viewed {getTimeAgo(item.viewedAt)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromRecentlyViewed(item.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Remove from recently viewed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.officeName}
                        </div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          PIN: {item.pincode}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>{item.district}, {item.state}</div>
                        {item.taluk && <div>Taluk: {item.taluk}</div>}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {new Date(item.viewedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {recentlyViewed.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">📊 Activity Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Total Viewed</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{recentlyViewed.length}</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Last Hour</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {recentlyViewed.filter(item => getTimeCategory(item.viewedAt) === 'recent').length}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Today</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {recentlyViewed.filter(item => getTimeCategory(item.viewedAt) === 'today').length}
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">This Week</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {recentlyViewed.filter(item => getTimeCategory(item.viewedAt) === 'week').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 How it works:</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Automatically tracks PIN codes you view across the app</li>
          <li>• Items are grouped by when you viewed them (last hour, today, this week, older)</li>
          <li>• Use the search bar to find specific recently viewed PIN codes</li>
          <li>• Adjust the maximum number of items to keep in history</li>
          <li>• Export your viewing history to CSV for analysis</li>
          <li>• Click the trash icon to remove individual items</li>
        </ul>
      </div>

      {/* Demo Data Note */}
      {recentlyViewed.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 Demo: Add Sample Data</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            To see how this feature works, you can add some sample recently viewed items:
          </p>
          <button
            onClick={() => {
              const sampleData = [
                { pincode: '110001', officeName: 'Connaught Place', district: 'New Delhi', state: 'Delhi', taluk: 'New Delhi' },
                { pincode: '400001', officeName: 'Fort', district: 'Mumbai', state: 'Maharashtra', taluk: 'Mumbai' },
                { pincode: '700001', officeName: 'BBD Bagh', district: 'Kolkata', state: 'West Bengal', taluk: 'Kolkata' },
                { pincode: '560001', officeName: 'Dr. B.R. Ambedkar Veedhi', district: 'Bangalore', state: 'Karnataka', taluk: 'Bangalore' }
              ];

              sampleData.forEach((item, index) => {
                setTimeout(() => {
                  addToRecentlyViewed(item);
                }, index * 100);
              });

              toast.success('Added sample recently viewed items');
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Add Sample Data
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;