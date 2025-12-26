import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBox - Tìm kiếm nâng cao
 * 
 * Props:
 * - data: Array dữ liệu cần tìm
 * - searchFields: Array fields cần tìm HOẶC "ALL" để tìm tất cả
 * - onResult: Callback trả về kết quả đã lọc
 * - placeholder: Placeholder text
 * - showResultCount: Hiển thị số kết quả
 */
function SearchBox({ 
  data = [], 
  searchFields = "ALL",
  onResult,
  placeholder = "Tìm kiếm...",
  showResultCount = true
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultCount, setResultCount] = useState(0);

  // Helper: Lấy giá trị nested field (vd: cong_doan.xa)
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return '';
    
    try {
      return path.split('.').reduce((current, key) => {
        return current?.[key];
      }, obj) || '';
    } catch {
      return '';
    }
  };

  // Helper: Lấy TẤT CẢ giá trị trong object (bao gồm nested)
  const getAllValues = (obj, prefix = '') => {
    let values = [];
    
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (value === null || value === undefined) {
          continue;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Nested object - đệ quy
          values = values.concat(getAllValues(value, fullKey));
        } else if (Array.isArray(value)) {
          // Array - lấy từng phần tử
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              values = values.concat(getAllValues(item, `${fullKey}[${index}]`));
            } else {
              values.push(String(item));
            }
          });
        } else {
          // Primitive value
          values.push(String(value));
        }
      }
    }
    
    return values;
  };

  // Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResultCount(data.length);
      if (onResult) onResult(data);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    const filtered = data.filter(item => {
      // Nếu searchFields = "ALL" → tìm tất cả
      if (searchFields === "ALL") {
        const allValues = getAllValues(item);
        return allValues.some(val => 
          String(val).toLowerCase().includes(searchLower)
        );
      }
      
      // Nếu searchFields là array → tìm trong các field đó
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return String(value).toLowerCase().includes(searchLower);
      });
    });

    setResultCount(filtered.length);
    if (onResult) onResult(filtered);
  }, [searchTerm, data, searchFields, onResult]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Xóa tìm kiếm"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {showResultCount && searchTerm && (
        <p className="text-sm text-gray-600">
          📊 Tìm thấy <span className="font-semibold text-blue-600">{resultCount}</span> kết quả
        </p>
      )}
    </div>
  );
}

export default SearchBox;
