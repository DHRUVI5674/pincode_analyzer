import { useState, useMemo } from 'react';

export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentPage,
      totalPages,
      currentItems,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, items.length),
      totalItems: items.length,
    };
  }, [items, itemsPerPage, currentPage]);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(paginationData.totalPages);

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setCurrentPage,
  };
};

export default usePagination;
