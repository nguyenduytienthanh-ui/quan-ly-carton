import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

/**
 * CustomerModal - Modal xem/sửa Khách hàng
 * 
 * Props:
 * - customerId: ID của khách hàng cần xem/sửa
 * - mode: 'view' | 'edit' - Chế độ xem hoặc sửa
 * - onSave: Callback khi lưu thay đổi (updatedCustomer)
 * - onClose: Callback khi đóng modal
 */
function CustomerModal({ customerId, mode = 'view', onSave, onClose }) {
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState(null);

  // Load customer data
  useEffect(() => {
    if (!customerId) return;

    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const found = customers.find(c => String(c.id) === String(customerId));
    
    if (found) {
      setCustomer(found);
      setFormData(JSON.parse(JSON.stringify(found))); // Deep copy
    }
  }, [customerId]);

  const handleSave = () => {
    if (!formData) return;

    // Update localStorage
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const index = customers.findIndex(c => String(c.id) === String(customerId));
    
    if (index !== -1) {
      customers[index] = formData;
      localStorage.setItem('customers', JSON.stringify(customers));
      
      // Callback
      if (onSave) onSave(formData);
      
      alert('✅ Đã lưu thay đổi!');
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!customer || !formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  const readOnly = !isEditing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              {isEditing ? '✏️ Sửa' : '👁️ Xem'} Khách hàng
            </h2>
            <p className="text-sm text-gray-600">
              {formData.code || formData.ma_khach_hang} - {formData.name || formData.ten_khach_hang}
            </p>
          </div>
          <div className="flex gap-2">
            {mode === 'view' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã khách hàng</label>
              <input
                type="text"
                value={formData.code || formData.ma_khach_hang || ''}
                onChange={(e) => handleChange(formData.code !== undefined ? 'code' : 'ma_khach_hang', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tên khách hàng</label>
              <input
                type="text"
                value={formData.name || formData.ten_khach_hang || ''}
                onChange={(e) => handleChange(formData.name !== undefined ? 'name' : 'ten_khach_hang', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone || formData.sdt || ''}
                onChange={(e) => handleChange(formData.phone !== undefined ? 'phone' : 'sdt', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <textarea
              value={formData.address || formData.dia_chi || ''}
              onChange={(e) => handleChange(formData.address !== undefined ? 'address' : 'dia_chi', e.target.value)}
              disabled={readOnly}
              rows="2"
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã số thuế</label>
              <input
                type="text"
                value={formData.taxCode || formData.mst || ''}
                onChange={(e) => handleChange(formData.taxCode !== undefined ? 'taxCode' : 'mst', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kỳ hạn thanh toán (ngày)</label>
              <input
                type="number"
                value={formData.paymentTerm || formData.ngay_cn || ''}
                onChange={(e) => handleChange(formData.paymentTerm !== undefined ? 'paymentTerm' : 'ngay_cn', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.note || formData.ghi_chu || ''}
              onChange={(e) => handleChange(formData.note !== undefined ? 'note' : 'ghi_chu', e.target.value)}
              disabled={readOnly}
              rows="3"
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {isEditing ? 'Hủy' : 'Đóng'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerModal;
