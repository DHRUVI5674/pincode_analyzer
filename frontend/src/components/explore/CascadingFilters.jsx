import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const CascadingFilters = ({
  states,
  districts,
  taluks,
  selectedState,
  selectedDistrict,
  selectedTaluk,
  onStateChange,
  onDistrictChange,
  onTalukChange,
  isLoadingStates,
  isLoadingDistricts,
  isLoadingTaluks,
  clearFilters,
  activeFilterCount,
}) => {
  const { darkMode } = useTheme();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">State</label>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={isLoadingStates}
          >
            <option value="">{isLoadingStates ? 'Loading states...' : 'Select a state'}</option>
            {states?.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">District</label>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={isLoadingDistricts || !selectedState}
          >
            <option value="">{selectedState ? (isLoadingDistricts ? 'Loading districts...' : 'Select a district') : 'Select a state first'}</option>
            {districts?.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Taluk</label>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
          >
            Clear All
          </button>
        </div>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={selectedTaluk}
            onChange={(e) => onTalukChange(e.target.value)}
            disabled={isLoadingTaluks || !selectedDistrict}
          >
            <option value="">{selectedDistrict ? (isLoadingTaluks ? 'Loading taluks...' : 'Select a taluk') : 'Select a district first'}</option>
            {taluks?.map((taluk) => (
              <option key={taluk} value={taluk}>{taluk}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="md:col-span-3 flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
          Active filters: {activeFilterCount}
        </span>
        {selectedState && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {selectedState}
          </span>
        )}
        {selectedDistrict && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {selectedDistrict}
          </span>
        )}
        {selectedTaluk && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {selectedTaluk}
          </span>
        )}
      </div>
    </div>
  );
};

export default CascadingFilters;
