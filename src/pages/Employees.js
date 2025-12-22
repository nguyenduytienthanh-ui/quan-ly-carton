import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Employees() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, code: 'NV001', name: 'Nguyễn Văn Thanh', weight: 800000, address: 'TP.HCM', phone: '0901234567', debt: 0, account: '', bank: '', branch: '', note: '' },
      { id: 2, code: 'NV002', name: 'Trần Thị Linh', weight: 800000, address: 'Bình Dương', phone: '0907654321', debt: 0, account: '', bank: '', branch: '', note: '' },
      { id: 3, code: 'NV003', name: 'Lê Văn Thêm', weight: 400000, address: 'Đồng Nai', phone: '0903456789', debt: 0, account: '', bank: '', branch: '', note: '' },
    ];
  };

  const [employees, setEmployees] = useState(loadEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    weight: '',
    address: '',
    phone: '',
    account: '',
    bank: '',
    branch: '',
    note: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã nhân viên là bắt buộc';
    } else if (formData.code.length > 15) {
      newErrors.code = 'Mã nhân viên tối đa 15 ký tự';
    } else {
      const codeUpper = formData.code.toUpperCase();
      const isDuplicate = employees.some(e => 
        e.code === codeUpper && (!editingEmployee || e.id !== editingEmployee.id)
      );
      if (isDuplicate) {
        newErrors.code = 'Mã nhân viên đã tồn tại';
      }
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhân viên là bắt buộc';
    }
    
    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'SĐT phải có 10 số và bắt đầu bằng 0';
    }
    
    if (formData.weight) {
      const weight = parseInt(formData.weight);
      if (isNaN(weight) || weight < 0) {
        newErrors.weight = 'Ngày công phải là số không âm';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      code: '',
      name: '',
      weight: '',
      address: '',
      phone: '',
      account: '',
      bank: '',
      branch: '',
      note: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      code: employee.code,
      name: employee.name,
      weight: employee.weight || '',
      address: employee.address || '',
      phone: employee.phone || '',
      account: employee.account || '',
      bank: employee.bank || '',
      branch: employee.branch || '',
      note: employee.note || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const dataToSave = {
      ...formData,
      code: formData.code.toUpperCase(),
      weight: formData.weight ? parseInt(formData.weight) : 0
    };

    if (editingEmployee) {
      setEmployees(employees.map(e => 
        e.id === editingEmployee.id ? { ...e, ...dataToSave, debt: editingEmployee.debt } : e
      ));
    } else {
      setEmployees([...employees, { 
        id: Date.now(), 
        ...dataToSave,
        debt: 0
      }]);
    }
    
    setShowModal(false);
  };

  const handleDeleteClick = (employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setEmployees(employees.filter(e => e.id !== deletingEmployee.id));
    setShowDeleteModal(false);
  };

  const filteredEmployees = employees.filter(e => {
    if (!searchTerm) return true;
    
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    
    const searchableFields = [
      e.code,
      e.name,
      e.phone || '',
      e.address || '',
      e.account || '',
      e.bank || '',
      e.branch || '',
      e.note || ''
    ];
    
    return searchableFields.some(field => 
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nhân viên</h1>
          <p className="text-gray-600">Quản lý danh sách nhân viên</p>
        </div>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Tìm kiếm tất cả các cột (có thể gõ không dấu)..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cân Cước</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ngày công</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tài khoản</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngân hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày vào</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Chi có định</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trợ cấp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{e.code}</td>
                  <td className="px-6 py-4 text-sm">{e.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">-</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.address || '-'}</td>
                  <td className="px-6 py-4 text-sm">{e.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {e.weight?.toLocaleString('vi-VN') || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.account || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.bank ? `${e.bank}${e.branch ? ` - ${e.branch}` : ''}` : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">-</td>
                  <td className="px-6 py-4 text-sm text-right text-red-600">
                    {e.debt?.toLocaleString('vi-VN') || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">-</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{e.note || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteClick(e)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không tìm thấy nhân viên</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mã <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className={`w-full px-4 py-2 border rounded-lg uppercase ${errors.code ? 'border-red-500' : ''}`}
                    maxLength={15}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày công</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.weight ? 'border-red-500' : ''}`}
                    min="0"
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số tài khoản</label>
                  <input
                    type="text"
                    value={formData.account}
                    onChange={(e) => setFormData({...formData, account: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngân hàng</label>
                  <input
                    type="text"
                    value={formData.bank}
                    onChange={(e) => setFormData({...formData, bank: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Chi nhánh</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Chi nhánh ngân hàng"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingEmployee ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc muốn xóa nhân viên <strong>{deletingEmployee?.name}</strong> (Mã: <strong>{deletingEmployee?.code}</strong>)?
              </p>
              <p className="text-sm text-red-600">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
