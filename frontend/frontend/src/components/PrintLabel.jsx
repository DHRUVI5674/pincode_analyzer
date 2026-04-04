import React, { useState, useRef } from 'react';
import { Printer, Download, FileText, Settings, Eye, Package } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const PrintLabel = () => {
  const { darkMode } = useTheme();
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [labelData, setLabelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [labelSettings, setLabelSettings] = useState({
    size: 'standard', // 'small', 'standard', 'large'
    includeBarcode: true,
    includeMap: false,
    copies: 1,
    format: 'address' // 'address', 'compact', 'detailed'
  });
  const printRef = useRef();

  const handlePincodeSelect = (pincodeData) => {
    setSelectedPincode(pincodeData);
  };

  const generateLabel = async () => {
    if (!selectedPincode) {
      toast.error('Please select a PIN code first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/print-label?pincode=${selectedPincode.pincode}`);
      const data = await response.json();

      if (data.success) {
        setLabelData(data);
        toast.success('Label generated successfully!');
      } else {
        toast.error('Failed to generate label');
      }
    } catch (error) {
      console.error('Label generation error:', error);
      toast.error('Failed to generate label');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!labelData) {
      toast.error('Please generate a label first');
      return;
    }

    const printWindow = window.open('', '_blank');
    const labelHTML = generateLabelHTML();

    printWindow.document.write(`
      <html>
        <head>
          <title>PIN Code Label - ${selectedPincode.pincode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .label { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
            .barcode { font-family: 'Courier New', monospace; font-size: 24px; letter-spacing: 2px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${labelHTML}
          <div class="no-print" style="margin-top: 20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const downloadLabel = () => {
    if (!labelData) {
      toast.error('Please generate a label first');
      return;
    }

    const labelHTML = generateLabelHTML();
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PIN Code Label - ${selectedPincode.pincode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .label { border: 1px solid #ccc; padding: 15px; margin: 10px 0; page-break-inside: avoid; }
            .barcode { font-family: 'Courier New', monospace; font-size: 24px; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          ${labelHTML}
        </body>
      </html>
    `], { type: 'text/html' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pincode-label-${selectedPincode.pincode}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Label downloaded as HTML file');
  };

  const generateLabelHTML = () => {
    if (!labelData || !selectedPincode) return '';

    const labels = [];
    for (let i = 0; i < labelSettings.copies; i++) {
      labels.push(`
        <div class="label" style="
          width: ${labelSettings.size === 'small' ? '300px' : labelSettings.size === 'large' ? '500px' : '400px'};
          min-height: ${labelSettings.size === 'small' ? '150px' : labelSettings.size === 'large' ? '250px' : '200px'};
        ">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <div style="font-size: ${labelSettings.size === 'small' ? '14px' : labelSettings.size === 'large' ? '20px' : '16px'}; font-weight: bold; margin-bottom: 5px;">
                ${selectedPincode.officeName}
              </div>
              <div style="font-size: ${labelSettings.size === 'small' ? '12px' : labelSettings.size === 'large' ? '16px' : '14px'}; margin-bottom: 3px;">
                PIN Code: <strong>${selectedPincode.pincode}</strong>
              </div>
              <div style="font-size: ${labelSettings.size === 'small' ? '11px' : labelSettings.size === 'large' ? '15px' : '13px'}; margin-bottom: 3px;">
                ${selectedPincode.district}, ${selectedPincode.state}
              </div>
              ${selectedPincode.taluk ? `<div style="font-size: ${labelSettings.size === 'small' ? '11px' : labelSettings.size === 'large' ? '15px' : '13px'}; margin-bottom: 3px;">Taluk: ${selectedPincode.taluk}</div>` : ''}
              ${labelSettings.format === 'detailed' ? `
                <div style="font-size: ${labelSettings.size === 'small' ? '10px' : labelSettings.size === 'large' ? '14px' : '12px'}; margin-top: 8px; color: #666;">
                  Lat: ${selectedPincode.latitude?.toFixed(4) || 'N/A'}, Lng: ${selectedPincode.longitude?.toFixed(4) || 'N/A'}
                </div>
              ` : ''}
            </div>
            ${labelSettings.includeBarcode ? `
              <div style="margin-left: 15px;">
                <div class="barcode" style="transform: rotate(-90deg); transform-origin: center; white-space: nowrap;">
                  ||||| ${selectedPincode.pincode} |||||
                </div>
              </div>
            ` : ''}
          </div>
          ${labelSettings.includeMap ? `
            <div style="margin-top: 10px; padding: 5px; background: #f0f0f0; border-radius: 3px; font-size: 10px; text-align: center;">
              📍 Approximate Location: ${selectedPincode.latitude?.toFixed(2) || 'N/A'}, ${selectedPincode.longitude?.toFixed(2) || 'N/A'}
            </div>
          ` : ''}
        </div>
      `);
    }

    return labels.join('');
  };

  const previewLabel = () => {
    if (!labelData) return null;

    const sizeStyles = {
      small: { width: '300px', minHeight: '150px', fontSize: '12px' },
      standard: { width: '400px', minHeight: '200px', fontSize: '14px' },
      large: { width: '500px', minHeight: '250px', fontSize: '16px' }
    };

    const currentSize = sizeStyles[labelSettings.size];

    return (
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 mx-auto bg-white dark:bg-gray-800"
        style={{ width: currentSize.width, minHeight: currentSize.minHeight }}
      >
        <div className="flex justify-between items-start h-full">
          <div className="flex-1">
            <div className="font-bold mb-2" style={{ fontSize: currentSize.fontSize }}>
              {selectedPincode.officeName}
            </div>
            <div className="mb-1" style={{ fontSize: currentSize.fontSize * 0.9 }}>
              PIN Code: <strong>{selectedPincode.pincode}</strong>
            </div>
            <div className="mb-1" style={{ fontSize: currentSize.fontSize * 0.85 }}>
              {selectedPincode.district}, {selectedPincode.state}
            </div>
            {selectedPincode.taluk && (
              <div className="mb-1" style={{ fontSize: currentSize.fontSize * 0.85 }}>
                Taluk: {selectedPincode.taluk}
              </div>
            )}
            {labelSettings.format === 'detailed' && (
              <div className="mt-3 text-gray-600 dark:text-gray-400" style={{ fontSize: currentSize.fontSize * 0.8 }}>
                Lat: {selectedPincode.latitude?.toFixed(4) || 'N/A'}, Lng: {selectedPincode.longitude?.toFixed(4) || 'N/A'}
              </div>
            )}
          </div>

          {labelSettings.includeBarcode && (
            <div className="ml-4 flex items-center">
              <div
                className="font-mono font-bold tracking-wider"
                style={{
                  fontSize: currentSize.fontSize * 1.5,
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed'
                }}
              >
                ||||| {selectedPincode.pincode} |||||
              </div>
            </div>
          )}
        </div>

        {labelSettings.includeMap && (
          <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-center text-xs">
            📍 Location: {selectedPincode.latitude?.toFixed(2) || 'N/A'}, {selectedPincode.longitude?.toFixed(2) || 'N/A'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        🖨️ Print Labels
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Generate and print professional labels for PIN codes
      </p>

      {/* PIN Code Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          📍 Select PIN Code
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search PIN Code
            </label>
            <PincodeAutocomplete
              onSelect={handlePincodeSelect}
              placeholder="Enter PIN code for label..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateLabel}
              disabled={loading || !selectedPincode}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Label
                </>
              )}
            </button>
          </div>
        </div>

        {selectedPincode && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
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

      {/* Label Settings */}
      {selectedPincode && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Label Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <select
                value={labelSettings.size}
                onChange={(e) => setLabelSettings(prev => ({ ...prev, size: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="small">Small (3x1.5 in)</option>
                <option value="standard">Standard (4x2 in)</option>
                <option value="large">Large (5x2.5 in)</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <select
                value={labelSettings.format}
                onChange={(e) => setLabelSettings(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="address">Address Only</option>
                <option value="compact">Compact</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Copies
              </label>
              <select
                value={labelSettings.copies}
                onChange={(e) => setLabelSettings(prev => ({ ...prev, copies: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value={1}>1 Copy</option>
                <option value={2}>2 Copies</option>
                <option value={3}>3 Copies</option>
                <option value={5}>5 Copies</option>
                <option value={10}>10 Copies</option>
              </select>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={labelSettings.includeBarcode}
                    onChange={(e) => setLabelSettings(prev => ({ ...prev, includeBarcode: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Barcode</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={labelSettings.includeMap}
                    onChange={(e) => setLabelSettings(prev => ({ ...prev, includeMap: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Location</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Label Preview */}
      {labelData && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Label Preview
          </h2>

          <div className="flex justify-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {previewLabel()}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {labelData && (
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Label
          </button>

          <button
            onClick={downloadLabel}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download HTML
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 How to use:</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Search and select a PIN code to generate a label for</li>
          <li>• Customize label size, format, and options as needed</li>
          <li>• Preview the label before printing or downloading</li>
          <li>• Print directly from your browser or download as HTML file</li>
          <li>• Multiple copies can be generated for bulk printing</li>
          <li>• Barcode and location info can be included for detailed labels</li>
        </ul>
      </div>

      {/* Label Specifications */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 Label Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-300">
          <div>
            <div className="font-medium">Small Labels</div>
            <div>3" × 1.5" (76 × 38 mm)</div>
            <div>Compact addresses</div>
          </div>
          <div>
            <div className="font-medium">Standard Labels</div>
            <div>4" × 2" (102 × 51 mm)</div>
            <div>Full address details</div>
          </div>
          <div>
            <div className="font-medium">Large Labels</div>
            <div>5" × 2.5" (127 × 64 mm)</div>
            <div>Detailed with coordinates</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLabel;