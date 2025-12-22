import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

function Header({ user, onMenuToggle }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4 ml-2 lg:ml-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
          <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-800">{user?.username || 'Admin'}</p>
            <p className="text-xs text-gray-500">Quản trị viên</p>
          </div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
