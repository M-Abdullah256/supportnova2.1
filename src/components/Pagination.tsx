import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <nav
      className="flex flex-wrap items-center justify-between text-xs font-mono pt-3 border-t transition-colors"
      style={{ borderColor: 'var(--border-line)', color: 'var(--text-muted)' }}
      aria-label="Pagination"
    >
      <span>{startItem}–{endItem} of {totalItems} records</span>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1 rounded theme-surface border hover:border-[#D83B20] disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-colors"
          style={{ borderColor: 'var(--border-line)', color: 'var(--text-primary)' }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>PREV</span>
        </button>

        <span className="px-2 font-bold" style={{ color: 'var(--text-primary)' }}>
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1 rounded theme-surface border hover:border-[#D83B20] disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-colors"
          style={{ borderColor: 'var(--border-line)', color: 'var(--text-primary)' }}
        >
          <span>NEXT</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
};