import React, { useState, useEffect } from 'react';
import { X, Save, Eye } from 'lucide-react';

/**
 * ProductModal - Modal xem/sửa Thành phẩm
 * 
 * Props:
 * - productId: ID của thành phẩm cần xem/sửa
 * - mode: 'view' | 'edit' - Chế độ xem hoặc sửa
 * - onSave: Callback khi lưu thay đổi (updatedProduct)
 * - onClose: Callback khi đóng modal
 */
function ProductModal({ productId, mode = 'view', onSave, onClose }) {
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState(null);

  // Load product data
  useEffect(() => {
    if (!productId) return;

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const found = products.find(p => String(p.id) === String(productId));
    
    if (found) {
      setProduct(found);
      setFormData(JSON.parse(JSON.stringify(found))); // Deep copy
    }
  }, [productId]);

  const handleSave = () => {
    if (!formData) return;

    // Update localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const index = products.findIndex(p => String(p.id) === String(productId));
    
    if (index !== -1) {
      products[index] = formData;
      localStorage.setItem('products', JSON.stringify(products));
      
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

  const handleCongDoanChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      cong_doan: {
        ...prev.cong_doan,
        [field]: value
      }
    }));
  };

  if (!product || !formData) {
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              {isEditing ? '✏️ Sửa' : '👁️ Xem'} Thành phẩm
            </h2>
            <p className="text-sm text-gray-600">{formData.ma_hang}</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã hàng</label>
              <input
                type="text"
                value={formData.ma_hang}
                onChange={(e) => handleChange('ma_hang', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
              <input
                type="text"
                value={formData.ten_san_pham}
                onChange={(e) => handleChange('ten_san_pham', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Kích thước */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dài (PO)</label>
              <input
                type="number"
                value={formData.po_dai || ''}
                onChange={(e) => handleChange('po_dai', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rộng (PO)</label>
              <input
                type="number"
                value={formData.po_rong || ''}
                onChange={(e) => handleChange('po_rong', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cao (PO)</label>
              <input
                type="number"
                value={formData.po_cao || ''}
                onChange={(e) => handleChange('po_cao', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Sóng, ĐVT, Kiểu */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sóng</label>
              <input
                type="text"
                value={formData.song || ''}
                onChange={(e) => handleChange('song', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ĐVT</label>
              <input
                type="text"
                value={formData.dvt || ''}
                onChange={(e) => handleChange('dvt', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kiểu</label>
              <input
                type="text"
                value={formData.kieu || ''}
                onChange={(e) => handleChange('kieu', e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Giá & Hoa hồng */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Đơn giá (đ)</label>
              <input
                type="number"
                value={formData.don_gia || ''}
                onChange={(e) => handleChange('don_gia', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">HH cố định (đ)</label>
              <input
                type="number"
                value={formData.hoa_hong_co_dinh || ''}
                onChange={(e) => handleChange('hoa_hong_co_dinh', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">HH %</label>
              <input
                type="number"
                value={formData.hoa_hong_phan_tram || ''}
                onChange={(e) => handleChange('hoa_hong_phan_tram', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* 13 Công đoạn */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">13 Công đoạn sản xuất</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Xả</label>
                <input
                  type="number"
                  value={formData.cong_doan?.xa || ''}
                  onChange={(e) => handleCongDoanChange('xa', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã phim</label>
                <input
                  type="text"
                  value={formData.cong_doan?.ma_phim || ''}
                  onChange={(e) => handleCongDoanChange('ma_phim', e.target.value)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số màu</label>
                <input
                  type="number"
                  value={formData.cong_doan?.so_mau || ''}
                  onChange={(e) => handleCongDoanChange('so_mau', parseInt(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">In</label>
                <input
                  type="number"
                  value={formData.cong_doan?.in || ''}
                  onChange={(e) => handleCongDoanChange('in', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bồi</label>
                <input
                  type="number"
                  value={formData.cong_doan?.boi || ''}
                  onChange={(e) => handleCongDoanChange('boi', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cán màng</label>
                <input
                  type="number"
                  value={formData.cong_doan?.can_mang || ''}
                  onChange={(e) => handleCongDoanChange('can_mang', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã khuôn</label>
                <input
                  type="text"
                  value={formData.cong_doan?.ma_khuon || ''}
                  onChange={(e) => handleCongDoanChange('ma_khuon', e.target.value)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bế</label>
                <input
                  type="number"
                  value={formData.cong_doan?.be || ''}
                  onChange={(e) => handleCongDoanChange('be', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chạp</label>
                <input
                  type="number"
                  value={formData.cong_doan?.chap || ''}
                  onChange={(e) => handleCongDoanChange('chap', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đóng</label>
                <input
                  type="number"
                  value={formData.cong_doan?.dong || ''}
                  onChange={(e) => handleCongDoanChange('dong', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dán</label>
                <input
                  type="number"
                  value={formData.cong_doan?.dan || ''}
                  onChange={(e) => handleCongDoanChange('dan', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Khác</label>
                <input
                  type="number"
                  value={formData.cong_doan?.khac || ''}
                  onChange={(e) => handleCongDoanChange('khac', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Ghi chú Khác</label>
              <textarea
                value={formData.cong_doan?.khac_ghi_chu || ''}
                onChange={(e) => handleCongDoanChange('khac_ghi_chu', e.target.value)}
                disabled={readOnly}
                rows="2"
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.ghi_chu || ''}
              onChange={(e) => handleChange('ghi_chu', e.target.value)}
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

export default ProductModal;
