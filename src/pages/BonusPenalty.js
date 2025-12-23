import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function BonusPenalty() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    return saved ? JSON.parse(saved) : [];
  };

  const loadBonusPenalty = () => {
    const saved = localStorage.getItem('bonus_penalty');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        emp_id: 1,
        emp_code: 'NV001',
        emp_name: 'Nguyễn Văn Thanh',
        month: '2024-11',
        type: 'bonus', // bonus / penalty
        reason: 'Hoàn thành KPI xuất sắc',
        amount: 2000000,
        calculation_type: 'fixed', // fixed / daily_ratio
        date: '2024-11-25',
        approved_by: 'Giám đốc',
        note: ''
      }
    ];
  };

  const [employees] = useState(loadEmployees);
  const [bonusPenalty, setBonusPenalty] = useState(loadBonusPenalty);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterType, setFilterType] = useState('all'); // all / bonus / penalty
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    emp_id: '',
    month: new Date().toISOString().slice(0, 7),
    type: 'bonus',
    reason: '',
    amount: '',
    calculation_type: 'fixed',
    date: new Date().toISOString().split('T')[0],
    approved_by: '',
    note: ''
  });

  useEffect(() => {
    localStorage.setItem('bonus_penalty', JSON.stringify(bonusPenalty));
  }, [bonusPenalty]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emp_id) {
      newErrors.emp_id = 'Vui lòng chọn nhân viên';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do là bắt buộc';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      emp_id: '',
      month: selectedMonth,
      type: 'bonus',
      reason: '',
      amount: '',
      calculation_type: 'fixed',
      date: new Date().toISOString().split('T')[0],
      approved_by: '',
      note: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      emp_id: item.emp_id,
      month: item.month,
      type: item.type,
      reason: item.reason,
      amount: item.amount,
      calculation_type: item.calculation_type,
      date: item.date,
      approved_by: item.approved_by || '',
      note: item.note || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const employee = employees.find(e => e.id === parseInt(formData.emp_id));
    if (!employee) {
      alert('Không tìm thấy nhân viên!');
      return;
    }

    const dataToSave = {
      ...formData,
      emp_id: parseInt(formData.emp_id),
      emp_code: employee.code,
      emp_name: employee.name,
      amount: parseFloat(formData.amount)
    };

    if (editingItem) {
      setBonusPenalty(bonusPenalty.map(item =>
        item.id === editingItem.id ? { ...item, ...dataToSave } : item
      ));
    } else {
      setBonusPenalty([...bonusPenalty, {
        id: Date.now(),
        ...dataToSave
      }]);
    }

    setShowModal(false);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setBonusPenalty(bonusPenalty.filter(item => item.id !== deletingItem.id));
    setShowDeleteModal(false);
  };

  const getSummary = (month) => {
    const items = bonusPenalty.filter(item => item.month === month);
    const totalBonus = items.filter(i => i.type === 'bonus').reduce((sum, i) => sum + i.amount, 0);
    const totalPenalty = items.filter(i => i.type === 'penalty').reduce((sum, i) => sum + i.amount, 0);
    return { totalBonus, totalPenalty, difference: totalBonus - totalPenalty };
  };

  const filteredItems = bonusPenalty.filter(item => {
    // Filter by month
    if (item.month !== selectedMonth) return false;

    // Filter by type
    if (filterType !== 'all' && item.type !== filterType) return false;

    // Filter by search
    if (!searchTerm) return true;

    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const searchableFields = [
      item.emp_code,
      item.emp_name,
      item.reason || '',
      item.note || ''
    ];

    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const summary = getSummary(selectedMonth);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thưởng / Phạt</h1>
          <p className="text-gray-600">Quản lý thưởng phạt theo tháng</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm thưởng/phạt
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tháng</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Loại</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Tất cả</option>
              <option value="bonus">Chỉ thưởng</option>
              <option value="penalty">Chỉ phạt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Mã NV, tên, lý do..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tổng thưởng</p>
              <p className="text-3xl font-bold mt-1">{summary.totalBonus.toLocaleString('vi-VN')} đ</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Tổng phạt</p>
              <p className="text-3xl font-bold mt-1">{summary.totalPenalty.toLocaleString('vi-VN')} đ</p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Chênh lệch</p>
              <p className="text-3xl font-bold mt-1">{summary.difference.toLocaleString('vi-VN')} đ</p>
            </div>
            <Filter className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cách tính</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người duyệt</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">{item.date}</td>
                  <td className="px-4 py-4 text-sm font-medium text-blue-600">{item.emp_code}</td>
                  <td className="px-4 py-4 text-sm">{item.emp_name}</td>
                  <td className="px-4 py-4">
                    {item.type === 'bonus' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <TrendingUp className="w-3 h-3" />Thưởng
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <TrendingDown className="w-3 h-3" />Phạt
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">{item.reason}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.calculation_type === 'fixed'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {item.calculation_type === 'fixed' ? 'Cố định' : 'Theo ngày công'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className={`font-bold ${item.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'penalty' && '-'}{item.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{item.approved_by || '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không có dữ liệu thưởng/phạt trong tháng này
          </div>
        )}
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Sửa thưởng/phạt' : 'Thêm thưởng/phạt'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tháng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nhân viên <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.emp_id}
                    onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.emp_id ? 'border-red-500' : ''}`}
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.code} - {emp.name}
                      </option>
                    ))}
                  </select>
                  {errors.emp_id && <p className="text-red-500 text-sm mt-1">{errors.emp_id}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Loại <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.type === 'bonus'}
                        onChange={() => setFormData({ ...formData, type: 'bonus' })}
                        className="w-4 h-4"
                      />
                      <span className="text-green-600 font-medium">Thưởng</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.type === 'penalty'}
                        onChange={() => setFormData({ ...formData, type: 'penalty' })}
                        className="w-4 h-4"
                      />
                      <span className="text-red-600 font-medium">Phạt</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cách tính</label>
                  <select
                    value={formData.calculation_type}
                    onChange={(e) => setFormData({ ...formData, calculation_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="fixed">Cố định (không phụ thuộc ngày công)</option>
                    <option value="daily_ratio">Theo ngày công (tính tỷ lệ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Lý do <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.reason ? 'border-red-500' : ''}`}
                  placeholder="VD: Hoàn thành KPI, Đi muộn 3 lần..."
                />
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số tiền <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.amount ? 'border-red-500' : ''}`}
                    min="0"
                    placeholder="2000000"
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Người duyệt</label>
                <input
                  type="text"
                  value={formData.approved_by}
                  onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="VD: Giám đốc, Quản lý..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc muốn xóa {deletingItem?.type === 'bonus' ? 'thưởng' : 'phạt'} này?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm"><strong>Nhân viên:</strong> {deletingItem?.emp_name}</p>
                <p className="text-sm"><strong>Lý do:</strong> {deletingItem?.reason}</p>
                <p className="text-sm"><strong>Số tiền:</strong> {deletingItem?.amount.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BonusPenalty;
