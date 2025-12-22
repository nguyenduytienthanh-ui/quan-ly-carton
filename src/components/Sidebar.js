import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Building2, Package, 
  ShoppingCart, Truck, FileText, DollarSign,
  Factory, BarChart3, Settings, LogOut, X
} from 'lucide-react';

function Sidebar({ currentPage, onNavigate, onLogout, isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', section: null },
    
    { id: 'divider-1', label: 'DANH MỤC', section: 'header' },
    { id: 'customers', icon: Users, label: 'Khách hàng', section: 'category' },
    { id: 'suppliers', icon: Building2, label: 'Nhà cung cấp', section: 'category' },
    { id: 'products', icon: Package, label: 'Thành phẩm', section: 'category' },
    
    { id: 'divider-2', label: 'ĐƠN HÀNG', section: 'header' },
    { id: 'sales-orders', icon: ShoppingCart, label: 'Đơn hàng xuất', section: 'orders' },
    { id: 'purchase-orders', icon: Truck, label: 'Đơn hàng nhập', section: 'orders' },
    
    { id: 'divider-3', label: 'SẢN XUẤT', section: 'header' },
    { id: 'production', icon: Factory, label: 'Tiến độ sản xuất', section: 'production' },
    
    { id: 'divider-4', label: 'TÀI CHÍNH', section: 'header' },
    { id: 'invoices', icon: FileText, label: 'Hóa đơn', section: 'finance' },
    { id: 'payments', icon: DollarSign, label: 'Thu/Chi', section: 'finance' },
    
    { id: 'divider-5', label: 'BÁO CÁO', section: 'header' },
    { id: 'reports', icon: BarChart3, label: 'Báo cáo', section: 'reports' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-20' : 'w-64'}
        bg-white border-r border-gray-200 h-screen flex flex-col
        transition-all duration-300 ease-in-out
        fixed lg:relative z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-gray-800">Quản lý Carton</h1>
                <p className="text-xs text-gray-500">v1.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            if (item.section === 'header') {
              if (isCollapsed) return null; // Ẩn header khi thu gọn
              return (
                <div key={item.id} className="px-6 py-2 mt-4 first:mt-0">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.innerWidth < 1024) onClose(); // Đóng menu trên mobile
                }}
                className={`
                  w-full flex items-center gap-3 px-6 py-3 text-left transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Toggle Button (Desktop only) */}
        <div className="hidden lg:block border-t border-gray-200 p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 text-gray-700 
              hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Đăng xuất' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
