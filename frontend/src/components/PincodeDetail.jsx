// src/components/PincodeDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Building, Truck, Globe, ArrowLeft, Loader, Heart, Navigation } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL as API_URL } from '../services/api';

const PincodeDetail = () => {
  const { pincode } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchDetails();
    checkIfFavorite();
  }, [pincode]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/pincode/${pincode}`);
      setDetails(response.data);
      
      // Add to recently viewed
      if (window.addToRecentlyViewed) {
        window.addToRecentlyViewed(response.data);
      }
    } catch (error) {
      toast.error('PIN Code not found');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('pincodeFavorites') || '[]');
      const exists = favorites.some(fav => fav.pincode === pincode);
      setIsFavorite(exists);
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    setSavingFavorite(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const favorites = JSON.parse(localStorage.getItem('pincodeFavorites') || '[]');
        const updated = favorites.filter(fav => fav.pincode !== pincode);
        localStorage.setItem('pincodeFavorites', JSON.stringify(updated));
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const favorites = JSON.parse(localStorage.getItem('pincodeFavorites') || '[]');
        const newFavorite = {
          ...details,
          addedAt: new Date().toISOString(),
        };
        
        if (favorites.some(fav => fav.pincode === pincode)) {
          toast.error('Already in favorites');
          setIsFavorite(true);
          return;
        }
        
        localStorage.setItem('pincodeFavorites', JSON.stringify([newFavorite, ...favorites]));
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
      console.error(error);
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleNearbySearch = () => {
    if (details && details.latitude && details.longitude) {
      navigate(`/nearby?lat=${details.latitude}&lng=${details.longitude}&pincode=${pincode}`);
    } else {
      toast.error('Location coordinates not available for this PIN code');
    }
  };

  const DetailCard = ({ icon: Icon, title, value }) => (
    <div className={`rounded-xl shadow-md p-5 hover:shadow-lg transition-all border ${
      darkMode
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
        : 'bg-white border-indigo-100 hover:border-indigo-300'
    }`}>
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className={`p-3 rounded-lg ${
            darkMode
              ? 'bg-indigo-900/30'
              : 'bg-gradient-to-br from-indigo-100 to-purple-100'
          }`}>
            <Icon className={`h-5 w-5 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
          </div>
        )}
        <div>
          <p className={`text-sm font-semibold ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{title}</p>
          <p className={`text-lg font-bold ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>{value || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center h-80 rounded-xl ${
        darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <Loader className="h-12 w-12 animate-spin text-indigo-600 mb-3" />
        <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading PIN code details...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button
          onClick={() => navigate('/explore')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            darkMode
              ? 'text-indigo-400 hover:bg-gray-800'
              : 'text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Explore</span>
        </button>
        <div className="flex space-x-3">
          <button
            onClick={handleNearbySearch}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              darkMode
                ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <Navigation className="h-5 w-5" />
            <span>Nearby</span>
          </button>
          <button
            onClick={toggleFavorite}
            disabled={savingFavorite}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isFavorite
                ? darkMode
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-red-100 text-red-700'
                : darkMode
                ? 'bg-gray-800 text-gray-400 hover:bg-red-900/30 hover:text-red-400'
                : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>
      </div>

      <div className={`rounded-2xl shadow-xl p-8 mb-8 ${
        darkMode
          ? 'bg-gradient-to-r from-indigo-900 to-purple-900'
          : 'bg-gradient-to-r from-indigo-600 to-purple-600'
      } text-white border border-indigo-400/20`}>
        <div className="text-center">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-indigo-200" />
          <h1 className="text-5xl font-bold mb-3">{details.pincode}</h1>
          <p className="text-xl text-indigo-100 font-semibold">{details.officeName}</p>
          <p className="text-sm text-indigo-200 mt-2">{details.Taluk}, {details.districtName}, {details.stateName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <DetailCard icon={Building} title="Office Type" value={details.officeType} />
        <DetailCard icon={Truck} title="Delivery Status" value={details.deliveryStatus} />
        <DetailCard icon={MapPin} title="Taluk" value={details.Taluk} />
        <DetailCard icon={MapPin} title="District" value={details.districtName} />
        <DetailCard icon={MapPin} title="State" value={details.stateName} />
        <DetailCard icon={Globe} title="Country" value={details.country} />
        <DetailCard title="Division" value={details.divisionName} />
        <DetailCard title="Region" value={details.regionName} />
        <DetailCard title="Circle" value={details.circleName} />
        {details.latitude && details.longitude && (
          <DetailCard 
            title="Location" 
            value={`${details.latitude}, ${details.longitude}`} 
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default PincodeDetail;
