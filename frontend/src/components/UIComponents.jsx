import React from 'react';
import { ChevronDown, Loader } from 'lucide-react';
import theme from '../theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Reusable UI Components Library
 * Consistent styling across all pages and routes
 * Uses the unified theme system
 */

// ============================================================================
// BUTTONS
// ============================================================================

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 whitespace-nowrap';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
    accent: 'bg-pink-600 text-white hover:bg-pink-700 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-3.5 text-xl',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// ============================================================================
// CARDS
// ============================================================================

export const Card = ({
  children,
  variant = 'default',
  hover = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl shadow-lg p-6 transition-all duration-300';
  const variants = {
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    elevated: 'bg-white dark:bg-gray-800 shadow-2xl',
    gradient: 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white',
    glassmorphism: 'bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg border border-white/20',
  };

  const hoverStyle = hover ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer' : '';

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = 'indigo',
}) => {
  const colorMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <Card className="group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// SECTIONS & CONTAINERS
// ============================================================================

export const Section = ({
  children,
  title,
  subtitle,
  Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {(title || subtitle || Icon) && (
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  backgroundGradient = true,
}) => {
  return (
    <div
      className={`mb-8 pb-8 border-b-2 border-gradient-to-r from-indigo-200 to-purple-200 dark:border-gray-700 ${
        backgroundGradient ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 -mx-4 px-4 pt-4' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl hidden sm:block">
              <Icon className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// INPUTS & FORMS
// ============================================================================

export const Input = ({
  label,
  error,
  icon: Icon,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500';
  
  const variants = {
    default: 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900',
    outlined: 'border-indigo-200 dark:border-indigo-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
        <input
          className={`${baseStyles} ${variants[variant]} ${Icon ? 'pl-10' : ''} ${
            error ? 'border-red-500 focus:ring-red-200' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  options,
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
        )}
        <select
          className={`w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all duration-300 appearance-none cursor-pointer ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

// ============================================================================
// LOADERS & STATES
// ============================================================================

export const LoadingSpinner = ({ size = 'md', color = 'indigo' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    indigo: 'text-indigo-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
  };

  return (
    <Loader className={`${sizes[size]} ${colors[color]} animate-spin`} />
  );
};

export const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
  action,
  actionLabel = 'Get Started',
}) => {
  return (
    <Card className="text-center py-12">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <Icon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">{subtitle}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

// ============================================================================
// BADGES & CHIPS
// ============================================================================

export const Badge = ({
  label,
  variant = 'primary',
  size = 'md',
  icon: Icon,
}) => {
  const variants = {
    primary: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    secondary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
    lg: 'px-4 py-2 text-base font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${variants[variant]} ${sizes[size]}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </span>
  );
};

// ============================================================================
// GRID LAYOUTS
// ============================================================================

export const GridContainer = ({
  children,
  cols = 3,
  gap = 6,
  className = '',
}) => {
  const colMap = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  const gapMap = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={`grid grid-cols-1 ${colMap[cols]} ${gapMap[gap]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// DIVIDERS & SEPARATORS
// ============================================================================

export const Divider = ({ className = '', label }) => {
  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
          {label}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      </div>
    );
  }

  return (
    <div className={`h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700 ${className}`} />
  );
};

import PropTypes from 'prop-types';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'outline', 'ghost', 'success', 'danger']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'elevated', 'gradient', 'glassmorphism']),
  hover: PropTypes.bool,
};

export default {
  Button,
  Card,
  StatCard,
  Section,
  PageHeader,
  Input,
  Select,
  LoadingSpinner,
  EmptyState,
  Badge,
  GridContainer,
  Divider,
};
