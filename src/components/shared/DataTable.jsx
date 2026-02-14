import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * DataTable - Reusable table component
 * Props:
 * - columns: array of { key, label, sortable, render }
 * - data: array of objects
 * - onRowClick: function (optional)
 * - onSort: function (optional)
 * - selectable: boolean (optional)
 * - onSelectionChange: function (optional)
 * - actions: array of { label, onClick, icon } (optional)
 */
export default function DataTable({ 
  columns, 
  data, 
  onRowClick,
  onSort,
  selectable = false,
  onSelectionChange,
  actions = []
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set());

  const handleSort = (key) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(data.map((_, idx) => idx)));
      onSelectionChange?.(data);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (idx, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(idx);
    } else {
      newSelected.delete(idx);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((_, i) => newSelected.has(i)));
  };

  return (
    <div className="border border-[hsl(var(--border-default))] rounded-lg overflow-hidden bg-[hsl(var(--surface-secondary))]">
      <table className="w-full" role="table">
        <thead className="bg-[hsl(var(--surface-tertiary))] border-b border-[hsl(var(--border-default))]">
          <tr role="row">
            {selectable && (
              <th className="w-12 px-4 py-3" role="columnheader">
                <Checkbox
                  checked={selectedRows.size === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider"
                role="columnheader"
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-2 hover:text-[hsl(var(--text-primary))]"
                  >
                    {col.label}
                    {sortKey === col.key && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="w-12 px-4 py-3" role="columnheader">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border-default))]">
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-[hsl(var(--surface-tertiary))]' : ''} transition-colors`}
              role="row"
            >
              {selectable && (
                <td className="px-4 py-3" role="cell">
                  <Checkbox
                    checked={selectedRows.has(idx)}
                    onCheckedChange={(checked) => handleSelectRow(idx, checked)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select row ${idx + 1}`}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-sm text-[hsl(var(--text-primary))]"
                  role="cell"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-3" role="cell">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, i) => (
                        <DropdownMenuItem
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                        >
                          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-8 text-center text-[hsl(var(--text-tertiary))]">
          No data available
        </div>
      )}
    </div>
  );
}