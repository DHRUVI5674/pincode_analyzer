import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DataTable = ({
  rows,
  loading,
  error,
  sortConfig,
  onSort,
  page,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizes,
  onRowClick,
  searchTerm,
  onSearchChange,
  recordLabel,
  defaultSortKey,
  showCount,
  animateUpdate,
}) => {
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="inline-block h-3 w-3" /> : <ArrowDown className="inline-block h-3 w-3" />;
  };

  const startRecord = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = startRecord + rows.length - 1;

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${animateUpdate ? 'animate-[pulse_0.4s_ease-out]' : ''}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{recordLabel}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Showing {startRecord} to {endRecord} of {totalRecords} records
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            Search within results
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full min-w-45 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Search page..."
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            Page size
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error.message || 'Failed to load results.'}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-300">
          No PIN code records match this filter selection.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 sm:block">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-800 dark:text-slate-100">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/60 dark:text-slate-300">
                <tr>
                  {[
                    { key: 'pincode', label: 'PIN code' },
                    { key: 'officeName', label: 'Office' },
                    { key: 'officeType', label: 'Type' },
                    { key: 'deliveryStatus', label: 'Delivery' },
                    { key: 'taluk', label: 'Taluk' },
                    { key: 'district', label: 'District' },
                    { key: 'state', label: 'State' },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide hover:text-indigo-600"
                      onClick={() => onSort(column.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {column.label}
                        {renderSortIcon(column.key)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row._id || row.pincode}
                    onClick={() => onRowClick(row)}
                    className="border-t border-slate-200 bg-white transition hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/80"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium">{row.pincode}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.officeName}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.officeType}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.deliveryStatus}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.taluk}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.district}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>{showCount ? `${rows.length} records on this page` : ''}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">Page {page}</span>
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={endRecord >= totalRecords}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 block sm:hidden">
        {rows.map((row) => (
          <div
            key={row._id || row.pincode}
            onClick={() => onRowClick(row)}
            className="mb-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.pincode} — {row.officeName}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{row.taluk}, {row.district}, {row.state}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="rounded-full bg-white px-2 py-1 shadow-sm dark:bg-slate-800">{row.officeType}</span>
              <span className="rounded-full bg-white px-2 py-1 shadow-sm dark:bg-slate-800">{row.deliveryStatus}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

DataTable.defaultProps = {
  pageSizes: [10, 20, 50, 100],
  showCount: true,
  animateUpdate: false,
  recordLabel: 'Filtered results',
};

export default DataTable;
