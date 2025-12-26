import React from 'react';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';

/**
 * ExcelActions - Xuất/Nhập Excel
 * 
 * Props:
 * - onExport: Callback khi xuất Excel
 * - onImport: Callback khi nhập Excel
 * - data: Dữ liệu để xuất
 * - moduleName: Tên module (để đặt tên file)
 */
function ExcelActions({ onExport, onImport, data = [], moduleName = 'data' }) {
  
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    try {
      // Convert to CSV (simple Excel format)
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => 
          headers.map(h => {
            const value = row[h];
            // Handle nested objects, arrays, special characters
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value || '').replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create download link
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${moduleName}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      if (onExport) onExport(data);
    } catch (error) {
      console.error('Export error:', error);
      alert('Lỗi khi xuất file! Vui lòng thử lại.');
    }
  };

  const handleImportClick = () => {
    document.getElementById('excel-import-input')?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('File không có dữ liệu!');
          return;
        }

        // Parse CSV
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] || '';
          });
          return obj;
        });

        if (onImport) {
          onImport(rows);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Lỗi khi đọc file! Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <input
        id="excel-import-input"
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        title="Xuất Excel"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Xuất Excel</span>
      </button>

      <button
        onClick={handleImportClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Nhập Excel"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Nhập Excel</span>
      </button>
    </div>
  );
}

export default ExcelActions;
