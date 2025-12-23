import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building, UserCircle, Award, Clock, DollarSign, Receipt, Wallet, ArrowRightLeft, Tag, CreditCard } from 'lucide-react';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Khách hàng', path: '/customers' },
    { icon: Building, label: 'Nhà cung cấp', path: '/suppliers' },
    { icon: UserCircle, label: 'Nhân viên', path: '/employees' },
    { icon: Award, label: 'Thưởng/Phạt', path: '/bonus-penalty' },
    { icon: Clock, label: 'Chấm công', path: '/attendance' },
    { icon: DollarSign, label: 'Tạm ứng', path: '/advance' },
    { icon: Receipt, label: 'Bảng lương', path: '/payroll' },
    { icon: Wallet, label: 'Sổ quỹ', path: '/cashbook' },
    { icon: ArrowRightLeft, label: 'Giao dịch TU', path: '/advance-transaction' },
    { icon: Tag, label: 'Loại Thu Chi', path: '/transaction-category' },
    { icon: CreditCard, label: 'Ngân hàng', path: '/bank-account' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Carton System</h1>
        <p className="text-blue-200 text-sm">Quản lý sản xuất</p>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-blue-700">
        <div className="text-center text-blue-300 text-xs">
          <p>© 2024 Carton System</p>
          <p className="mt-1">Version 1.0</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
