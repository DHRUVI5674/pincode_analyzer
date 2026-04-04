import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Loader2 } from 'lucide-react';
import CascadingFilters from './CascadingFilters';
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
    isLoadingDistricts,
    isLoadingTaluks,
    isFetchingResults,
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
          <div className="rounded-3xl bg-white/10 px-5 py-4 text-sm ring-1 ring-white/20 backdrop-blur">
            <p className="font-medium">Active filters</p>
            <p className="mt-1 text-3xl font-semibold">{activeFilterCount}</p>
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
          isLoadingDistricts={isLoadingDistricts}
          isLoadingTaluks={isLoadingTaluks}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />
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
