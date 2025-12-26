import React from 'react';
import { Filter, X } from 'lucide-react';

/**
 * FilterBox - Bộ lọc nâng cao (v2)
 * 
 * Props:
 * - filters: Object chứa các filter values
 * - onFilterChange: Callback khi filter thay đổi
 * - onReset: Callback khi reset filters
 * - filterConfig: Array cấu hình các filter
 *   [
 *     {
 *       type: 'multiSelect' | 'select' | 'numberRange' | 'dateRange' | 'checkbox',
 *       field: 'field_name' hoặc ['field1', 'field2'] cho range,
 *       label: 'Label hiển thị',
 *       options: [...] (cho select/multiSelect),
 *       hidden: true/false (cột bị ẩn nhưng vẫn lọc được)
 *     }
 *   ]
 */
function FilterBox({ filters = {}, onFilterChange, onReset, filterConfig = [] }) {
  
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = Object.values(filters).some(v => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'boolean') return v !== null;
    return v !== '' && v !== null && v !== undefined;
  });

  const renderFilter = (config) => {
    const { type, field, label, options, hidden } = config;

    switch (type) {
      case 'multiSelect':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">
              {label} {hidden && <span className="text-xs text-orange-500">(ẩn)</span>}
            </label>
            <select
              multiple
              value={filters[field] || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                handleChange(field, selected);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              size="3"
            >
              {options.map(opt => {
                const value = typeof opt === 'object' ? opt.value : opt;
                const label = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 mt-1">Giữ Ctrl để chọn nhiều</p>
          </div>
        );

      case 'select':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">
              {label} {hidden && <span className="text-xs text-orange-500">(ẩn)</span>}
            </label>
            <select
              value={filters[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">-- Tất cả --</option>
              {options.map(opt => {
                const value = typeof opt === 'object' ? opt.value : opt;
                const label = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        );

      case 'numberRange':
        const [minField, maxField] = Array.isArray(field) ? field : [field + 'Min', field + 'Max'];
        return (
          <div key={minField}>
            <label className="block text-sm font-medium mb-1">
              {label} {hidden && <span className="text-xs text-orange-500">(ẩn)</span>}
            </label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Từ..."
                value={filters[minField] || ''}
                onChange={(e) => handleChange(minField, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Đến..."
                value={filters[maxField] || ''}
                onChange={(e) => handleChange(maxField, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        );

      case 'dateRange':
        const [fromField, toField] = Array.isArray(field) ? field : [field + 'From', field + 'To'];
        return (
          <div key={fromField}>
            <label className="block text-sm font-medium mb-1">
              {label} {hidden && <span className="text-xs text-orange-500">(ẩn)</span>}
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters[fromField] || ''}
                onChange={(e) => handleChange(fromField, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="date"
                value={filters[toField] || ''}
                onChange={(e) => handleChange(toField, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field} className="flex items-center">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters[field] || false}
                onChange={(e) => handleChange(field, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="font-medium">
                {label} {hidden && <span className="text-xs text-orange-500">(ẩn)</span>}
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Bộ lọc nâng cao</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterConfig.map(config => renderFilter(config))}
      </div>
    </div>
  );
}

export default FilterBox;
