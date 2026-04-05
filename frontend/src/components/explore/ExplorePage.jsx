import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Loader2, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CascadingFilters from './CascadingFilters';

import { API_BASE_URL as API_URL } from '../../services/api';
import DataTable from './DataTable';
import { usePincodeData } from '../../hooks/usePincodeData';
import { useTheme } from '../../context/ThemeContext';

const ExplorePage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const {
    filters,
    states,
    districts,
    taluks,
    rows,
    loading,
    error,
    page,
    limit,
    totalRecords,
    searchTerm,
    debouncedSearchTerm,
    sortConfig,
    activeFilterCount,
    setState,
    setDistrict,
    setTaluk,
    setPage,
    setLimit,
    setSearchTerm,
    setSortConfig,
    clearFilters,
    isLoadingStates,
    isLoadingDistricts,
    isLoadingTaluks,
    isFetchingResults,
    statesError,
    districtsError,
    taluksError,
  } = usePincodeData();

  const [animateUpdate, setAnimateUpdate] = useState(false);

  useEffect(() => {
    if (!loading && !error) {
      setAnimateUpdate(true);
      const id = window.setTimeout(() => setAnimateUpdate(false), 500);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [rows, loading, error]);

  const recordLabel = useMemo(() => {
    if (debouncedSearchTerm.length >= 2) {
      return `Search results for "${debouncedSearchTerm}"`;
    }
    if (activeFilterCount > 0) {
      return 'Filtered results';
    }
    return 'All PIN code records';
  }, [activeFilterCount, debouncedSearchTerm]);

  const [exporting, setExporting] = useState(false);

  const handleExportCurrentPage = () => {
    if (!rows || rows.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    try {
      const headers = ['Office Name', 'Pincode', 'Office Type', 'Delivery Status', 'Division', 'Region', 'Circle', 'Taluk', 'District', 'State'];
      const csvContent = [
        headers.join(','),
        ...rows.map(item => {
          const toTitleCase = (str) => (str || '').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
          return [
            `"${toTitleCase(item.officeName)}"`,
            item.pincode,
            `"${toTitleCase(item.officeType)}"`,
            `"${toTitleCase(item.deliveryStatus)}"`,
            `"${toTitleCase(item.divisionName)}"`,
            `"${toTitleCase(item.regionName)}"`,
            `"${toTitleCase(item.circleName)}"`,
            `"${toTitleCase(item.taluk)}"`,
            `"${toTitleCase(item.district)}"`,
            `"${(item.state || '').toUpperCase()}"`
          ].join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `explore_page_${page}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Page exported to CSV successfully');
    } catch (error) {
      toast.error('Failed to export page');
      console.error(error);
    }
  };

  const handleExportFiltered = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.state) params.append('state', filters.state);
      if (filters.district) params.append('district', filters.district);
      if (filters.taluk) params.append('taluk', filters.taluk);
      
      const response = await axios.get(`${API_URL}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `filtered_pincodes_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('All filtered results exported successfully');
    } catch (err) {
      toast.error('Failed to export filtered results');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleRowClick = (row) => {
    navigate(`/pincode/${row.pincode}`);
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="rounded-4xl bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white shadow-2xl shadow-indigo-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-indigo-100">
              <Compass className="h-5 w-5" />
              Explore
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Find PIN codes with cascading filters</h1>
            <p className="mt-2 max-w-2xl text-slate-100/90 text-sm leading-6">
              Select a state, then district, then taluk. Results refresh immediately and stay responsive on mobile.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Search results
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {totalRecords} records
            </span>
          </div>
          <div className="flex gap-3">
            <button
               onClick={handleExportCurrentPage}
               className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export Page
            </button>
            <button
              onClick={handleExportFiltered}
              disabled={exporting}
              className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? 'Exporting...' : 'Export Filtered (All)'}
            </button>
          </div>
        </div>
        </div>
      </div>

      <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <CascadingFilters
          states={states}
          districts={districts}
          taluks={taluks}
          selectedState={filters.state}
          selectedDistrict={filters.district}
          selectedTaluk={filters.taluk}
          onStateChange={(value) => { setState(value); setPage(1); }}
          onDistrictChange={(value) => { setDistrict(value); setPage(1); }}
          onTalukChange={(value) => { setTaluk(value); setPage(1); }}
          isLoadingStates={isLoadingStates}
          isLoadingDistricts={isLoadingDistricts}
          isLoadingTaluks={isLoadingTaluks}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />
        {(statesError || districtsError || taluksError) && (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
            {statesError && <p>State data error: {String(statesError.message || statesError)}</p>}
            {districtsError && <p>District data error: {String(districtsError.message || districtsError)}</p>}
            {taluksError && <p>Taluk data error: {String(taluksError.message || taluksError)}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 py-2">
        <button
          onClick={handleExportCurrentPage}
          disabled={!rows || rows.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-md"
        >
          <Download className="h-4 w-4" />
          Export Searched Results (CSV)
        </button>
      </div>

      <DataTable
        rows={rows}
        loading={loading || isFetchingResults || isLoadingDistricts || isLoadingTaluks}
        error={error}
        sortConfig={sortConfig}
        onSort={(key) => setSortConfig((prev) => {
          if (prev.key === key) {
            return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
          }
          return { key, direction: 'asc' };
        })}
        page={page}
        pageSize={limit}
        totalRecords={totalRecords}
        onPageChange={(newPage) => setPage(Math.max(1, newPage))}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        pageSizes={[10, 20, 50, 100]}
        onRowClick={handleRowClick}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        recordLabel={recordLabel}
        showCount
        animateUpdate={animateUpdate}
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading latest PIN code data...
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
