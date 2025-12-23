import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, DollarSign, CheckCircle, Clock } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Advance() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    return saved ? JSON.parse(saved) : [];
  };

  const loadAdvance = () => {
    const saved = localStorage.getItem('advance_payment');
    if (saved) return JSON.parse(saved);
    return [];
  };

  const [employees] = useState(loadEmployees);
  const [advance, setAdvance] = useState(loadAdvance);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all / pending / deducted
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    emp_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    reason: '',
    status: 'pending',
    deducted_month: '',
    approved_by: '',
    note: ''
  });

  useEffect(() => {
    localStorage.setItem('advance_payment', JSON.stringify(advance));
  }, [advance]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emp_id) {
      newErrors.emp_id = 'Vui lòng chọn nhân viên';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      emp_id: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      reason: '',
      status: 'pending',
      deducted_month: '',
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
      date: item.date,
      amount: item.amount,
      reason: item.reason,
      status: item.status,
      deducted_month: item.deducted_month || '',
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
      amount: parseFloat(formData.amount),
      deducted_month: formData.status === 'deducted' ? formData.deducted_month : null
    };

    if (editingItem) {
      setAdvance(advance.map(item =>
        item.id === editingItem.id ? { ...item, ...dataToSave } : item
      ));
    } else {
      setAdvance([...advance, {
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
    setAdvance(advance.filter(item => item.id !== deletingItem.id));
    setShowDeleteModal(false);
  };

  const handleToggleStatus = (item) => {
    const newStatus = item.status === 'pending' ? 'deducted' : 'pending';
    const deducted_month = newStatus === 'deducted' ? new Date().toISOString().slice(0, 7) : null;

    setAdvance(advance.map(a =>
      a.id === item.id ? { ...a, status: newStatus, deducted_month } : a
    ));
  };

  const getSummary = () => {
    const pending = advance.filter(a => a.status === 'pending').reduce((sum, a) => sum + a.amount, 0);
    const deducted = advance.filter(a => a.status === 'deducted').reduce((sum, a) => sum + a.amount, 0);
    return { pending, deducted, total: pending + deducted };
  };

  const filteredItems = advance.filter(item => {
    // Filter by status
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;

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

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tạm ứng</h1>
          <p className="text-gray-600">Quản lý tạm ứng & trừ lương</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm tạm ứng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chưa trừ</option>
              <option value="deducted">Đã trừ</option>
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
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Chưa trừ</p>
              <p className="text-3xl font-bold mt-1">{summary.pending.toLocaleString('vi-VN')} đ</p>
            </div>
            <Clock className="w-12 h-12 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Đã trừ</p>
              <p className="text-3xl font-bold mt-1">{summary.deducted.toLocaleString('vi-VN')} đ</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng cộng</p>
              <p className="text-3xl font-bold mt-1">{summary.total.toLocaleString('vi-VN')} đ</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tháng trừ</th>
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
                  <td className="px-4 py-4 text-sm">{item.reason}</td>
                  <td className="px-4 py-4 text-sm text-right font-bold text-orange-600">
                    {item.amount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 mx-auto ${
                        item.status === 'pending'
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {item.status === 'pending' ? (
                        <><Clock className="w-3 h-3" />Chưa trừ</>
                      ) : (
                        <><CheckCircle className="w-3 h-3" />Đã trừ</>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-600">
                    {item.deducted_month || '-'}
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
            Không có dữ liệu tạm ứng
          </div>
        )}
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Sửa tạm ứng' : 'Thêm tạm ứng'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                <label className="block text-sm font-medium mb-2">
                  Lý do <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.reason ? 'border-red-500' : ''}`}
                  placeholder="VD: Gia đình ốm đau, Chi phí đột xuất..."
                />
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="pending">Chưa trừ</option>
                    <option value="deducted">Đã trừ</option>
                  </select>
                </div>
                {formData.status === 'deducted' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Tháng trừ</label>
                    <input
                      type="month"
                      value={formData.deducted_month}
                      onChange={(e) => setFormData({ ...formData, deducted_month: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                )}
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
                Bạn có chắc muốn xóa tạm ứng này?
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

export default Advance;
