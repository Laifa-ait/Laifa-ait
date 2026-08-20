import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function AdminDataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  emptyState, 
  onRowClick,
  isLoading 
}: AdminDataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-12 text-center flex flex-col items-center justify-center">
        {emptyState || (
          <div className="text-zinc-400 font-bold text-sm">
            Aucune donnée disponible.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-6 text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {data.map((item, rowIdx) => (
              <motion.tr 
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIdx * 0.05 }}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-zinc-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`p-6 ${col.className || ''}`}>
                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
