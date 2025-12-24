import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Building2,
  CreditCard,
  Boxes,
  ShoppingCart,
  Landmark,
  Tag,
  Truck,
  BookOpen,
  Coins,
  Receipt,
  Clock,
  TrendingUp,
  Gift
} from 'lucide-react';

// Import TẤT CẢ các trang
import Dashboard from './pages/Dashboard';
import Customer from './pages/Customers';
import Supplier from './pages/Suppliers';
import Employee from './pages/Employees';
import Attendance from './pages/Attendance';
import BonusPenalty from './pages/BonusPenalty';
import Payroll from './pages/Payroll';
import Advance from './pages/Advance';
import AdvanceTransaction from './pages/AdvanceTransaction';
import TransactionCategory from './pages/TransactionCategory';
import BankAccount from './pages/BankAccount';
import CashBook from './pages/CashBook';
import Material from './pages/Material';
import Product from './pages/Product';
import SalesOrder from './pages/SalesOrder';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    // TỔNG QUAN
    { 
      icon: <Home className="w-5 h-5" />, 
      label: 'Tổng quan', 
      path: '/dashboard',
      section: 'Tổng quan'
    },
    
    // DANH MỤC CƠ BẢN
    { 
      icon: <Building2 className="w-5 h-5" />, 
      label: 'Khách hàng', 
      path: '/customers',
      section: 'Danh mục'
    },
    { 
      icon: <Truck className="w-5 h-5" />, 
      label: 'Nhà cung cấp', 
      path: '/suppliers',
      section: 'Danh mục'
    },
    { 
      icon: <Users className="w-5 h-5" />, 
      label: 'Nhân viên', 
      path: '/employees',
      section: 'Danh mục'
    },
    
    // NHÂN SỰ
    { 
      icon: <Clock className="w-5 h-5" />, 
      label: 'Chấm công', 
      path: '/attendance',
      section: 'Nhân sự'
    },
    { 
      icon: <Gift className="w-5 h-5" />, 
      label: 'Thưởng phạt', 
      path: '/bonus-penalty',
      section: 'Nhân sự'
    },
    { 
      icon: <CreditCard className="w-5 h-5" />, 
      label: 'Bảng lương', 
      path: '/payroll',
      section: 'Nhân sự'
    },
    { 
      icon: <Coins className="w-5 h-5" />, 
      label: 'Tạm ứng', 
      path: '/advance',
      section: 'Nhân sự'
    },
    { 
      icon: <Receipt className="w-5 h-5" />, 
      label: 'Ứng lương', 
      path: '/advance-transaction',
      section: 'Nhân sự'
    },
    
    // TÀI CHÍNH
    { 
      icon: <Tag className="w-5 h-5" />, 
      label: 'Loại thu chi', 
      path: '/transaction-categories',
      section: 'Tài chính'
    },
    { 
      icon: <Landmark className="w-5 h-5" />, 
      label: 'Ngân hàng', 
      path: '/banks',
      section: 'Tài chính'
    },
    { 
      icon: <BookOpen className="w-5 h-5" />, 
      label: 'Sổ quỹ', 
      path: '/cashbook',
      section: 'Tài chính'
    },
    
    // SẢN XUẤT
    { 
      icon: <Boxes className="w-5 h-5" />, 
      label: 'Nguyên vật liệu', 
      path: '/materials',
      section: 'Sản xuất'
    },
    { 
      icon: <Package className="w-5 h-5" />, 
      label: 'Thành phẩm', 
      path: '/products',
      section: 'Sản xuất'
    },
    { 
      icon: <ShoppingCart className="w-5 h-5" />, 
      label: 'Đơn hàng xuất', 
      path: '/sales-orders',
      section: 'Sản xuất'
    },
  ];

  // Group menu by section
  const groupedMenu = menuItems.reduce((acc, item) => {
    const section = item.section || 'Khác';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-64'
          } bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 flex flex-col`}
        >
          {/* Logo */}
          <div className="p-6 flex items-center justify-between border-b border-blue-700">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">ERP System</h1>
                <p className="text-xs text-blue-200">Quản lý sản xuất</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Menu Items - Grouped */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {Object.entries(groupedMenu).map(([section, items]) => (
              <div key={section}>
                {!sidebarCollapsed && (
                  <p className="text-xs text-blue-300 font-semibold mb-2 px-4 uppercase tracking-wider">
                    {section}
                  </p>
                )}
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors group"
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">Admin</p>
                  <p className="text-xs text-blue-200 truncate">admin@company.com</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/suppliers" element={<Supplier />} />
            <Route path="/employees" element={<Employee />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/bonus-penalty" element={<BonusPenalty />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/advance" element={<Advance />} />
            <Route path="/advance-transaction" element={<AdvanceTransaction />} />
            <Route path="/transaction-categories" element={<TransactionCategory />} />
            <Route path="/banks" element={<BankAccount />} />
            <Route path="/cashbook" element={<CashBook />} />
            <Route path="/materials" element={<Material />} />
            <Route path="/products" element={<Product />} />
            <Route path="/sales-orders" element={<SalesOrder />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
