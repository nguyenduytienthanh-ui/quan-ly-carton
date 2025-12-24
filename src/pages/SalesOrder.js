import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, ShoppingCart, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import TextInput from '../components/TextInput';
import TextArea from '../components/TextArea';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function SalesOrder() {
  const loadOrders = () => {
    const saved = localStorage.getItem('salesOrders');
    return saved ? JSON.parse(saved) : [];
  };

  const loadProducts = () => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [];
  };

  const loadCustomers = () => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  };

  const [orders, setOrders] = useState(loadOrders);
  const [products] = useState(loadProducts);
  const [customers] = useState(loadCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [form, setForm] = useState({
    so_don_hang: '',
    khach_hang_id: '',
    ngay_dat: new Date().toISOString().split('T')[0],
    ngay_giao_du_kien: '',
    chi_tiet: [],
    ghi_chu: ''
  });

  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    localStorage.setItem('salesOrders', JSON.stringify(orders));
  }, [orders]);

  // Tự động sinh số đơn hàng
  const generateOrderNumber = () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const existingOrders = orders.filter(o => 
      o.so_don_hang.startsWith(`DH${year}${month}`)
    );
    const nextNum = String(existingOrders.length + 1).padStart(3, '0');
    return `DH${year}${month}${nextNum}`;
  };

  // Thêm sản phẩm vào đơn hàng
  const handleAddProduct = () => {
    if (!selectedProductId) {
      alert('Vui lòng chọn thành phẩm!');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    const newItems = [];

    // Thêm sản phẩm mẹ
    const ktsx = product.sx_dai || product.sx_rong || product.sx_cao
      ? `${product.sx_dai || product.po_dai}×${product.sx_rong || product.po_rong}${(product.sx_cao || product.po_cao) ? `×${product.sx_cao || product.po_cao}` : ''}`
      : `${product.po_dai}×${product.po_rong}${product.po_cao ? `×${product.po_cao}` : ''}`;

    const mainItem = {
      id: Date.now(),
      thanh_pham_id: product.id,
      ma_hang: product.ma_hang,
      ten_san_pham: product.ten_san_pham,
      ktsx: ktsx,
      song: product.song,
      dvt: product.dvt,
      so_luong: 0,  // User sẽ nhập
      don_gia: product.don_gia || 0,
      thanh_tien: 0,
      cong_doan: { ...product.cong_doan },
      la_thanh_phan_con: false,
      thanh_pham_me_id: null
    };

    newItems.push(mainItem);

    // Nếu có thành phần con, tự động thêm
    if (product.co_thanh_phan_con && product.thanh_phan_con && product.thanh_phan_con.length > 0) {
      product.thanh_phan_con.forEach((con, idx) => {
        const conKtsx = con.sx_dai || con.sx_rong || con.sx_cao
          ? `${con.sx_dai || con.po_dai}×${con.sx_rong || con.po_rong}${(con.sx_cao || con.po_cao) ? `×${con.sx_cao || con.po_cao}` : ''}`
          : `${con.po_dai}×${con.po_rong}${con.po_cao ? `×${con.po_cao}` : ''}`;

        const childItem = {
          id: Date.now() + idx + 1,
          thanh_pham_id: null,
          ma_hang: con.ma_hang_con,
          ten_san_pham: con.ten,
          ktsx: conKtsx,
          song: product.song,
          dvt: product.dvt,
          so_luong: 0,  // Sẽ tính tự động khi nhập SL mẹ
          so_luong_per_bo: con.so_luong,  // Lưu lại để tính
          don_gia: con.don_gia || 0,
          thanh_tien: 0,
          cong_doan: { ...con.cong_doan },
          la_thanh_phan_con: true,
          thanh_pham_me_id: mainItem.id
        };

        newItems.push(childItem);
      });
    }

    setForm({
      ...form,
      chi_tiet: [...form.chi_tiet, ...newItems]
    });

    setSelectedProductId('');
  };

  // Xóa sản phẩm (và các con của nó nếu có)
  const handleRemoveItem = (itemId) => {
    const item = form.chi_tiet.find(i => i.id === itemId);
    let idsToRemove = [itemId];

    // Nếu xóa mẹ, xóa luôn con
    if (!item.la_thanh_phan_con) {
      const childIds = form.chi_tiet
        .filter(i => i.thanh_pham_me_id === itemId)
        .map(i => i.id);
      idsToRemove = [...idsToRemove, ...childIds];
    }

    setForm({
      ...form,
      chi_tiet: form.chi_tiet.filter(i => !idsToRemove.includes(i.id))
    });
  };

  // Cập nhật số lượng (tự động cập nhật con nếu là mẹ)
  const handleUpdateQuantity = (itemId, value) => {
    const qty = parseFloat(value) || 0;
    const updatedDetails = form.chi_tiet.map(item => {
      if (item.id === itemId) {
        const thanh_tien = qty * item.don_gia;
        return { ...item, so_luong: qty, thanh_tien };
      }
      
      // Nếu là con của item đang update, tự động tính SL
      if (item.thanh_pham_me_id === itemId && item.so_luong_per_bo) {
        const childQty = qty * item.so_luong_per_bo;
        const childThanhTien = childQty * item.don_gia;
        return { ...item, so_luong: childQty, thanh_tien: childThanhTien };
      }
      
      return item;
    });

    setForm({ ...form, chi_tiet: updatedDetails });
  };

  // Cập nhật đơn giá
  const handleUpdatePrice = (itemId, value) => {
    const price = parseFloat(value) || 0;
    const updatedDetails = form.chi_tiet.map(item => {
      if (item.id === itemId) {
        const thanh_tien = item.so_luong * price;
        return { ...item, don_gia: price, thanh_tien };
      }
      return item;
    });

    setForm({ ...form, chi_tiet: updatedDetails });
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return form.chi_tiet.reduce((sum, item) => sum + item.thanh_tien, 0);
  };

  const handleSubmit = () => {
    if (!form.so_don_hang.trim() || !form.khach_hang_id) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (form.chi_tiet.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm!');
      return;
    }

    const existingOrder = orders.find(o => 
      o.so_don_hang.toUpperCase() === form.so_don_hang.toUpperCase().trim() && 
      (!editingOrder || o.id !== editingOrder.id)
    );

    if (existingOrder) {
      alert('Số đơn hàng đã tồn tại!');
      return;
    }

    const orderData = {
      so_don_hang: form.so_don_hang.toUpperCase().trim(),
      khach_hang_id: form.khach_hang_id,
      ngay_dat: form.ngay_dat,
      ngay_giao_du_kien: form.ngay_giao_du_kien,
      chi_tiet: form.chi_tiet,
      tong_tien: calculateTotal(),
      ghi_chu: form.ghi_chu.trim()
    };

    if (editingOrder) {
      setOrders(orders.map(o =>
        o.id === editingOrder.id ? { ...o, ...orderData } : o
      ));
      alert('Đã cập nhật đơn hàng!');
    } else {
      const newOrder = {
        id: Date.now(),
        ...orderData,
        trang_thai: 'moi',
        ngay_tao: new Date().toISOString()
      };
      setOrders([...orders, newOrder]);
      alert('Đã thêm đơn hàng!');
    }

    setShowModal(false);
    setEditingOrder(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      so_don_hang: '',
      khach_hang_id: '',
      ngay_dat: new Date().toISOString().split('T')[0],
      ngay_giao_du_kien: '',
      chi_tiet: [],
      ghi_chu: ''
    });
    setSelectedProductId('');
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setForm({
      so_don_hang: order.so_don_hang,
      khach_hang_id: order.khach_hang_id,
      ngay_dat: order.ngay_dat,
      ngay_giao_du_kien: order.ngay_giao_du_kien || '',
      chi_tiet: order.chi_tiet || [],
      ghi_chu: order.ghi_chu || ''
    });
    setShowModal(true);
  };

  const handleDelete = (order) => {
    if (window.confirm(`Xóa đơn hàng "${order.so_don_hang}"?`)) {
      setOrders(orders.filter(o => o.id !== order.id));
    }
  };

  const handleExportExcel = () => {
    if (orders.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const data = orders.map(o => {
      const customer = customers.find(c => c.id === o.khach_hang_id);
      return {
        'Số đơn hàng': o.so_don_hang,
        'Khách hàng': customer ? customer.name : '',
        'Ngày đặt': new Date(o.ngay_dat).toLocaleDateString('vi-VN'),
        'Ngày giao dự kiến': o.ngay_giao_du_kien ? new Date(o.ngay_giao_du_kien).toLocaleDateString('vi-VN') : '',
        'Tổng tiền': o.tong_tien,
        'Trạng thái': o.trang_thai === 'moi' ? 'Mới' : o.trang_thai === 'dang_sx' ? 'Đang SX' : 'Hoàn thành',
        'Ghi chú': o.ghi_chu
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng');
    XLSX.writeFile(wb, 'Don-hang-xuat.xlsx');
  };

  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const customer = customers.find(c => c.id === o.khach_hang_id);
    const searchableFields = [
      o.so_don_hang,
      customer ? customer.name : '',
      o.ghi_chu || ''
    ];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => new Date(b.ngay_dat) - new Date(a.ngay_dat));

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'N/A';
  };

  const getTrangThaiLabel = (status) => {
    switch(status) {
      case 'moi': return { text: 'Mới', color: 'bg-blue-100 text-blue-700' };
      case 'dang_sx': return { text: 'Đang SX', color: 'bg-yellow-100 text-yellow-700' };
      case 'hoan_thanh': return { text: 'Hoàn thành', color: 'bg-green-100 text-green-700' };
      default: return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng xuất</h1>
          <p className="text-gray-600">Quản lý đơn hàng bán cho khách hàng</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-5 h-5" />Xuất Excel
          </button>
          <button
            onClick={() => {
              setEditingOrder(null);
              resetForm();
              setForm({ ...form, so_don_hang: generateOrderNumber() });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />Thêm đơn hàng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Số đơn hàng, khách hàng..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ĐH</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày giao DK</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map(order => {
                const status = getTrangThaiLabel(order.trang_thai);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-bold text-blue-600">{order.so_don_hang}</td>
                    <td className="px-4 py-4 text-sm font-medium">{getCustomerName(order.khach_hang_id)}</td>
                    <td className="px-4 py-4 text-sm text-center">
                      {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      {order.ngay_giao_du_kien ? new Date(order.ngay_giao_du_kien).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-green-600">
                      {order.tong_tien.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 rounded-t-xl">
              <h2 className="text-xl font-bold">
                {editingOrder ? 'Sửa đơn hàng' : 'Thêm đơn hàng'}
              </h2>
            </div>
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Thông tin chung */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Số đơn hàng *</label>
                  <input
                    type="text"
                    value={form.so_don_hang}
                    onChange={(e) => setForm({ ...form, so_don_hang: e.target.value.toUpperCase() })}
                    placeholder="DH241201"
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Khách hàng *</label>
                  <select
                    value={form.khach_hang_id}
                    onChange={(e) => setForm({ ...form, khach_hang_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn khách hàng</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày đặt *</label>
                  <input
                    type="date"
                    value={form.ngay_dat}
                    onChange={(e) => setForm({ ...form, ngay_dat: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày giao dự kiến</label>
                  <input
                    type="date"
                    value={form.ngay_giao_du_kien}
                    onChange={(e) => setForm({ ...form, ngay_giao_du_kien: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Chi tiết đơn hàng */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold mb-4 text-blue-900">Chi tiết đơn hàng</h3>
                
                {/* Thêm sản phẩm */}
                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Chọn thành phẩm để thêm...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.ma_hang} - {p.ten_san_pham}
                        {p.co_thanh_phan_con ? ` (Có ${p.thanh_phan_con.length} con)` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />Thêm
                  </button>
                </div>

                {/* Danh sách sản phẩm */}
                {form.chi_tiet.length > 0 ? (
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Mã hàng</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tên sản phẩm</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">KTSX</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Số lượng</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Đơn giá</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Thành tiền</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {form.chi_tiet.map(item => (
                          <tr key={item.id} className={item.la_thanh_phan_con ? 'bg-purple-50' : ''}>
                            <td className="px-3 py-2 text-sm">
                              <span className={`font-bold ${item.la_thanh_phan_con ? 'text-purple-600 pl-4' : 'text-blue-600'}`}>
                                {item.la_thanh_phan_con && '↳ '}
                                {item.ma_hang}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-sm">{item.ten_san_pham}</td>
                            <td className="px-3 py-2 text-xs text-center">
                              <span className="bg-gray-100 px-2 py-1 rounded">{item.ktsx}</span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              {item.la_thanh_phan_con ? (
                                <span className="text-sm text-gray-600">{item.so_luong}</span>
                              ) : (
                                <input
                                  type="number"
                                  value={item.so_luong}
                                  onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                  className="w-24 px-2 py-1 border rounded text-right text-sm"
                                  min="0"
                                />
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                value={item.don_gia}
                                onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                                className="w-28 px-2 py-1 border rounded text-right text-sm"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2 text-right text-sm font-medium text-green-600">
                              {item.thanh_tien.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {!item.la_thanh_phan_con && (
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="5" className="px-3 py-3 text-right font-bold text-gray-900">
                            TỔNG TIỀN:
                          </td>
                          <td className="px-3 py-3 text-right text-lg font-bold text-green-600">
                            {calculateTotal().toLocaleString('vi-VN')}đ
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Chưa có sản phẩm nào. Chọn thành phẩm bên trên để thêm.</p>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <TextArea
                  value={form.ghi_chu}
                  onChange={(value) => setForm({ ...form, ghi_chu: value })}
                  placeholder="Ghi chú đơn hàng..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-xl">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingOrder(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingOrder ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 rounded-t-xl">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng: {selectedOrder.so_don_hang}</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Thông tin chung */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Số đơn hàng</p>
                  <p className="font-bold text-blue-600">{selectedOrder.so_don_hang}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khách hàng</p>
                  <p className="font-medium">{getCustomerName(selectedOrder.khach_hang_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt</p>
                  <p className="font-medium">{new Date(selectedOrder.ngay_dat).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Chi tiết sản phẩm */}
              <div>
                <h3 className="font-bold mb-3">Chi tiết sản phẩm</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mã hàng</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tên sản phẩm</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">KTSX</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Số lượng</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Đơn giá</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.chi_tiet.map(item => (
                        <tr key={item.id} className={item.la_thanh_phan_con ? 'bg-purple-50' : ''}>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-bold ${item.la_thanh_phan_con ? 'text-purple-600 pl-4' : 'text-blue-600'}`}>
                              {item.la_thanh_phan_con && '↳ '}
                              {item.ma_hang}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{item.ten_san_pham}</td>
                          <td className="px-4 py-3 text-xs text-center">
                            <span className="bg-gray-100 px-2 py-1 rounded">{item.ktsx}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">{item.so_luong}</td>
                          <td className="px-4 py-3 text-right text-sm">{item.don_gia.toLocaleString('vi-VN')}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                            {item.thanh_tien.toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-right font-bold">TỔNG TIỀN:</td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-green-600">
                          {selectedOrder.tong_tien.toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedOrder.ghi_chu && (
                <div>
                  <p className="text-sm text-gray-600">Ghi chú</p>
                  <p className="font-medium">{selectedOrder.ghi_chu}</p>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => handleEdit(selectedOrder)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />Sửa
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesOrder;
