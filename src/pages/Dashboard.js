import React from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';

function Dashboard() {
  const stats = [
    {
      title: 'Doanh thu tháng này',
      value: '125,500,000 đ',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Đơn hàng mới',
      value: '23',
      change: '+5 hôm nay',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Đang sản xuất',
      value: '15',
      change: '8 sắp hết hạn',
      icon: Package,
      color: 'bg-orange-500'
    },
    {
      title: 'Công nợ phải thu',
      value: '45,200,000 đ',
      change: '12 khách hàng',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
  ];

  const recentOrders = [
    { id: 'DH-001', customer: 'Công ty ABC', product: 'Thùng carton 40x30x25', status: 'Đang SX', date: '19/12/2024' },
    { id: 'DH-002', customer: 'Công ty XYZ', product: 'Thùng carton 50x40x30', status: 'Hoàn thành', date: '18/12/2024' },
    { id: 'DH-003', customer: 'Công ty DEF', product: 'Thùng carton 35x25x20', status: 'Đang giao', date: '17/12/2024' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-800 mb-2">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.product}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full
                      ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Đang SX' ? 'bg-blue-100 text-blue-800' : 
                        'bg-orange-100 text-orange-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
