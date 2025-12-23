import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Lock, TrendingUp, TrendingDown, Tag } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function TransactionCategory() {
  const loadCategories = () => {
    const saved = localStorage.getItem('transaction_categories');
    if (saved) return JSON.parse(saved);
    
    // Default system categories
    return [
      { id: 1, ma: 'THUCN', ten: 'Thu công nợ khách hàng', loai: 'thu', is_system: true, mau_sac: '#27ae60', ghi_chu: '' },
      { id: 2, ma: 'THUKHAC', ten: 'Thu khác', loai: 'thu', is_system: true, mau_sac: '#16a085', ghi_chu: '' },
      { id: 3, ma: 'LAI', ten: 'Lãi cá nhân', loai: 'thu', is_system: true, mau_sac: '#2ecc71', ghi_chu: '' },
      { id: 4, ma: 'CNB', ten: 'Chuyển nội bộ', loai: 'thu', is_system: true, mau_sac: '#3498db', ghi_chu: '' },
      { id: 5, ma: 'LAIH', ten: 'Lãi ngân hàng', loai: 'thu', is_system: true, mau_sac: '#1abc9c', ghi_chu: '' },
      { id: 6, ma: 'CHIGCN', ten: 'Chi công nợ nhà cung cấp', loai: 'chi', is_system: false, mau_sac: '#e74c3c', ghi_chu: '' },
      { id: 7, ma: 'CHIHH', ten: 'Chi hoa hồng', loai: 'chi', is_system: false, mau_sac: '#c0392b', ghi_chu: '' },
      { id: 8, ma: 'CHIKHAC', ten: 'Chi khác', loai: 'chi', is_system: false, mau_sac: '#95a5a6', ghi_chu: '' },
      { id: 9, ma: 'CPNL', ten: 'Chi phí nguyên liệu', loai: 'chi', is_system: false, mau_sac: '#e67e22', ghi_chu: '' },
      { id: 10, ma: 'CMB', ten: 'Chi mặt bằng', loai: 'chi', is_system: false, mau_sac: '#d35400', ghi_chu: '' },
      { id: 11, ma: 'CPVTAI', ten: 'Chi phí vận tải', loai: 'chi', is_system: false, mau_sac: '#f39c12', ghi_chu: '' },
      { id: 12, ma: 'CHISM', ten: 'Chi sửa máy', loai: 'chi', is_system: false, mau_sac: '#e74c3c', ghi_chu: '' },
      { id: 13, ma: 'DIEN', ten: 'Chi tiền điện', loai: 'chi', is_system: false, mau_sac: '#f1c40f', ghi_chu: '' },
      { id: 14, ma: 'BHXHCT', ten: 'BHXH Công Ty', loai: 'chi', is_system: false, mau_sac: '#9b59b6', ghi_chu: '' },
      { id: 15, ma: 'CHITU', ten: 'Chi tạm ứng', loai: 'chi', is_system: false, mau_sac: '#8e44ad', ghi_chu: '' },
      { id: 16, ma: 'CPCD', ten: 'Chi phí Cổ Đông', loai: 'chi', is_system: false, mau_sac: '#34495e', ghi_chu: '' },
      { id: 17, ma: 'BHXH-CN', ten: 'BHXH Cá Nhân', loai: 'chi', is_system: false, mau_sac: '#7f8c8d', ghi_chu: '' },
      { id: 18, ma: 'CPQL', ten: 'Chi Phí Quản Lý', loai: 'chi', is_system: false, mau_sac: '#2c3e50', ghi_chu: '' }
    ];
  };

  const [categories, setCategories] = useState(loadCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    ma: '',
    ten: '',
    loai: 'chi',
    mau_sac: '#3498db',
    ghi_chu: ''
  });

  useEffect(() => {
    localStorage.setItem('transaction_categories', JSON.stringify(categories));
  }, [categories]);

  const handleSubmit = () => {
    if (!form.ma.trim() || !form.ten.trim()) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Check duplicate code
    const existingCode = categories.find(c => 
      c.ma.toUpperCase() === form.ma.toUpperCase().trim() && 
      (!editingCategory || c.id !== editingCategory.id)
    );

    if (existingCode) {
      alert('Mã đã tồn tại!');
      return;
    }

    if (editingCategory) {
      setCategories(categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, ma: form.ma.trim().toUpperCase(), ten: form.ten.trim(), loai: form.loai, mau_sac: form.mau_sac, ghi_chu: form.ghi_chu }
          : c
      ));
      alert('Đã cập nhật!');
    } else {
      const newCategory = {
        id: Date.now(),
        ma: form.ma.trim().toUpperCase(),
        ten: form.ten.trim(),
        loai: form.loai,
        is_system: false,
        mau_sac: form.mau_sac,
        ghi_chu: form.ghi_chu
      };
      setCategories([...categories, newCategory]);
      alert('Đã thêm loại thu chi!');
    }

    setShowModal(false);
    setEditingCategory(null);
    setForm({ ma: '', ten: '', loai: 'chi', mau_sac: '#3498db', ghi_chu: '' });
  };

  const handleEdit = (category) => {
    if (category.is_system) {
      alert('Không thể sửa loại hệ thống!');
      return;
    }
    setEditingCategory(category);
    setForm({
      ma: category.ma,
      ten: category.ten,
      loai: category.loai,
      mau_sac: category.mau_sac,
      ghi_chu: category.ghi_chu || ''
    });
    setShowModal(true);
  };

  const handleDelete = (category) => {
    if (category.is_system) {
      alert('Không thể xóa loại hệ thống!');
      return;
    }

    if (window.confirm(`Xóa loại "${category.ten}"?`)) {
      setCategories(categories.filter(c => c.id !== category.id));
    }
  };

  const getSummary = () => {
    const thu = categories.filter(c => c.loai === 'thu').length;
    const chi = categories.filter(c => c.loai === 'chi').length;
    const system = categories.filter(c => c.is_system).length;
    return { thu, chi, system, total: categories.length };
  };

  const filteredCategories = categories.filter(c => {
    if (filterType !== 'all' && c.loai !== filterType) return false;
    if (!searchTerm) return true;

    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const searchableFields = [c.ma, c.ten];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => {
    if (a.is_system && !b.is_system) return -1;
    if (!a.is_system && b.is_system) return 1;
    return a.ma.localeCompare(b.ma);
  });

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Loại Thu Chi</h1>
          <p className="text-gray-600">Quản lý danh mục thu chi</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm loại
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loại</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Tất cả</option>
              <option value="thu">Thu</option>
              <option value="chi">Chi</option>
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
                placeholder="Mã, tên..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng số</p>
              <p className="text-3xl font-bold mt-1">{summary.total}</p>
            </div>
            <Tag className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Loại thu</p>
              <p className="text-3xl font-bold mt-1">{summary.thu}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Loại chi</p>
              <p className="text-3xl font-bold mt-1">{summary.chi}</p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Hệ thống</p>
              <p className="text-3xl font-bold mt-1">{summary.system}</p>
            </div>
            <Lock className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên loại</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Màu sắc</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCategories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600">{category.ma}</span>
                      {category.is_system && (
                        <Lock className="w-4 h-4 text-orange-500" title="Hệ thống" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">{category.ten}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category.loai === 'thu'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.loai === 'thu' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: category.mau_sac }}
                        title={category.mau_sac}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{category.ghi_chu || '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className={`p-2 rounded-lg ${
                          category.is_system
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title={category.is_system ? 'Không thể sửa' : 'Sửa'}
                        disabled={category.is_system}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className={`p-2 rounded-lg ${
                          category.is_system
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={category.is_system ? 'Không thể xóa' : 'Xóa'}
                        disabled={category.is_system}
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
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Sửa loại thu chi' : 'Thêm loại thu chi'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mã *</label>
                  <input
                    type="text"
                    value={form.ma}
                    onChange={(e) => setForm({ ...form, ma: e.target.value.toUpperCase() })}
                    placeholder="VD: CHIPV"
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Loại *</label>
                  <select
                    value={form.loai}
                    onChange={(e) => setForm({ ...form, loai: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="thu">Thu</option>
                    <option value="chi">Chi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên loại *</label>
                <input
                  type="text"
                  value={form.ten}
                  onChange={(e) => setForm({ ...form, ten: e.target.value })}
                  placeholder="VD: Chi phí văn phòng"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Màu sắc</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={form.mau_sac}
                    onChange={(e) => setForm({ ...form, mau_sac: e.target.value })}
                    className="w-20 h-10 border rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{form.mau_sac}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={form.ghi_chu}
                  onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
                  placeholder="Ghi chú về loại thu chi..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                  setForm({ ma: '', ten: '', loai: 'chi', mau_sac: '#3498db', ghi_chu: '' });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionCategory;
