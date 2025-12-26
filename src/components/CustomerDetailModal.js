import React, { useState, useEffect } from 'react';
import { X, Save, Edit, Package } from 'lucide-react';

/**
 * ProductDetailModal - MODAL XEM/SỬA THÀNH PHẨM ĐẦY ĐỦ
 * 
 * Hiển thị TẤT CẢ fields từ Product
 */

const ProductDetailModal = ({ 
  productId, 
  isOpen, 
  onClose,
  onSave 
}) => {
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load product data
  useEffect(() => {
    if (isOpen && productId) {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const found = products.find(p => 
        p.id === productId || 
        p.id === parseInt(productId) ||
        p.ma_hang === productId
      );
      
      if (found) {
        setProduct(found);
      }
    }
  }, [isOpen, productId]);

  if (!isOpen || !product) return null;

  // Calculate KTSX
  const ktsx = product.sx_dai || product.sx_rong || product.sx_cao
    ? `${product.sx_dai || product.po_dai || 0}×${product.sx_rong || product.po_rong || 0}${(product.sx_cao || product.po_cao) ? `×${product.sx_cao || product.po_cao}` : ''}`
    : `${product.po_dai || 0}×${product.po_rong || 0}${product.po_cao ? `×${product.po_cao}` : ''}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Chi tiết thành phẩm
            </h2>
            <p className="text-sm text-gray-600">Mã: {product.ma_hang}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Mã hàng</p>
              <p className="font-bold text-blue-600 text-lg">{product.ma_hang}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tên sản phẩm</p>
              <p className="font-medium">{product.ten_san_pham}</p>
            </div>
          </div>

          {/* Kích thước */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-3">Kích thước</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">KTSX (Sản xuất)</p>
                <p className="font-medium bg-blue-50 px-3 py-2 rounded">{ktsx}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">KTPO (Đơn hàng)</p>
                <p className="font-medium bg-gray-50 px-3 py-2 rounded">
                  {product.po_dai}×{product.po_rong}{product.po_cao ? `×${product.po_cao}` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Dài SX</p>
                <p className="font-medium">{product.sx_dai || product.po_dai || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Rộng SX</p>
                <p className="font-medium">{product.sx_rong || product.po_rong || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Cao SX</p>
                <p className="font-medium">{product.sx_cao || product.po_cao || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">Dài PO</p>
                <p className="font-medium">{product.po_dai || '-'}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">Rộng PO</p>
                <p className="font-medium">{product.po_rong || '-'}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">Cao PO</p>
                <p className="font-medium">{product.po_cao || '-'}</p>
              </div>
            </div>
          </div>

          {/* Thông số sản phẩm */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-3">Thông số sản phẩm</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Đơn giá</p>
                <p className="font-medium text-green-600 text-lg">
                  {(product.don_gia || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sóng</p>
                <p className="font-medium">{product.song || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Đơn vị tính</p>
                <p className="font-medium">{product.dvt || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-sm text-gray-600">Kiểu</p>
                <p className="font-medium">{product.kieu || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số màu</p>
                <p className="font-medium">{product.so_mau || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số lượng sai lệch</p>
                <p className="font-medium text-orange-600">
                  {product.so_luong_sai_lech ? `±${product.so_luong_sai_lech}%` : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Công đoạn & Mã */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-3">Công đoạn & Mã liên quan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã phim</p>
                <p className="font-medium bg-purple-50 px-3 py-2 rounded">
                  {product.cong_doan?.ma_phim || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã khuôn</p>
                <p className="font-medium bg-purple-50 px-3 py-2 rounded">
                  {product.cong_doan?.ma_khuon || '-'}
                </p>
              </div>
            </div>

            <div className="mt-3 bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600 mb-2">Các công đoạn khác</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.cong_doan?.in_khuon && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>In khuôn</span>
                  </div>
                )}
                {product.cong_doan?.be && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Bế</span>
                  </div>
                )}
                {product.cong_doan?.dan && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Dán</span>
                  </div>
                )}
                {product.cong_doan?.ghep && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Ghép</span>
                  </div>
                )}
                {product.cong_doan?.ep_keo && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Ép keo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thành phần con */}
          {product.thanh_phan_con && product.thanh_phan_con.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Thành phần con</h3>
              <div className="space-y-2">
                {product.thanh_phan_con.map((con, index) => (
                  <div key={index} className="bg-purple-50 p-3 rounded flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-purple-700">↳ {con.ma_hang}</p>
                      <p className="text-sm text-gray-600">{con.ten_san_pham}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">KTSX: {con.ktsx}</p>
                      {con.cong_doan?.ma_phim && (
                        <p className="text-xs text-purple-600">Phim: {con.cong_doan.ma_phim}</p>
                      )}
                      {con.cong_doan?.ma_khuon && (
                        <p className="text-xs text-purple-600">Khuôn: {con.cong_doan.ma_khuon}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ghi chú */}
          {product.ghi_chu && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Ghi chú</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">{product.ghi_chu}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
