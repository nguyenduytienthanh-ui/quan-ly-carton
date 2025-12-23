import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Building2, UserCircle, Award, Clock, DollarSign, Receipt } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Khách hàng' },
    { path: '/suppliers', icon: Building2, label: 'Nhà cung cấp' },
    { path: '/employees', icon: UserCircle, label: 'Nhân viên' },
    { path: '/bonus-penalty', icon: Award, label: 'Thưởng/Phạt' },
    { path: '/attendance', icon: Clock, label: 'Chấm công' },
    { path: '/advance', icon: DollarSign, label: 'Tạm ứng' },
    { path: '/payroll', icon: Receipt, label: 'Bảng lương' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-blue-500">
        <h1 className="text-2xl font-bold">Carton System</h1>
        <p className="text-blue-200 text-sm mt-1">Quản lý sản xuất</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-blue-500">
        <p className="text-blue-200 text-sm">© 2024 Carton System</p>
      </div>
    </div>
  );
}

export default Sidebar;
