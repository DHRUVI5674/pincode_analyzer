import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Map as MapIcon, Layers, BarChart3, PieChart as PieChartIcon, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000/api';

// Define color palette
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboard = () => {
  const [officeDistribution, setOfficeDistribution] = useState([]);
  const [divisionStats, setDivisionStats] = useState([]);
  const [regionCoverage, setRegionCoverage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const normalizeAnalyticsResponse = (response, fallbackKey) => {
    if (!response?.data) {
      return [];
    }
    return response.data.data ?? response.data.breakdown ?? response.data.distribution ?? response.data[fallbackKey] ?? [];
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [officeRes, divisionRes, regionRes] = await Promise.all([
        axios.get(`${API_URL}/stats/office-distribution`),
        axios.get(`${API_URL}/stats/division-stats`),
        axios.get(`${API_URL}/stats/region-coverage`)
      ]);

      setOfficeDistribution(normalizeAnalyticsResponse(officeRes, 'breakdown'));
      setDivisionStats(normalizeAnalyticsResponse(divisionRes, 'data'));
      setRegionCoverage(normalizeAnalyticsResponse(regionRes, 'data'));
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/30 rounded-lg p-4 border border-${color}-200 dark:border-${color}-800`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-200 dark:bg-${color}-800`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-300`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const totalDivisions = divisionStats.length;
  const totalRegions = regionCoverage.length;
  const avgDeliveryPercentage = regionCoverage.length > 0
    ? (regionCoverage.reduce((sum, r) => sum + r.deliveryPercentage, 0) / regionCoverage.length).toFixed(1)
    : 0;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Advanced Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into PIN code distribution and coverage</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Layers}
          title="Total Divisions"
          value={totalDivisions}
          subtitle="Postal divisions"
          color="indigo"
        />
        <StatCard
          icon={MapIcon}
          title="Total Regions"
          value={totalRegions}
          subtitle="Geographic regions"
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          title="Avg. Delivery %"
          value={`${avgDeliveryPercentage}%`}
          subtitle="Across all regions"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Office Types"
          value={officeDistribution.length}
          subtitle="Different categories"
          color="blue"
        />
      </div>

      {/* Office Type Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Office Type Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={officeDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ officeType, count }) => `${officeType}: ${count}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {officeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Division Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Division-wise Statistics</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={divisionStats.slice(0, 10)}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="division"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="totalPincodes" fill="#6366f1" name="Total PIN Codes" />
            <Bar dataKey="deliveryOffices" fill="#10b981" name="Delivery Offices" />
            <Bar dataKey="stateCount" fill="#f59e0b" name="States Covered" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Region Coverage Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Region Coverage Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Region Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="totalOffices"
                  name="Total Offices"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="deliveryPercentage"
                  name="Delivery Percentage"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Regions" data={regionCoverage} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Region Details Table */}
          <div className="overflow-y-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left p-3 font-semibold">Region</th>
                  <th className="text-right p-3 font-semibold">Offices</th>
                  <th className="text-right p-3 font-semibold">Delivery %</th>
                </tr>
              </thead>
              <tbody>
                {regionCoverage.map((region, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRegion(region)}
                  >
                    <td className="p-3 font-medium">{region.region}</td>
                    <td className="p-3 text-right">{region.totalOffices.toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold text-green-600">{region.deliveryPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Division Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Division Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {divisionStats.map((division, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedDivision(division)}
            >
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{division.division}</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">PIN Codes:</span> {division.totalPincodes.toLocaleString()}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Delivery:</span> {division.deliveryOffices}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">States:</span> {division.stateCount}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Districts:</span> {division.districtCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Details Panel */}
      {(selectedDivision || selectedRegion) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {selectedDivision ? `Division: ${selectedDivision.division}` : `Region: ${selectedRegion.region}`}
            </h3>
            <button
              onClick={() => {
                setSelectedDivision(null);
                setSelectedRegion(null);
              }}
              className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedDivision ? (
              <>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total PIN Codes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDivision.totalPincodes}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Delivery Offices</p>
                  <p className="text-2xl font-bold text-green-600">{selectedDivision.deliveryOffices}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">States Covered</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedDivision.stateCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Districts Covered</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedDivision.districtCount}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Offices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRegion.totalOffices}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Delivery Offices</p>
                  <p className="text-2xl font-bold text-green-600">{selectedRegion.deliveryOffices}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">States Covered</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedRegion.stateCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Delivery %</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedRegion.deliveryPercentage}%</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchAnalyticsData}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;