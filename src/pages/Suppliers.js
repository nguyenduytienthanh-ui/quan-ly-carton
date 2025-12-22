import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

// Hàm bỏ dấu tiếng Việt
const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Suppliers() {
  const loadSuppliers = () => {
    const saved = localStorage.getItem('suppliers');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, code: 'NCC001', name: 'Công ty TNHH Giấy ABC', phone: '0901234567', address: 'TP.HCM', email: 'abc@supplier.com', taxCode: '0123456789', paymentTerm: 30, note: 'NCC uy tín' },
      { id: 2, code: 'NCC002', name: 'Công ty CP Bao bì XYZ', phone: '0907654321', address: 'Bình Dương', email: 'xyz@supplier.com', taxCode: '0987654321', paymentTerm: 15, note: '' },
      { id: 3, code: 'NCC003', name: 'Công ty TNHH Nguyên liệu DEF', phone: '0903456789', address: 'Đồng Nai', email: 'def@supplier.com', taxCode: '0111222333', paymentTerm: 7, note: 'Giao hàng nhanh' },
    ];
  };

  const [suppliers, setSuppliers] = useState(loadSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    address: '',
    email: '',
    taxCode: '',
    paymentTerm: 30,
    note: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const validateForm = () => {
    const newErrors = {};
    
    // Mã KH bắt buộc
    if (!formData.code.trim()) {
      newErrors.code = 'Mã nhà cung cấp là bắt buộc';
    } else if (formData.code.length > 15) {
      newErrors.code = 'Mã nhà cung cấp tối đa 15 ký tự';
    } else {
      // Kiểm tra trùng mã (trừ khi đang sửa)
      const codeUpper = formData.code.toUpperCase();
      const isDuplicate = suppliers.some(c => 
        c.code === codeUpper && (!editingCustomer || c.id !== editingCustomer.id)
      );
      if (isDuplicate) {
        newErrors.code = 'Mã nhà cung cấp đã tồn tại';
      }
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhà cung cấp là bắt buộc';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'SĐT phải có 10 số và bắt đầu bằng 0';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Validate ngày công nợ
    const paymentTerm = parseInt(formData.paymentTerm);
    if (isNaN(paymentTerm) || paymentTerm <= 0 || !Number.isInteger(paymentTerm)) {
      newErrors.paymentTerm = 'Ngày công nợ phải là số nguyên lớn hơn 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      code: '',
      name: '',
      phone: '',
      address: '',
      email: '',
      taxCode: '',
      paymentTerm: 30,
      note: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      email: customer.email || '',
      taxCode: customer.taxCode || '',
      paymentTerm: customer.paymentTerm || 30,
      note: customer.note || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Chuyển mã KH thành chữ IN HOA
    const dataToSave = {
      ...formData,
      code: formData.code.toUpperCase()
    };

    if (editingCustomer) {
      setSuppliers(suppliers.map(c => 
        c.id === editingCustomer.id ? { ...c, ...dataToSave } : c
      ));
    } else {
      setSuppliers([...suppliers, { 
        id: Date.now(), 
        ...dataToSave 
      }]);
    }
    
    setShowModal(false);
  };

  const handleDeleteClick = (customer) => {
    setDeletingCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setSuppliers(suppliers.filter(c => c.id !== deletingCustomer.id));
    setShowDeleteModal(false);
  };

  // Tìm kiếm không dấu, tất cả cột
  const filteredSuppliers = suppliers.filter(c => {
    if (!searchTerm) return true;
    
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    
    const searchableFields = [
      c.code,
      c.name,
      c.phone,
      c.address || '',
      c.email || '',
      c.taxCode || '',
      c.note || '',
      `${c.paymentTerm} ngày`
    ];
    
    return searchableFields.some(field => 
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.code.localeCompare(b.code)); // Sắp xếp ABC theo mã KH

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nhà cung cấp</h1>
          <p className="text-gray-600">Quản lý danh sách nhà cung cấp</p>
        </div>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />Thêm nhà cung cấp
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã KH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên nhà cung cấp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MST</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày CN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSuppliers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{c.code}</td>
                  <td className="px-6 py-4 text-sm">{c.name}</td>
                  <td className="px-6 py-4 text-sm">{c.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.address || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.taxCode || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {c.paymentTerm} ngày
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.note || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteClick(c)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không tìm thấy nhà cung cấp</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCustomer ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mã KH <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Chữ IN HOA, tối đa 15 ký tự)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className={`w-full px-4 py-2 border rounded-lg uppercase ${errors.code ? 'border-red-500' : ''}`}
                    placeholder="ABC"
                    maxLength={15}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>
                <div>
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
                  <label className="block text-sm font-medium mb-2">SĐT <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mã số thuế</label>
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => setFormData({...formData, taxCode: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày công nợ</label>
                  <input
                    type="number"
                    value={formData.paymentTerm}
                    onChange={(e) => setFormData({...formData, paymentTerm: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.paymentTerm ? 'border-red-500' : ''}`}
                    placeholder="30"
                    min="1"
                  />
                  {errors.paymentTerm && <p className="text-red-500 text-sm mt-1">{errors.paymentTerm}</p>}
                  <p className="text-xs text-gray-500 mt-1">Số ngày thanh toán (vd: 7, 15, 30, 60...)</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingCustomer ? 'Cập nhật' : 'Thêm'}
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
                Bạn có chắc muốn xóa nhà cung cấp <strong>{deletingCustomer?.name}</strong> (Mã: <strong>{deletingCustomer?.code}</strong>)?
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

export default Suppliers;
