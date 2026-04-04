import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MapPin, Building2, Truck, Package, TrendingUp, PieChart as PieChartIcon, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [stateDistribution, setStateDistribution] = useState([]);
  const [deliveryDistribution, setDeliveryDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, distributionRes, deliveryRes] = await Promise.all([
        axios.get(`${API_URL}/stats`),
        axios.get(`${API_URL}/stats/state-distribution`),
        axios.get(`${API_URL}/stats/delivery-distribution`)
      ]);
      
      setStats(statsRes.data);
      setStateDistribution(distributionRes.data.slice(0, 10));
      setDeliveryDistribution(deliveryRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgGradient }) => (
    <div className={`rounded-2xl shadow-xl p-6 card-hover overflow-hidden relative ${
      darkMode
        ? 'bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600'
        : bgGradient || 'bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl'
    }`}>
      <div className="absolute inset-0 opacity-10">
        <Icon className={`absolute -right-8 -top-8 h-24 w-24 ${
          darkMode ? 'text-indigo-400' : `text-${color}-400`
        }`} />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{title}</p>
          <p className={`text-3xl font-bold mt-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>{value?.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl backdrop-blur-md ${
          darkMode
            ? 'bg-indigo-500/20 border border-indigo-500/30'
            : `bg-gradient-to-br from-${color}-100 to-${color}-50 border border-${color}-200`
        }`}>
          <Icon className={`h-8 w-8 ${
            darkMode ? 'text-indigo-300' : `text-${color}-600`
          }`} />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'];

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center h-96 rounded-xl ${
        darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <Loader className="h-12 w-12 animate-spin text-indigo-600" />
        <p className={`mt-4 text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
          Dashboard
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}`}>India PIN Code Statistics Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={MapPin} title="Total PIN Codes" value={stats?.totalPincodes} color="indigo" bgGradient="bg-gradient-to-br from-indigo-50 to-indigo-100" />
        <StatCard icon={Building2} title="Total States/UTs" value={stats?.totalStates} color="purple" bgGradient="bg-gradient-to-br from-purple-50 to-purple-100" />
        <StatCard icon={Truck} title="Delivery Offices" value={stats?.deliveryOffices} color="green" bgGradient="bg-gradient-to-br from-green-50 to-green-100" />
        <StatCard icon={Package} title="Non-Delivery Offices" value={stats?.nonDeliveryOffices} color="orange" bgGradient="bg-gradient-to-br from-orange-50 to-orange-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Bar Chart */}
        <div className={`rounded-2xl shadow-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'
        }`}>
          <div className={`px-6 py-5 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'}`}>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Top 10 States by PIN Codes</h2>
            </div>
          </div>
          <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stateDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ddd'} />
              <XAxis 
                dataKey="state" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 12, fill: darkMode ? '#999' : '#666' }}
              />
              <YAxis tick={{ fill: darkMode ? '#999' : '#666' }} />
              <Tooltip contentStyle={{
                backgroundColor: darkMode ? '#333' : '#fff',
                border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                color: darkMode ? '#fff' : '#000'
              }} />
              <Legend />
              <Bar dataKey="count" fill="#6366f1" name="Number of PIN Codes" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className={`rounded-2xl shadow-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'
        }`}>
          <div className={`px-6 py-5 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'}`}>
            <div className="flex items-center space-x-2">
              <PieChartIcon className="h-6 w-6 text-indigo-600" />
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Delivery Status Distribution</h2>
            </div>
          </div>
          <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Delivery', value: deliveryDistribution?.delivery || 0 },
                  { name: 'Non-Delivery', value: deliveryDistribution?.nonDelivery || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip contentStyle={{
                backgroundColor: darkMode ? '#333' : '#fff',
                border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                color: darkMode ? '#fff' : '#000'
              }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;