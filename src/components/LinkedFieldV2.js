import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * LinkedField - Clickable field để xem cross-module (v2)
 * 
 * Props:
 * - value: Giá trị hiển thị
 * - module: Module đích ('products', 'customers', 'salesOrders')
 * - id: ID của record để xem
 * - onOpen: Callback khi click (nhận id, mode, module)
 * - enabled: Bật/tắt link (mặc định true)
 * - mode: 'view' | 'edit' - Chế độ mặc định khi mở
 * - className: Custom CSS classes
 */
function LinkedField({ 
  value, 
  module, 
  id, 
  onOpen,
  enabled = true,
  mode = 'view',
  className = '' 
}) {
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!enabled) return;
    
    if (onOpen) {
      onOpen(id, mode, module);
    }
  };

  // Nếu disabled, chỉ hiển thị text
  if (!enabled) {
    return <span className={`font-medium text-gray-700 ${className}`}>{value}</span>;
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1 
        text-blue-600 hover:text-blue-800 
        hover:underline 
        font-medium
        transition-colors
        ${className}
      `}
      title={`Xem chi tiết ${value}`}
    >
      <span>{value}</span>
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

export default LinkedField;
