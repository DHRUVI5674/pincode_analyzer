import React from 'react';
import { MapPin, Database, Zap, Shield, Heart, Users, Award, Clock, Globe, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const About = () => {
  const { darkMode } = useTheme();
  const features = [
    { icon: Database, title: 'Comprehensive Database', description: 'Access to over 154,000+ PIN codes across all 28 states and 8 union territories of India.', color: 'blue' },
    { icon: Zap, title: 'Fast & Efficient', description: 'Lightning-fast search with optimized queries and real-time filtering capabilities.', color: 'yellow' },
    { icon: Shield, title: 'Reliable Data', description: 'Regularly updated and verified data from official India Post sources.', color: 'green' },
    { icon: Heart, title: 'User Friendly', description: 'Intuitive interface with powerful search and filter options for easy navigation.', color: 'red' },
    { icon: Users, title: 'Free to Use', description: 'Completely free service for individuals, businesses, and developers.', color: 'purple' },
    { icon: MapPin, title: 'Location Intelligence', description: 'Geographic coordinates and delivery status for each PIN code.', color: 'indigo' }
  ];

  const stats = [
    { value: '154K+', label: 'PIN Codes', icon: MapPin },
    { value: '36+', label: 'States & UTs', icon: Globe },
    { value: '100%', label: 'Data Coverage', icon: Award },
    { value: '24/7', label: 'Availability', icon: Clock }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${
          darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-100 to-purple-100'
        }`}>
          <MapPin className={`h-10 w-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
          darkMode ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-indigo-600 via-purple-600 to-pink-600'
        }`}>
          About PINCode India
        </h1>
        <p className={`text-xl max-w-3xl mx-auto ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Your comprehensive guide to Indian postal codes, helping you find accurate PIN code information quickly and efficiently.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`rounded-xl shadow-lg p-6 text-center card-hover ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <Icon className={`h-8 w-8 mx-auto mb-3 ${
                darkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`} />
              <div className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>{stat.value}</div>
              <div className={`text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Mission Section */}
      <div className={`rounded-xl shadow-lg p-8 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-semibold mb-4 flex items-center ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <div className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></div>
          Our Mission
        </h2>
        <p className={`leading-relaxed text-lg ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          At PINCode India, we believe that access to accurate postal information should be simple and free. 
          Our mission is to provide a reliable, easy-to-use platform that helps individuals, businesses, and 
          developers find PIN code information instantly. Whether you're sending a package, planning logistics, 
          or building an application, we're here to make postal code lookup effortless.
        </p>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className={`text-3xl font-bold mb-8 text-center ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600',
              yellow: darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-600',
              green: darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600',
              red: darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600',
              purple: darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600',
              indigo: darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
            };
            return (
              <div key={index} className={`rounded-xl shadow-lg p-6 card-hover group ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`w-14 h-14 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>{feature.title}</h3>
                <p className={`${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Sources */}
      <div className={`rounded-2xl shadow-xl p-8 ${
        darkMode ? 'bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 text-white' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white'
      }`}>
        <h2 className="text-3xl font-semibold mb-4 text-center">Data Sources & Accuracy</h2>
        <p className="text-center text-lg mb-8 opacity-95">
          Our data is sourced from official India Post records and is regularly updated to ensure accuracy. 
          We maintain a comprehensive database covering all PIN codes across India, including delivery and 
          non-delivery offices, with detailed information about each location.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold">Official</div>
            <div className="text-sm mt-2 opacity-90">India Post Data</div>
          </div>
          <div>
            <div className="text-4xl font-bold">Real-time</div>
            <div className="text-sm mt-2 opacity-90">Updates</div>
          </div>
          <div>
            <div className="text-4xl font-bold">Verified</div>
            <div className="text-sm mt-2 opacity-90">Information</div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className={`rounded-xl shadow-lg p-8 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-semibold mb-6 text-center ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>Built With Modern Technology</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4">
            <div className={`font-semibold ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>React</div>
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Frontend Framework</div>
          </div>
          <div className="p-4">
            <div className={`font-semibold ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>Node.js</div>
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Backend Runtime</div>
          </div>
          <div className="p-4">
            <div className={`font-semibold ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>Express</div>
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>API Framework</div>
          </div>
          <div className="p-4">
            <div className={`font-semibold ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>MongoDB</div>
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Database</div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center py-8">
        <h2 className={`text-3xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>Need Help?</h2>
        <p className={`mb-6 text-lg ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Have questions or feedback? We'd love to hear from you!
        </p>
        <button className={`px-8 py-3 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
          darkMode ? 'bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
        }`}>
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default About;
