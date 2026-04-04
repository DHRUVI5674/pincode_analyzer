import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStates, getDistricts, getTaluks, getPincodes } from '../services/api';
import useDebounce from './useDebounce';

const sortRows = (rows, sortConfig) => {
  const sorted = [...rows];
  sorted.sort((first, second) => {
    const a = String(first[sortConfig.key] ?? '').toLowerCase();
    const b = String(second[sortConfig.key] ?? '').toLowerCase();

    if (a < b) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a > b) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
};

export const usePincodeData = () => {
  const [filters, setFilters] = useState({ state: '', district: '', taluk: '' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: 'pincode', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const statesQuery = useQuery({
    queryKey: ['states'],
    queryFn: getStates,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  const districtsQuery = useQuery({
    queryKey: ['districts', filters.state],
    queryFn: () => getDistricts(filters.state),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  const taluksQuery = useQuery({
    queryKey: ['taluks', filters.state, filters.district],
    queryFn: () => getTaluks(filters.state, filters.district),
    enabled: Boolean(filters.state || filters.district),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  const pincodesQuery = useQuery({
    queryKey: ['pincodes', filters.state, filters.district, filters.taluk, page, limit],
    queryFn: () => getPincodes(filters, page, limit),
    keepPreviousData: true,
    staleTime: 1000 * 10,
  });

  const rows = useMemo(() => {
    const currentRows = pincodesQuery.data?.data ?? [];
    const filteredRows = debouncedSearchTerm.length >= 2
      ? currentRows.filter((row) => {
          const searchValue = debouncedSearchTerm.toLowerCase();
          return [row.pincode, row.officeName, row.taluk, row.district, row.state]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(searchValue));
        })
      : currentRows;

    return sortRows(filteredRows, sortConfig);
  }, [pincodesQuery.data, debouncedSearchTerm, sortConfig]);

  const activeFilterCount = [filters.state, filters.district, filters.taluk].filter(Boolean).length;

  const setState = (state) => {
    setFilters({ state, district: '', taluk: '' });
    setPage(1);
  };

  const setDistrict = (district) => {
    setFilters((prev) => ({ ...prev, district, taluk: '' }));
    setPage(1);
  };

  const setTaluk = (taluk) => {
    setFilters((prev) => ({ ...prev, taluk }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ state: '', district: '', taluk: '' });
    setPage(1);
    setSearchTerm('');
  };

  return {
    filters,
    states: statesQuery.data ?? [],
    districts: districtsQuery.data ?? [],
    taluks: taluksQuery.data ?? [],
    rows,
    loading: pincodesQuery.isLoading,
    isFetchingResults: pincodesQuery.isFetching,
    error: pincodesQuery.error,
    page,
    limit,
    totalRecords: pincodesQuery.data?.total ?? 0,
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
    isLoadingDistricts: districtsQuery.isFetching,
    isLoadingTaluks: taluksQuery.isFetching,
  };
};

export default usePincodeData;
