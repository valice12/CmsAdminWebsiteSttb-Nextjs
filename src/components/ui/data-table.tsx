import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ArrowUpDown, Search } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  // Pagination props for server-side
  totalItems?: number;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (value: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Cari...',
  isLoading = false,
  globalFilter: externalGlobalFilter,
  onGlobalFilterChange,
  totalItems,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const isManualPagination = pageCount !== undefined;
  
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: onGlobalFilterChange ?? setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: isManualPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter: externalGlobalFilter ?? globalFilter,
      ...(isManualPagination ? {
        pagination: {
          pageIndex: (pageIndex ?? 1) - 1,
          pageSize: pageSize ?? 10
        }
      } : {})
    },
  });

  return (
    <div className="space-y-4">
      {/* Internal Search (Visible only if searchKey is provided) */}
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(e) => {
              if (onSearchChange) {
                onSearchChange(e.target.value);
              } else {
                table.getColumn(searchKey)?.setFilterValue(e.target.value);
              }
            }}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card text-left">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-4 text-left text-sm font-bold text-gray-900 border-r border-border last:border-r-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-sm font-medium">Memuat data dari backend...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4 text-sm border-r border-border last:border-r-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground font-medium grayscale opacity-50"
                  >
                    <div className="flex flex-col items-center gap-2">
                       <ArrowUpDown className="w-10 h-10 mb-2" />
                       Tidak ditemukan data yang sesuai.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6 px-2">
        <p className="text-sm font-medium text-gray-400">
          Showing <span className="text-gray-900 font-black">
            {isManualPagination 
              ? Math.min(((pageIndex ?? 1) - 1) * (pageSize ?? 10) + 1, totalItems ?? 0)
              : (table.getState().pagination?.pageIndex ?? 0) * (table.getState().pagination?.pageSize ?? 10) + 1}
          </span> - <span className="text-gray-900 font-black">
            {isManualPagination
              ? Math.min((pageIndex ?? 1) * (pageSize ?? 10), totalItems ?? 0)
              : Math.min(((table.getState().pagination?.pageIndex ?? 0) + 1) * (table.getState().pagination?.pageSize ?? 10), data.length)}
          </span> of <span className="text-gray-900 font-black">{totalItems ?? data.length}</span> records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isManualPagination) {
                onPageChange?.((pageIndex ?? 1) - 1);
              } else {
                table.previousPage();
              }
            }}
            disabled={isManualPagination ? (pageIndex ?? 1) <= 1 : !table.getCanPreviousPage()}
            className="h-10 rounded-xl px-4 border-gray-100 hover:bg-gray-50 font-bold transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
             <span className="text-xs font-black text-gray-400 px-3 uppercase tracking-widest">
                Page <span className="text-indigo-600">{pageIndex ?? table.getState().pagination.pageIndex + 1}</span> of {pageCount ?? table.getPageCount()}
             </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isManualPagination) {
                onPageChange?.((pageIndex ?? 1) + 1);
              } else {
                table.nextPage();
              }
            }}
            disabled={isManualPagination ? (pageIndex ?? 1) >= (pageCount ?? 0) : !table.getCanNextPage()}
            className="h-10 rounded-xl px-4 border-gray-100 hover:bg-gray-50 font-bold transition-all disabled:opacity-30"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
