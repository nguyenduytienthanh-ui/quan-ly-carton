import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, X, ShoppingCart, QrCode, Calendar,
  Filter, FileSpreadsheet, Upload, Download, ExternalLink
} from 'lucide-react';
import TextInput from '../components/TextInput';
import TextArea from '../components/TextArea';

// ============================================
// 5 COMPONENTS MỚI - ĐÃ TÍCH HỢP
// ============================================
import SearchBox from '../components/SearchBox';
import FilterBoxV2 from '../components/FilterBoxV2';
import ProductModal from '../components/ProductModal';
import CustomerModal from '../components/CustomerModal';
import LinkedFieldV2 from '../components/LinkedFieldV2';
import ExcelActions from '../components/ExcelActions';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Tạo số đơn hàng tự động: DHXyyyymmxxx
const generateSoDonHang = (existingOrders) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `DHX${year}${month}`;
  
  const currentMonthOrders = existingOrders.filter(o => 
    o.so_don_hang?.startsWith(prefix)
  );
  
  let maxNum = 0;
  currentMonthOrders.forEach(o => {
    const num = parseInt(o.so_don_hang.slice(-3));
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });
  
  const newNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}${newNum}`;
};

// Lấy tên khách hàng
const getCustomerName = (customerId, customers) => {
  if (!customerId || !customers) return '';
  const customer = customers.find(c => String(c.id) === String(customerId));
  return customer?.name               // ← Ưu tiên đầu tiên
    || customer?.ten_khach_hang 
    || customer?.tenKhachHang 
    || customer?.ten 
    || '';
};

// Lấy mã khách hàng
const getCustomerCode = (customerId, customers) => {
  if (!customerId || !customers) return '';
  const customer = customers.find(c => String(c.id) === String(customerId));
  return customer?.code               // ← Ưu tiên đầu tiên
    || customer?.ma_khach_hang 
    || customer?.maKhachHang 
    || customer?.ma 
    || '';
};

// Tạo danh sách tháng cho dropdown
const generateMonthOptions = () => {
  const months = [];
  const currentDate = new Date();
  
  // Tạo 12 tháng gần nhất (6 tháng trước + tháng hiện tại + 5 tháng sau)
  for (let i = -6; i <= 5; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    months.push({
      value: `${year}-${month}`,
      label: `Tháng ${month}/${year}`
    });
  }
  
  return months;
};

// Format tháng hiện tại
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// ============================================================================
// MAIN COMPONENT  
// ============================================================================

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
  const [products, setProducts] = useState(loadProducts);
  const [customers, setCustomers] = useState(loadCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQRData] = useState(null);

  // Ref cho auto focus số lượng
  const quantityInputRefs = useRef({});
  
  // ============================================
  // STATES MỚI - CHO 5 COMPONENTS
  // ============================================
  
  // Advanced filter states
  const [showFilterBox, setShowFilterBox] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    customerIds: [],
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: '',
    deliveryDateFrom: '',
    deliveryDateTo: ''
  });
  
  // Modal states
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Search states
  const [searchResults, setSearchResults] = useState([]);

  const [form, setForm] = useState({
    so_don_hang: '',
    khach_hang_id: '',
    khach_hang_ma: '',      // Thêm mã KH
    khach_hang_ten: '',     // Thêm tên KH
    ngay_dat: new Date().toISOString().split('T')[0],
    ngay_giao_du_kien: '',
    chi_tiet: [],
    ghi_chu: ''
  });

  useEffect(() => {
    localStorage.setItem('salesOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    setProducts(loadProducts());
    const loadedCustomers = loadCustomers();
    
    // DEBUG: Log cấu trúc Customer
    console.log('=== CUSTOMERS DEBUG ===');
    console.log('Total customers:', loadedCustomers.length);
    if (loadedCustomers.length > 0) {
      console.log('First customer structure:', loadedCustomers[0]);
      console.log('All customer fields:', Object.keys(loadedCustomers[0]));
    }
    
    setCustomers(loadedCustomers);
  }, []);
  
  // ============================================
  // REFRESH DATA - Sau khi sửa trong modal
  // ============================================
  const refreshData = () => {
    setOrders(loadOrders());
    setProducts(loadProducts());
    setCustomers(loadCustomers());
  };

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleSubmit = () => {
    if (!form.so_don_hang.trim() || !form.khach_hang_id) {
      alert('Vui lòng điền đầy đủ Số đơn hàng và Khách hàng!');
      return;
    }

    if (form.chi_tiet.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm!');
      return;
    }

    // Check số lượng (chỉ check mẹ, con tự động)
    const hasInvalidQty = form.chi_tiet.some(item => 
      !item.la_thanh_phan_con && (!item.so_luong || item.so_luong <= 0)
    );
    if (hasInvalidQty) {
      alert('Vui lòng nhập số lượng cho tất cả sản phẩm mẹ!');
      return;
    }

    const orderData = {
      so_don_hang: form.so_don_hang.trim(),
      khach_hang_id: form.khach_hang_id,
      ngay_dat: form.ngay_dat,
      ngay_giao_du_kien: form.ngay_giao_du_kien,
      chi_tiet: form.chi_tiet.map(item => ({
        ...item,
        so_luong: parseFloat(item.so_luong) || 0,
        thanh_tien: (parseFloat(item.so_luong) || 0) * parseFloat(item.don_gia)
      })),
      tong_tien: form.chi_tiet.reduce((sum, item) => 
        sum + ((parseFloat(item.so_luong) || 0) * parseFloat(item.don_gia)), 0
      ),
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
        ngay_tao: new Date().toISOString()
      };
      setOrders([...orders, newOrder]);
      alert('Đã tạo đơn hàng mới!');
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    // Reload customers mỗi lần reset form
    const latestCustomers = loadCustomers();
    setCustomers(latestCustomers);
    
    setForm({
      so_don_hang: generateSoDonHang(orders),
      khach_hang_id: '',
      khach_hang_ma: '',
      khach_hang_ten: '',
      ngay_dat: new Date().toISOString().split('T')[0],
      ngay_giao_du_kien: '',
      chi_tiet: [],
      ghi_chu: ''
    });
    setEditingOrder(null);
    quantityInputRefs.current = {};
  };

  const handleEdit = (order) => {
    // Tìm thông tin KH
    const customer = customers.find(c => c.id === order.khach_hang_id);
    
    const maKH = customer?.code 
      || customer?.ma_khach_hang 
      || customer?.maKhachHang 
      || customer?.ma 
      || '';
      
    const tenKH = customer?.name 
      || customer?.ten_khach_hang 
      || customer?.tenKhachHang 
      || customer?.ten 
      || '';
    
    setForm({
      ...order,
      khach_hang_ma: maKH,
      khach_hang_ten: tenKH,
      chi_tiet: order.chi_tiet.map(item => ({
        ...item,
        so_luong: item.so_luong.toString()
      }))
    });
    setEditingOrder(order);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      setOrders(orders.filter(o => o.id !== id));
      alert('Đã xóa đơn hàng!');
    }
  };

  // ============================================================================
  // QR CODE HANDLER
  // ============================================================================

  const handleShowQR = (soDonHang, maHang) => {
    setQRData({
      code: `${soDonHang}-${maHang}`,
      soDonHang: soDonHang,
      maHang: maHang
    });
    setShowQRModal(true);
  };

  // ============================================================================
  // PRODUCT HANDLERS - MẸ + CON TỰ ĐỘNG
  // ============================================================================

  const handleAddProduct = (product) => {
    const ktpo = product.po_cao 
      ? `${product.po_dai}×${product.po_rong}×${product.po_cao}`
      : `${product.po_dai}×${product.po_rong}`;
    
    const ktsx = (product.sx_dai || product.sx_rong || product.sx_cao)
      ? `${product.sx_dai || product.po_dai}×${product.sx_rong || product.po_rong}${product.sx_cao || product.po_cao ? '×' + (product.sx_cao || product.po_cao) : ''}`
      : ktpo;

    const newItems = [];
    
    // 1. THÊM MẸ
    const parentItem = {
      id: Date.now(),
      thanh_pham_id: product.id,
      ma_hang: product.ma_hang,
      ten_san_pham: product.ten_san_pham,
      ktpo: ktpo,
      ktsx: ktsx,
      song: product.song || 'N/A',
      dvt: product.dvt || 'Cái',
      kieu: product.kieu || '',
      don_gia: product.don_gia || 0,
      so_luong: '',
      thanh_tien: 0,
      hoa_hong_co_dinh: product.hoa_hong_co_dinh || 0,
      hoa_hong_phan_tram: product.hoa_hong_phan_tram || 0,
      cho_phep_sai_lech: product.cho_phep_sai_lech || false,
      sai_lech_so_luong: product.sai_lech_so_luong || 0,
      sai_lech_phan_tram: product.sai_lech_phan_tram || 0,
      cong_doan: {
        xa: product.cong_doan?.xa || 0,
        ma_phim: product.cong_doan?.ma_phim || '',
        so_mau: product.cong_doan?.so_mau || 0,
        in: product.cong_doan?.in || 0,
        boi: product.cong_doan?.boi || 0,
        can_mang: product.cong_doan?.can_mang || 0,
        ma_khuon: product.cong_doan?.ma_khuon || '',
        be: product.cong_doan?.be || 0,
        chap: product.cong_doan?.chap || 0,
        dong: product.cong_doan?.dong || 0,
        dan: product.cong_doan?.dan || 0,
        khac: product.cong_doan?.khac || 0,
        khac_ghi_chu: product.cong_doan?.khac_ghi_chu || ''
      },
      ghi_chu: product.ghi_chu || '',
      la_thanh_phan_con: false,
      thanh_pham_me_id: null
    };
    
    newItems.push(parentItem);

    // 2. THÊM CON (nếu có)
    if (product.co_thanh_phan_con && product.thanh_phan_con && product.thanh_phan_con.length > 0) {
      product.thanh_phan_con.forEach((con, index) => {
        const conKtpo = con.po_cao 
          ? `${con.po_dai}×${con.po_rong}×${con.po_cao}`
          : `${con.po_dai}×${con.po_rong}`;
        
        const conKtsx = (con.sx_dai || con.sx_rong || con.sx_cao)
          ? `${con.sx_dai || con.po_dai}×${con.sx_rong || con.po_rong}${con.sx_cao || con.po_cao ? '×' + (con.sx_cao || con.po_cao) : ''}`
          : conKtpo;

        const childItem = {
          id: Date.now() + index + 1,
          thanh_pham_id: `${product.id}_${con.ma_hang_con}`,
          ma_hang: con.ma_hang_con,
          ten_san_pham: con.ten,
          ktpo: conKtpo,
          ktsx: conKtsx,
          song: con.song || product.song || 'N/A',
          dvt: con.dvt || product.dvt || 'Cái',
          kieu: con.kieu || product.kieu || '',
          don_gia: con.don_gia || 0,
          so_luong: '', // Sẽ tự động tính từ mẹ
          thanh_tien: 0,
          hoa_hong_co_dinh: 0,
          hoa_hong_phan_tram: 0,
          cho_phep_sai_lech: false,
          sai_lech_so_luong: 0,
          sai_lech_phan_tram: 0,
          cong_doan: {
            xa: con.cong_doan?.xa || 0,
            ma_phim: con.cong_doan?.ma_phim || '',
            so_mau: con.cong_doan?.so_mau || 0,
            in: con.cong_doan?.in || 0,
            boi: con.cong_doan?.boi || 0,
            can_mang: con.cong_doan?.can_mang || 0,
            ma_khuon: con.cong_doan?.ma_khuon || '',
            be: con.cong_doan?.be || 0,
            chap: con.cong_doan?.chap || 0,
            dong: con.cong_doan?.dong || 0,
            dan: con.cong_doan?.dan || 0,
            khac: con.cong_doan?.khac || 0,
            khac_ghi_chu: con.cong_doan?.khac_ghi_chu || ''
          },
          ghi_chu: con.ghi_chu || '',
          la_thanh_phan_con: true,
          thanh_pham_me_id: parentItem.id,
          so_luong_con_theo_me: con.so_luong || 1 // Tỷ lệ: 1 mẹ = bao nhiêu con
        };
        
        newItems.push(childItem);
      });
    }

    setForm({
      ...form,
      chi_tiet: [...form.chi_tiet, ...newItems]
    });

    setShowProductModal(false);
    setProductSearchTerm('');

    // Auto focus vào SL của mẹ
    setTimeout(() => {
      const input = quantityInputRefs.current[parentItem.id];
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  };

  const handleUpdateQuantity = (itemId, value) => {
    const item = form.chi_tiet.find(i => i.id === itemId);
    
    if (!item) return;

    // Nếu là mẹ → update cả con
    if (!item.la_thanh_phan_con) {
      const meQty = parseFloat(value) || 0;
      
      setForm({
        ...form,
        chi_tiet: form.chi_tiet.map(i => {
          // Update mẹ
          if (i.id === itemId) {
            return {
              ...i,
              so_luong: value,
              thanh_tien: meQty * parseFloat(i.don_gia)
            };
          }
          
          // Update con (nếu thuộc về mẹ này)
          if (i.la_thanh_phan_con && i.thanh_pham_me_id === itemId) {
            const conQty = meQty * (i.so_luong_con_theo_me || 1);
            return {
              ...i,
              so_luong: conQty.toString(),
              thanh_tien: conQty * parseFloat(i.don_gia)
            };
          }
          
          return i;
        })
      });
    }
    // Con không được edit trực tiếp
  };

  const handleRemoveItem = (itemId) => {
    const item = form.chi_tiet.find(i => i.id === itemId);
    
    if (!item) return;

    // Nếu xóa mẹ → xóa cả con
    if (!item.la_thanh_phan_con) {
      if (window.confirm('Xóa sản phẩm mẹ sẽ xóa cả các thành phần con. Bạn có chắc?')) {
        setForm({
          ...form,
          chi_tiet: form.chi_tiet.filter(i => 
            i.id !== itemId && i.thanh_pham_me_id !== itemId
          )
        });
      }
    } else {
      // Không cho xóa con riêng lẻ
      alert('Không thể xóa thành phần con riêng lẻ. Vui lòng xóa sản phẩm mẹ.');
    }
  };

  // ============================================================================
  // PRODUCT SELECTION - CHỈ MẸ
  // ============================================================================

  const getParentProductsOnly = () => {
    return products.map(product => ({
      ...product,
      displayName: product.co_thanh_phan_con && product.thanh_phan_con?.length > 0
        ? `${product.ma_hang} - ${product.ten_san_pham} (có ${product.thanh_phan_con.length} con)`
        : `${product.ma_hang} - ${product.ten_san_pham}`
    }));
  };

  const filteredProducts = getParentProductsOnly().filter(p => {
    const searchLower = productSearchTerm.toLowerCase();
    return (
      p.ma_hang.toLowerCase().includes(searchLower) ||
      (p.ten_san_pham || '').toLowerCase().includes(searchLower) ||
      p.displayName.toLowerCase().includes(searchLower)
    );
  });

  // ============================================================================
  // FILTERS - Theo tháng
  // ============================================================================

  const filteredOrders = orders.filter(o => {
    // Filter theo tháng
    const orderYearMonth = o.so_don_hang.slice(3, 9); // DHX202512001 → 202512
    const selectedYearMonth = selectedMonth.replace('-', ''); // 2025-12 → 202512
    
    if (orderYearMonth !== selectedYearMonth) return false;

    // Filter theo search term (old - giữ lại để backup)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = getCustomerName(o.khach_hang_id, customers);
      const customerCode = getCustomerCode(o.khach_hang_id, customers);
      
      return (
        o.so_don_hang.toLowerCase().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower) ||
        customerCode.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
  
  // ============================================
  // DISPLAY ORDERS - Kết hợp Search + Filter
  // ============================================
  const displayOrders = searchResults.length > 0 
    ? searchResults.filter(o => {
        // Vẫn phải lọc theo tháng
        const orderYearMonth = o.so_don_hang.slice(3, 9);
        const selectedYearMonth = selectedMonth.replace('-', '');
        return orderYearMonth === selectedYearMonth;
      })
    : filteredOrders;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng Xuất</h1>
          <p className="text-gray-600">Quản lý đơn hàng xuất kho</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilterBox(!showFilterBox)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              showFilterBox 
                ? 'bg-blue-100 border-blue-600 text-blue-700' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>
          
          <ExcelActions
            onExport={() => console.log('Export:', filteredOrders)}
            onImport={(data) => console.log('Import:', data)}
            data={filteredOrders}
            moduleName="don-hang-xuat"
          />
          
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />Tạo đơn hàng
          </button>
        </div>
      </div>

      {/* ============================================
          FILTERBOX V2 - BỘ LỌC NÂNG CAO MỚI
          ============================================ */}
      {showFilterBox && (
        <FilterBoxV2
          filters={advancedFilters}
          onFilterChange={setAdvancedFilters}
          onReset={() => setAdvancedFilters({
            customerIds: [],
            minAmount: '',
            maxAmount: '',
            dateFrom: '',
            dateTo: '',
            deliveryDateFrom: '',
            deliveryDateTo: ''
          })}
          filterConfig={[
            {
              type: 'multiSelect',
              field: 'customerIds',
              label: 'Khách hàng',
              options: customers.map(c => ({
                value: c.id,
                label: `${c.code || c.ma_khach_hang} - ${c.name || c.ten_khach_hang}`
              }))
            },
            {
              type: 'numberRange',
              field: ['minAmount', 'maxAmount'],
              label: 'Số tiền (đ)'
            },
            {
              type: 'dateRange',
              field: ['dateFrom', 'dateTo'],
              label: 'Ngày đặt'
            },
            {
              type: 'dateRange',
              field: ['deliveryDateFrom', 'deliveryDateTo'],
              label: 'Ngày giao dự kiến'
            }
          ]}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Chọn tháng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Lọc theo tháng
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            >
              {generateMonthOptions().map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* ============================================
              SEARCHBOX - TÌM KIẾM TẤT CẢ CỘT
              ============================================ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Tìm kiếm
            </label>
            <SearchBox
              data={orders}
              searchFields="ALL"
              onResult={(filtered) => setSearchResults(filtered)}
              placeholder="Tìm kiếm tất cả (số đơn, khách hàng, mã hàng...)"
              showResultCount={true}
            />
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-blue-600">{displayOrders.length}</span> đơn hàng
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayOrders.map(order => {
          // Convert ID to string for matching
          const customerName = getCustomerName(order.khach_hang_id, customers);
          const customerCode = getCustomerCode(order.khach_hang_id, customers);

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-lg text-blue-900">{order.so_don_hang}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>📦 KH: <span className="font-medium text-gray-900">{customerCode} - {customerName}</span></span>
                      <span>•</span>
                      <span>📅 Đặt: {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      <span>🚚 Giao: {new Date(order.ngay_giao_du_kien).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-2xl font-bold text-green-600">
                      {order.tong_tien.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(order)}
                    className="p-2 text-blue-600 hover:border rounded-lg"
                    title="Sửa"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Xóa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Sản phẩm:</span> {order.chi_tiet.length} mặt hàng
                </div>
                {order.ghi_chu && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Ghi chú:</span>
                    <span className="text-gray-600 ml-2">{order.ghi_chu}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {displayOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
            Không có đơn hàng nào
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingOrder ? 'Sửa đơn hàng' : 'Tạo đơn hàng mới'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Thông tin đơn hàng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số đơn hàng * <span className="text-xs text-gray-500">(Tự động)</span>
                  </label>
                  <input
                    type="text"
                    value={form.so_don_hang}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Khách hàng *
                  </label>
                  <select
                    value={form.khach_hang_id}
                    onChange={(e) => {
                      const customerId = e.target.value;
                      // Convert to string for consistent comparison
                      const selectedCustomer = customers.find(c => String(c.id) === String(customerId));
                      
                      console.log('=== onChange Debug ===');
                      console.log('Selected value:', customerId, 'Type:', typeof customerId);
                      console.log('Found customer:', selectedCustomer);
                      
                      if (selectedCustomer) {
                        const maKH = selectedCustomer.code 
                          || selectedCustomer.ma_khach_hang 
                          || selectedCustomer.maKhachHang 
                          || selectedCustomer.ma 
                          || selectedCustomer.ma_kh
                          || '';
                          
                        const tenKH = selectedCustomer.name 
                          || selectedCustomer.ten_khach_hang 
                          || selectedCustomer.tenKhachHang 
                          || selectedCustomer.ten 
                          || selectedCustomer.ten_kh
                          || '';
                        
                        console.log('Set form - Mã:', maKH, 'Tên:', tenKH);
                        
                        setForm({ 
                          ...form, 
                          khach_hang_id: customerId,
                          khach_hang_ma: maKH,
                          khach_hang_ten: tenKH
                        });
                      } else {
                        console.error('Customer not found for ID:', customerId);
                        setForm({ 
                          ...form, 
                          khach_hang_id: customerId,
                          khach_hang_ma: '',
                          khach_hang_ten: ''
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">-- Chọn mã khách hàng --</option>
                    {customers.map(c => {
                      const maKH = c.code || c.ma_khach_hang || c.maKhachHang || c.ma || c.ma_kh || c.id;
                      
                      return (
                        <option key={c.id} value={c.id}>
                          {maKH}
                        </option>
                      );
                    })}
                  </select>
                  {form.khach_hang_id && (() => {
                    // Convert IDs to string for comparison (fix number vs string mismatch)
                    const selectedCustomer = customers.find(c => String(c.id) === String(form.khach_hang_id));
                    const customerName = selectedCustomer?.name 
                      || selectedCustomer?.ten_khach_hang 
                      || selectedCustomer?.tenKhachHang 
                      || form.khach_hang_ten
                      || '';
                    
                    console.log('=== Display Name Debug ===');
                    console.log('Selected ID:', form.khach_hang_id, 'Type:', typeof form.khach_hang_id);
                    console.log('Found customer:', selectedCustomer);
                    console.log('Customer name:', customerName);
                    
                    return customerName ? (
                      <p className="text-sm text-blue-600 mt-1 font-medium">
                        → {customerName}
                      </p>
                    ) : (
                      <p className="text-sm text-orange-500 mt-1">
                        ⚠ ID: {form.khach_hang_id} - Customer not found in array
                      </p>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ngày đặt</label>
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

              {/* Chi tiết sản phẩm */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Chi tiết sản phẩm</h3>
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />Thêm sản phẩm
                  </button>
                </div>

                {form.chi_tiet.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          {/* Thông tin cơ bản */}
                          <th className="px-3 py-2 text-left font-semibold border">Mã hàng</th>
                          <th className="px-3 py-2 text-left font-semibold border">Tên SP</th>
                          <th className="px-3 py-2 text-center font-semibold border">KTPO</th>
                          <th className="px-3 py-2 text-center font-semibold border">KTSX</th>
                          <th className="px-3 py-2 text-center font-semibold border">Sóng</th>
                          <th className="px-3 py-2 text-center font-semibold border">ĐVT</th>
                          <th className="px-3 py-2 text-center font-semibold border">Kiểu</th>
                          
                          {/* Giá (Đơn giá → SL → Thành tiền → +/- → HH) */}
                          <th className="px-3 py-2 text-right font-semibold border">Đơn giá</th>
                          <th className="px-3 py-2 text-center font-semibold border">SL</th>
                          <th className="px-3 py-2 text-right font-semibold border">Thành tiền</th>
                          <th className="px-3 py-2 text-center font-semibold border">+/-</th>
                          <th className="px-3 py-2 text-right font-semibold border">HH cố định</th>
                          <th className="px-3 py-2 text-right font-semibold border">HH %</th>
                          
                          {/* 13 công đoạn */}
                          <th className="px-3 py-2 text-center font-semibold border">Xả</th>
                          <th className="px-3 py-2 text-center font-semibold border">Mã phim</th>
                          <th className="px-3 py-2 text-center font-semibold border">Số màu</th>
                          <th className="px-3 py-2 text-center font-semibold border">In</th>
                          <th className="px-3 py-2 text-center font-semibold border">Bồi</th>
                          <th className="px-3 py-2 text-center font-semibold border">Cán màng</th>
                          <th className="px-3 py-2 text-center font-semibold border">Mã khuôn</th>
                          <th className="px-3 py-2 text-center font-semibold border">Bế</th>
                          <th className="px-3 py-2 text-center font-semibold border">Chạp</th>
                          <th className="px-3 py-2 text-center font-semibold border">Đóng</th>
                          <th className="px-3 py-2 text-center font-semibold border">Dán</th>
                          <th className="px-3 py-2 text-center font-semibold border">Khác</th>
                          <th className="px-3 py-2 text-left font-semibold border">Ghi chú Khác</th>
                          
                          {/* Ghi chú & Action */}
                          <th className="px-3 py-2 text-left font-semibold border">Ghi chú</th>
                          <th className="px-3 py-2 text-center font-semibold border">QR</th>
                          <th className="px-3 py-2 text-center font-semibold border"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.chi_tiet.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {/* ============================================
                                LINKEDFIELD V2 - FORM CREATE/EDIT
                                Click Mã hàng → Mở ProductModal
                                ============================================ */}
                            <td className="px-3 py-2 border">
                              {item.la_thanh_phan_con ? (
                                <span className="font-medium text-purple-700 pl-4">
                                  ↳ {item.ma_hang}
                                </span>
                              ) : (
                                <LinkedFieldV2
                                  value={item.ma_hang}
                                  module="products"
                                  id={item.thanh_pham_id}
                                  onOpen={(id) => {
                                    setSelectedProductId(id);
                                    setShowProductDetailModal(true);
                                  }}
                                />
                              )}
                            </td>
                            <td className="px-3 py-2">{item.ten_san_pham}</td>
                            <td className="px-3 py-2 text-center text-xs">{item.ktpo}</td>
                            <td className="px-3 py-2 text-center text-xs">{item.ktsx}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {item.song}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-xs">{item.dvt}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {item.kieu || '-'}
                              </span>
                            </td>
                            
                            {/* Giá */}
                            <td className="px-3 py-2 text-right border">
                              {parseFloat(item.don_gia).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-2 border">
                              <input
                                ref={el => quantityInputRefs.current[item.id] = el}
                                type="number"
                                value={item.so_luong}
                                onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-right"
                                min="0"
                                placeholder="0"
                                disabled={item.la_thanh_phan_con}
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-green-600 border">
                              {item.thanh_tien.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-2 border ">
                              <input
                                type="text"
                                value={item.sai_lech_so_luong || ''}
                                onChange={(e) => {
                                  setForm({
                                    ...form,
                                    chi_tiet: form.chi_tiet.map(i => 
                                      i.id === item.id 
                                        ? { ...i, sai_lech_so_luong: e.target.value }
                                        : i
                                    )
                                  });
                                }}
                                className="w-24 px-2 py-1 border rounded text-center"
                                placeholder="+/-"
                              />
                            </td>
                            <td className="px-3 py-2 text-right text-xs">
                              {item.hoa_hong_co_dinh ? item.hoa_hong_co_dinh.toLocaleString('vi-VN') : '-'}
                            </td>
                            <td className="px-3 py-2 text-right text-xs ">
                              {item.hoa_hong_phan_tram ? `${item.hoa_hong_phan_tram}%` : '-'}
                            </td>
                            
                            {/* 13 công đoạn */}
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.xa || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border">
                              {item.cong_doan?.ma_phim ? (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  {item.cong_doan.ma_phim}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.so_mau || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.in || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.boi || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.can_mang || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border">
                              {item.cong_doan?.ma_khuon ? (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                  {item.cong_doan.ma_khuon}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.be || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.chap || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.dong || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.dan || '-'}
                            </td>
                            <td className="px-3 py-2 text-center border text-xs">
                              {item.cong_doan?.khac || '-'}
                            </td>
                            <td className="px-3 py-2 text-left border text-xs ">
                              {item.cong_doan?.khac_ghi_chu || '-'}
                            </td>
                            
                            {/* Ghi chú & Actions */}
                            <td className="px-3 py-2 text-xs">
                              {item.ghi_chu || '-'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => handleShowQR(form.so_don_hang, item.ma_hang)}
                                className="p-1 text-green-600 hover:border rounded"
                                title="Xem QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title={item.la_thanh_phan_con ? 'Không thể xóa con riêng lẻ' : 'Xóa'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2">
                        <tr>
                          <td colSpan="9" className="px-3 py-3 text-right font-bold">
                            Tổng tiền:
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-green-600 text-lg">
                            {form.chi_tiet.reduce((sum, item) => sum + item.thanh_tien, 0).toLocaleString('vi-VN')}đ
                          </td>
                          <td colSpan="19"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white border rounded-lg">
                    Chưa có sản phẩm. Nhấn "Thêm sản phẩm" để bắt đầu.
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú đơn hàng</label>
                <TextArea
                  value={form.ghi_chu}
                  onChange={(value) => setForm({ ...form, ghi_chu: value })}
                  placeholder="Ghi chú về đơn hàng..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {editingOrder ? 'Cập nhật' : 'Tạo đơn hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal - CHỈ MẸ */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Chọn sản phẩm (Mẹ + Con tự động)</h3>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setProductSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm mã hàng, tên sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  autoFocus
                />
              </div>

              <div className="overflow-y-auto max-h-96 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Mã hàng</th>
                      <th className="px-3 py-2 text-left font-semibold">Tên sản phẩm</th>
                      <th className="px-3 py-2 text-center font-semibold">KTSX</th>
                      <th className="px-3 py-2 text-center font-semibold">Sóng</th>
                      <th className="px-3 py-2 text-right font-semibold">Đơn giá</th>
                      <th className="px-3 py-2 text-center font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts.map(product => {
                      const alreadyAdded = form.chi_tiet.some(item => 
                        item.thanh_pham_id === product.id && !item.la_thanh_phan_con
                      );

                      const ktsx = (product.sx_dai || product.sx_rong || product.sx_cao)
                        ? `${product.sx_dai || product.po_dai}×${product.sx_rong || product.po_rong}${product.sx_cao || product.po_cao ? '×' + (product.sx_cao || product.po_cao) : ''}`
                        : (product.po_cao ? `${product.po_dai}×${product.po_rong}×${product.po_cao}` : `${product.po_dai}×${product.po_rong}`);

                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <span className="font-medium text-blue-600">
                              {product.ma_hang}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div>
                              {product.ten_san_pham}
                              {product.co_thanh_phan_con && product.thanh_phan_con?.length > 0 && (
                                <span className="text-xs text-purple-600 ml-2">
                                  ({product.thanh_phan_con.length} con)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center text-xs">{ktsx}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {product.song || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {(product.don_gia || 0).toLocaleString('vi-VN')}đ
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => handleAddProduct(product)}
                              disabled={alreadyAdded}
                              className={`px-3 py-1 rounded text-sm ${
                                alreadyAdded
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {alreadyAdded ? 'Đã thêm' : 'Chọn'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">QR Code</h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQRData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="bg-gray-100 p-8 rounded-lg mb-4">
                <QrCode className="w-48 h-48 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-4">
                  🔮 QR Code sẽ được tạo ở đây
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-bold text-lg font-mono text-blue-600">
                  {qrData.code}
                </p>
                <p className="text-gray-600">
                  Đơn hàng: <span className="font-medium">{qrData.soDonHang}</span>
                </p>
                <p className="text-gray-600">
                  Mã hàng: <span className="font-medium">{qrData.maHang}</span>
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => alert('Tính năng in QR - Làm sau')}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  In QR
                </button>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setQRData(null);
                  }}
                  className="flex-1 border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Đầy đủ */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Chi tiết đơn hàng: {selectedOrder.so_don_hang}</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Thông tin đơn hàng */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Khách hàng</p>
                  <p className="font-bold text-lg">
                    {getCustomerCode(selectedOrder.khach_hang_id, customers)} - {getCustomerName(selectedOrder.khach_hang_id, customers)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng tiền</p>
                  <p className="font-bold text-2xl text-green-600">
                    {selectedOrder.tong_tien.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.ngay_dat).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày giao dự kiến</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.ngay_giao_du_kien).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Bảng sản phẩm - ĐẦY ĐỦ 27 CỘT */}
              <div>
                <h4 className="font-bold text-lg mb-3">Danh sách sản phẩm</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {/* Thông tin cơ bản */}
                        <th className="px-3 py-2 text-left font-semibold border">Mã hàng</th>
                        <th className="px-3 py-2 text-left font-semibold border">Tên SP</th>
                        <th className="px-3 py-2 text-center font-semibold border">KTPO</th>
                        <th className="px-3 py-2 text-center font-semibold border">KTSX</th>
                        <th className="px-3 py-2 text-center font-semibold border">Sóng</th>
                        <th className="px-3 py-2 text-center font-semibold border">ĐVT</th>
                        <th className="px-3 py-2 text-center font-semibold border">Kiểu</th>
                        
                        {/* Giá */}
                        <th className="px-3 py-2 text-right font-semibold border">Đơn giá</th>
                        <th className="px-3 py-2 text-center font-semibold border">SL</th>
                        <th className="px-3 py-2 text-right font-semibold border">Thành tiền</th>
                        <th className="px-3 py-2 text-center font-semibold border">+/-</th>
                        <th className="px-3 py-2 text-right font-semibold border">HH cố định</th>
                        <th className="px-3 py-2 text-right font-semibold border">HH %</th>
                        
                        {/* 13 công đoạn */}
                        <th className="px-3 py-2 text-center font-semibold border">Xả</th>
                        <th className="px-3 py-2 text-center font-semibold border">Mã phim</th>
                        <th className="px-3 py-2 text-center font-semibold border">Số màu</th>
                        <th className="px-3 py-2 text-center font-semibold border">In</th>
                        <th className="px-3 py-2 text-center font-semibold border">Bồi</th>
                        <th className="px-3 py-2 text-center font-semibold border">Cán màng</th>
                        <th className="px-3 py-2 text-center font-semibold border">Mã khuôn</th>
                        <th className="px-3 py-2 text-center font-semibold border">Bế</th>
                        <th className="px-3 py-2 text-center font-semibold border">Chạp</th>
                        <th className="px-3 py-2 text-center font-semibold border">Đóng</th>
                        <th className="px-3 py-2 text-center font-semibold border">Dán</th>
                        <th className="px-3 py-2 text-center font-semibold border">Khác</th>
                        <th className="px-3 py-2 text-left font-semibold border">Ghi chú Khác</th>
                        
                        {/* Ghi chú & QR */}
                        <th className="px-3 py-2 text-left font-semibold border">Ghi chú</th>
                        <th className="px-3 py-2 text-center font-semibold border">QR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.chi_tiet.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {/* ============================================
                              LINKEDFIELD V2 - MODAL DETAIL
                              Click Mã hàng → Mở ProductModal
                              ============================================ */}
                          <td className="px-3 py-2 border">
                            {item.la_thanh_phan_con ? (
                              <span className="font-medium text-purple-700 pl-4">
                                ↳ {item.ma_hang}
                              </span>
                            ) : (
                              <LinkedFieldV2
                                value={item.ma_hang}
                                module="products"
                                id={item.thanh_pham_id}
                                onOpen={(id) => {
                                  setSelectedProductId(id);
                                  setShowProductDetailModal(true);
                                }}
                              />
                            )}
                          </td>
                          <td className="px-3 py-2 border">{item.ten_san_pham}</td>
                          <td className="px-3 py-2 text-center text-xs border">{item.ktpo || '-'}</td>
                          <td className="px-3 py-2 text-center text-xs border">{item.ktsx}</td>
                          <td className="px-3 py-2 text-center border">
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                              {item.song}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">{item.dvt || '-'}</td>
                          <td className="px-3 py-2 text-center border">
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                              {item.kieu || '-'}
                            </span>
                          </td>
                          
                          {/* Giá */}
                          <td className="px-3 py-2 text-right border">
                            {parseFloat(item.don_gia).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-3 py-2 text-right font-medium border">
                            {item.so_luong.toLocaleString('vi-VN')}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-green-600 border">
                            {item.thanh_tien.toLocaleString('vi-VN')}
                          </td>
                          <td className="px-3 py-2 text-center border">
                            {item.sai_lech_so_luong || '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-xs border">
                            {item.hoa_hong_co_dinh ? item.hoa_hong_co_dinh.toLocaleString('vi-VN') : '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-xs border">
                            {item.hoa_hong_phan_tram ? `${item.hoa_hong_phan_tram}%` : '-'}
                          </td>
                          
                          {/* 13 công đoạn */}
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.xa || '-'}
                          </td>
                          <td className="px-3 py-2 text-center border">
                            {item.cong_doan?.ma_phim || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.so_mau || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.in || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.boi || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.can_mang || '-'}
                          </td>
                          <td className="px-3 py-2 text-center border">
                            {item.cong_doan?.ma_khuon || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.be || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.chap || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.dong || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.dan || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs border">
                            {item.cong_doan?.khac || '-'}
                          </td>
                          <td className="px-3 py-2 text-left text-xs border">
                            {item.cong_doan?.khac_ghi_chu || '-'}
                          </td>
                          
                          {/* Ghi chú & QR */}
                          <td className="px-3 py-2 text-xs border">
                            {item.ghi_chu || '-'}
                          </td>
                          <td className="px-3 py-2 text-center border">
                            <button
                              onClick={() => handleShowQR(selectedOrder.so_don_hang, item.ma_hang)}
                              className="p-1 text-green-600 hover:border rounded"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan="9" className="px-3 py-3 text-right font-bold">
                          Tổng cộng:
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-green-600 text-lg">
                          {selectedOrder.tong_tien.toLocaleString('vi-VN')}đ
                        </td>
                        <td colSpan="18"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Ghi chú */}
              {selectedOrder.ghi_chu && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Ghi chú:</p>
                  <p className="text-gray-600">{selectedOrder.ghi_chu}</p>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedOrder);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Sửa
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

      {/* ============================================
          PRODUCT MODAL - Xem/Sửa Thành phẩm
          ============================================ */}
      {showProductDetailModal && (
        <ProductModal
          productId={selectedProductId}
          mode="view"
          onSave={(updatedProduct) => {
            // Refresh products
            refreshData();
            
            // Refresh current order nếu đang edit
            if (editingOrder) {
              const orders = loadOrders();
              const current = orders.find(o => o.id === editingOrder.id);
              if (current) {
                setForm(JSON.parse(JSON.stringify(current)));
              }
            }
            
            alert('✅ Đã cập nhật Thành phẩm!');
          }}
          onClose={() => {
            setShowProductDetailModal(false);
            setSelectedProductId(null);
          }}
        />
      )}

      {/* ============================================
          CUSTOMER MODAL - Xem/Sửa Khách hàng
          ============================================ */}
      {showCustomerDetailModal && (
        <CustomerModal
          customerId={selectedCustomerId}
          mode="view"
          onSave={(updatedCustomer) => {
            // Refresh customers
            refreshData();
            alert('✅ Đã cập nhật Khách hàng!');
          }}
          onClose={() => {
            setShowCustomerDetailModal(false);
            setSelectedCustomerId(null);
          }}
        />
      )}

    </div>
  );
}

export default SalesOrder;
