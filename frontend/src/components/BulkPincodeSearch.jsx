import React, { useState } from 'react';
import { Search, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const BulkPincodeSearch = () => {
  const { darkMode } = useTheme();
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  const parsePincodes = (text) => {
    // Split by comma, newline, space, or semicolon
    const pincodes = text
      .split(/[,\n\s;]+/)
      .map(pin => pin.trim())
      .filter(pin => pin.length > 0 && /^\d{6}$/.test(pin));

    return [...new Set(pincodes)]; // Remove duplicates
  };

  const handleSearch = async () => {
    const pincodes = parsePincodes(inputText);

    if (pincodes.length === 0) {
      toast.error('Please enter valid PIN codes');
      return;
    }

    if (pincodes.length > 50) {
      toast.error('Maximum 50 PIN codes allowed at once');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/bulk-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pincodes }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        toast.success(`Found ${data.totalFound} out of ${data.totalRequested} PIN codes`);
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      console.error('Bulk search error:', error);
      toast.error('Failed to search PIN codes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const exportToCSV = () => {
    const foundResults = results.filter(r => r.found);
    if (foundResults.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvData = [
      ['PIN Code', 'Post Office', 'Type', 'Status', 'Taluk', 'District', 'State', 'Division', 'Region'],
      ...foundResults.map(r => [
        r.pincode,
        r.data.officeName,
        r.data.officeType,
        r.data.deliveryStatus,
        r.data.taluk,
        r.data.district,
        r.data.state,
        r.data.divisionName,
        r.data.regionName
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_pincode_search_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const sampleData = "110001, 400001, 560001, 600001, 700001, 226001, 302001, 395001, 412001, 500001";

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        🔍 Bulk PIN Code Search
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Search multiple PIN codes at once (up to 50)
      </p>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter PIN codes (comma, space, or line separated):
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Example: ${sampleData}`}
          className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {parsePincodes(inputText).length} PIN codes detected
          </div>
          <button
            onClick={() => setInputText(sampleData)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Load Sample Data
          </button>
        </div>
      </div>

      {/* Search Button */}
      <div className="mb-6">
        <button
          onClick={handleSearch}
          disabled={loading || parsePincodes(inputText).length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search PIN Codes
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Search Results ({results.filter(r => r.found).length} found)
            </h2>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          <div className="grid gap-4">
            {results.map((result) => (
              <div
                key={result.pincode}
                className={`p-4 rounded-lg border ${
                  result.found
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        result.found
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                      }`}>
                        {result.found ? '✓ Found' : '✗ Not Found'}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {result.pincode}
                      </span>
                    </div>

                    {result.found && result.data && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Post Office:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{result.data.officeName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{result.data.officeType}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            result.data.deliveryStatus === 'Delivery'
                              ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}>
                            {result.data.deliveryStatus}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">District:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{result.data.district}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">State:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{result.data.state}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Division:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{result.data.divisionName}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {result.found && (
                    <button
                      onClick={() => copyToClipboard(result.pincode)}
                      className="ml-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Copy PIN code"
                    >
                      {copiedText === result.pincode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📝 Instructions:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Enter PIN codes separated by commas, spaces, or new lines</li>
          <li>• Maximum 50 PIN codes per search</li>
          <li>• Only 6-digit PIN codes are accepted</li>
          <li>• Duplicates are automatically removed</li>
          <li>• Results show found/not found status for each PIN code</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkPincodeSearch;