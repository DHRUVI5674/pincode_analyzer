import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Mail, Phone, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ModernFooter = () => {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Explore', href: '/explore' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'Favorites', href: '/favorites' },
      { label: 'Nearby', href: '/nearby' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '#contact' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
    ],
    Resources: [
      { label: 'Documentation', href: '#docs' },
      { label: 'API Guide', href: '#api' },
      { label: 'Blog', href: '#blog' },
      { label: 'Support', href: '#support' },
    ],
  };

  const socialLinks = [
    { icon: ExternalLink, label: 'GitHub', href: '#github' },
    { icon: ExternalLink, label: 'Twitter', href: '#twitter' },
    { icon: ExternalLink, label: 'LinkedIn', href: '#linkedin' },
    { icon: Mail, label: 'Email', href: 'mailto:info@pincodeindia.com' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4 group">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PINCode India
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your comprehensive guide to Indian postal codes. Fast, accurate, and free.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  className="p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 flex items-center gap-1 group"
                    >
                      {label}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Newsletter Signup */}
          <div className="w-full md:w-auto">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Stay updated with latest PIN code data
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>

          {/* Copyright & Version */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} PINCode India. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              v1.0 • Made with ❤️ for India
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-500/10 to-transparent dark:from-indigo-500/5 rounded-full -z-10 blur-3xl pointer-events-none" />
      </div>
    </footer>
  );
};

export default ModernFooter;
