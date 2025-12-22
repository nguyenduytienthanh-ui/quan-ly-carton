import React, { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Employees from './pages/Employees';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Render page content
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;
      case 'employees':
        return <Employees />;
      case 'products':
        return <div className="p-6"><h1 className="text-2xl font-bold">Thành phẩm</h1><p className="text-gray-600 mt-2">Tính năng đang phát triển...</p></div>;
      case 'sales-orders':
        return <div className="p-6"><h1 className="text-2xl font-bold">Đơn hàng xuất</h1><p className="text-gray-600 mt-2">Tính năng đang phát triển...</p></div>;
      case 'purchase-orders':
        return <div className="p-6"><h1 className="text-2xl font-bold">Đơn hàng nhập</h1><p className="text-gray-600 mt-2">Tính năng đang phát triển...</p></div>;
      case 'production':
        return <div className="p-6"><h1 className="text-2xl font-bold">Tiến độ sản xuất</h1><p className="text-gray-600 mt-2">Tính năng đang phát triển...</p></div>;
      case 'invoices':
        return <div className="p-6"><h1 className="text-2xl font-bold">Hóa đơn</h1><p className="text-gray-600 mt-2">Tính năng đang phát triển...</p></div>;
      case 'payments':
        return <div className="p-6"><h1 className="text-2xl font-bold">Thu/Chi</h1><p className="text-gray-600 mt-2">Tính năng đang phát triển...</p></div>;
      case 'reports':
        return <div className="p-6"><h1 className="text-2xl font-bold">Báo cáo</h1><p className="text-gray-600 mt-2">Tính năng đang phát triển...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  // Show login if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Main layout
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user}
          onMenuToggle={toggleMobileMenu}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
