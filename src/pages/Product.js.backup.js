import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Copy, Eye, Download, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import TextInput from '../components/TextInput';
import TextArea from '../components/TextArea';
import FileUpload from '../components/FileUpload';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Danh sách công đoạn cố định
const CONG_DOAN_MAC_DINH = [
  { ma: 'ma_phim', ten: 'Mã phim', type: 'text', placeholder: 'Mã hóa phim in' },
  { ma: 'so_mau', ten: 'Số màu', type: 'number', placeholder: 'Số màu in' },
  { ma: 'in', ten: 'In', type: 'number', placeholder: 'Định mức (cái/h)' },
  { ma: 'boi', ten: 'Bồi', type: 'number', placeholder: 'Định mức (cái/h)' },
  { ma: 'can_mang', ten: 'Cán màng', type: 'number', placeholder: 'Định mức (cái/h)' },
  { ma: 'ma_khuon', ten: 'Mã khuôn', type: 'text', placeholder: 'Mã khuôn bế' },
  { ma: 'be', ten: 'Bế', type: 'number', placeholder: 'Định mức (cái/h)' },
  { ma: 'chap', ten: 'Chạp', type: 'number', placeholder: 'Định mức (cái/h)' },
  { ma: 'dong', ten: 'Đóng', type: 'number', placeholder: 'Định mức (cái/h)' },
  { ma: 'dan', ten: 'Dán', type: 'number', placeholder: 'Định mức (cái/h)' },
  { ma: 'khac', ten: 'Khác', type: 'number', placeholder: 'Định mức (cái/h)' }
];

function Product() {
  const loadProducts = () => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [];
  };

  const loadCustomers = () => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  };

  const [products, setProducts] = useState(loadProducts);
  const [customers] = useState(loadCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState({
    ma_hang: '',
    ten_san_pham: '',
    khach_hang_id: '',
    po_dai: '',
    po_rong: '',
    po_cao: '',
    sx_dai: '',
    sx_rong: '',
    sx_cao: '',
    song: 'B',
    dvt: 'Cái',
    don_gia: '',
    hoa_hong_co_dinh: '',
    hoa_hong_phan_tram: '',
    cho_phep_sai_lech: false,
    sai_lech_so_luong: '',
    sai_lech_phan_tram: '',
    cong_doan: {
      ma_phim: '',
      ma_phim_file: null,
      so_mau: '',
      in: '',
      boi: '',
      can_mang: '',
      ma_khuon: '',
      ma_khuon_file: null,
      be: '',
      chap: '',
      dong: '',
      dan: '',
      khac: ''
    },
    co_thanh_phan_con: false,
    thanh_phan_con: [],
    kieu: '',
    ghi_chu: ''
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // File upload handlers
  const handleMaPhimFileChange = (fileData) => {
    setForm({
      ...form,
      cong_doan: {
        ...form.cong_doan,
        ma_phim_file: fileData
      }
    });
  };

  const handleMaPhimFileRemove = () => {
    setForm({
      ...form,
      cong_doan: {
        ...form.cong_doan,
        ma_phim_file: null
      }
    });
  };

  const handleMaKhuonFileChange = (fileData) => {
    setForm({
      ...form,
      cong_doan: {
        ...form.cong_doan,
        ma_khuon_file: fileData
      }
    });
  };

  const handleMaKhuonFileRemove = () => {
    setForm({
      ...form,
      cong_doan: {
        ...form.cong_doan,
        ma_khuon_file: null
      }
    });
  };

  const getKTSXThucTe = (product) => {
    const dai = product.sx_dai || product.po_dai;
    const rong = product.sx_rong || product.po_rong;
    const cao = product.sx_cao || product.po_cao;
    
    return {
      dai,
      rong,
      cao,
      display: cao ? `${dai}×${rong}×${cao}` : `${dai}×${rong}`
    };
  };

  const generateMaHangCon = (maME, index) => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return `${maME}-${letters[index]}`;
  };

  const handleSubmit = () => {
    if (!form.ma_hang.trim() || !form.ten_san_pham.trim() || !form.khach_hang_id) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (!form.po_dai || !form.po_rong) {
      alert('Vui lòng nhập ít nhất Dài và Rộng!');
      return;
    }

    if (form.co_thanh_phan_con && form.thanh_phan_con.length === 0) {
      alert('Vui lòng thêm ít nhất 1 thành phần con!');
      return;
    }

    // Validate thành phần con
    if (form.co_thanh_phan_con) {
      for (let i = 0; i < form.thanh_phan_con.length; i++) {
        const con = form.thanh_phan_con[i];
        if (!con.ten || !con.so_luong || !con.po_dai || !con.po_rong) {
          alert(`Thành phần con ${i + 1}: Vui lòng điền Tên, SL, Dài, Rộng!`);
          return;
        }
      }
    }

    const existingCode = products.find(p => 
      p.ma_hang.toUpperCase() === form.ma_hang.toUpperCase().trim() && 
      (!editingProduct || p.id !== editingProduct.id)
    );

    if (existingCode) {
      alert('Mã hàng đã tồn tại!');
      return;
    }

    const productData = {
      ma_hang: form.ma_hang.toUpperCase().trim(),
      ten_san_pham: form.ten_san_pham.trim(),
      khach_hang_id: form.khach_hang_id,
      po_dai: parseFloat(form.po_dai),
      po_rong: parseFloat(form.po_rong),
      po_cao: parseFloat(form.po_cao),
      sx_dai: form.sx_dai ? parseFloat(form.sx_dai) : null,
      sx_rong: form.sx_rong ? parseFloat(form.sx_rong) : null,
      sx_cao: form.sx_cao ? parseFloat(form.sx_cao) : null,
      song: form.song,
      dvt: form.dvt,
      don_gia: parseFloat(form.don_gia) || 0,
      hoa_hong_co_dinh: parseFloat(form.hoa_hong_co_dinh) || 0,
      hoa_hong_phan_tram: parseFloat(form.hoa_hong_phan_tram) || 0,
      cho_phep_sai_lech: form.cho_phep_sai_lech,
      sai_lech_so_luong: parseFloat(form.sai_lech_so_luong) || 0,
      sai_lech_phan_tram: parseFloat(form.sai_lech_phan_tram) || 0,
      cong_doan: form.cong_doan,
      co_thanh_phan_con: form.co_thanh_phan_con,
      thanh_phan_con: form.co_thanh_phan_con ? form.thanh_phan_con.map((con, index) => ({
        ma_hang_con: generateMaHangCon(form.ma_hang.toUpperCase().trim(), index),
        ten: con.ten.trim(),
        so_luong: parseInt(con.so_luong),
        po_dai: parseFloat(con.po_dai),
        po_rong: parseFloat(con.po_rong),
        po_cao: parseFloat(con.po_cao),
        sx_dai: con.sx_dai ? parseFloat(con.sx_dai) : null,
        sx_rong: con.sx_rong ? parseFloat(con.sx_rong) : null,
        sx_cao: con.sx_cao ? parseFloat(con.sx_cao) : null,
        cong_doan: con.cong_doan || {}
      })) : [],
      kieu: form.kieu,
      ghi_chu: form.ghi_chu.trim()
    };

    if (editingProduct) {
      setProducts(products.map(p =>
        p.id === editingProduct.id ? { ...p, ...productData } : p
      ));
      alert('Đã cập nhật thành phẩm!');
    } else {
      const newProduct = {
        id: Date.now(),
        ...productData,
        trang_thai: 'active',
        ngay_tao: new Date().toISOString()
      };
      setProducts([...products, newProduct]);
      alert('Đã thêm thành phẩm!');
    }

    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      ma_hang: '',
      ten_san_pham: '',
      khach_hang_id: '',
      po_dai: '',
      po_rong: '',
      po_cao: '',
      sx_dai: '',
      sx_rong: '',
      sx_cao: '',
      song: 'B',
      dvt: 'Cái',
      don_gia: '',
      hoa_hong_co_dinh: '',
      hoa_hong_phan_tram: '',
      cho_phep_sai_lech: false,
      sai_lech_so_luong: '',
      sai_lech_phan_tram: '',
      cong_doan: {
        ma_phim: '',
        ma_phim_file: null,
        so_mau: '',
        in: '',
        boi: '',
        can_mang: '',
        ma_khuon: '',
        ma_khuon_file: null,
        be: '',
        chap: '',
        dong: '',
        dan: '',
        khac: ''
      },
      co_thanh_phan_con: false,
      thanh_phan_con: [],
      kieu: '',
      ghi_chu: ''
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      ma_hang: product.ma_hang,
      ten_san_pham: product.ten_san_pham,
      khach_hang_id: product.khach_hang_id,
      po_dai: product.po_dai || '',
      po_rong: product.po_rong || '',
      po_cao: product.po_cao || '',
      sx_dai: product.sx_dai || '',
      sx_rong: product.sx_rong || '',
      sx_cao: product.sx_cao || '',
      song: product.song,
      dvt: product.dvt,
      don_gia: product.don_gia,
      hoa_hong_co_dinh: product.hoa_hong_co_dinh,
      hoa_hong_phan_tram: product.hoa_hong_phan_tram,
      cho_phep_sai_lech: product.cho_phep_sai_lech,
      sai_lech_so_luong: product.sai_lech_so_luong || '',
      sai_lech_phan_tram: product.sai_lech_phan_tram || '',
      cong_doan: product.cong_doan || {
        ma_phim: '',
        ma_phim_file: null,
        so_mau: '',
        in: '',
        boi: '',
        can_mang: '',
        ma_khuon: '',
        ma_khuon_file: null,
        be: '',
        chap: '',
        dong: '',
        dan: '',
        khac: ''
      },
      co_thanh_phan_con: product.co_thanh_phan_con || false,
      thanh_phan_con: product.thanh_phan_con || [],
      kieu: product.kieu || '',
      ghi_chu: product.ghi_chu || ''
    });
    setShowModal(true);
  };

  const handleDelete = (product) => {
    if (window.confirm(`Xóa thành phẩm "${product.ten_san_pham}"?`)) {
      setProducts(products.filter(p => p.id !== product.id));
    }
  };

  const handleDuplicate = (product) => {
    setEditingProduct(null);
    setForm({
      ma_hang: product.ma_hang + '-COPY',
      ten_san_pham: product.ten_san_pham + ' (Copy)',
      khach_hang_id: product.khach_hang_id,
      po_dai: product.po_dai || '',
      po_rong: product.po_rong || '',
      po_cao: product.po_cao || '',
      sx_dai: product.sx_dai || '',
      sx_rong: product.sx_rong || '',
      sx_cao: product.sx_cao || '',
      song: product.song,
      dvt: product.dvt,
      don_gia: product.don_gia,
      hoa_hong_co_dinh: product.hoa_hong_co_dinh,
      hoa_hong_phan_tram: product.hoa_hong_phan_tram,
      cho_phep_sai_lech: product.cho_phep_sai_lech,
      sai_lech_so_luong: product.sai_lech_so_luong || '',
      sai_lech_phan_tram: product.sai_lech_phan_tram || '',
      cong_doan: product.cong_doan || {},
      co_thanh_phan_con: product.co_thanh_phan_con || false,
      thanh_phan_con: product.thanh_phan_con || [],
      kieu: product.kieu || '',
      ghi_chu: product.ghi_chu || ''
    });
    setShowModal(true);
  };

  const handleExportExcel = () => {
    if (products.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const data = products.map(p => {
      const ktsx = getKTSXThucTe(p);
      const customer = customers.find(c => c.id === p.khach_hang_id);
      return {
        'Mã hàng': p.ma_hang,
        'Tên sản phẩm': p.ten_san_pham,
        'Khách hàng': customer ? customer.name : '',
        'Có con': p.co_thanh_phan_con ? 'Có' : 'Không',
        'Số con': p.thanh_phan_con?.length || 0,
        'KTSX': ktsx.display,
        'Đơn giá': p.don_gia,
        'Ghi chú': p.ghi_chu
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thành phẩm');
    XLSX.writeFile(wb, 'Danh-muc-thanh-pham.xlsx');
  };

  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const customer = customers.find(c => c.id === p.khach_hang_id);
    const searchableFields = [
      p.ma_hang,
      p.ten_san_pham,
      customer ? customer.name : '',
      p.ghi_chu || ''
    ];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.ma_hang.localeCompare(b.ma_hang));

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'N/A';
  };

  const addThanhPhanCon = () => {
    setForm({
      ...form,
      thanh_phan_con: [...form.thanh_phan_con, {
        ten: '',
        so_luong: 1,
        po_dai: '',
        po_rong: '',
        po_cao: '',
        sx_dai: '',
        sx_rong: '',
        sx_cao: '',
        cong_doan: {}
      }]
    });
  };

  const removeThanhPhanCon = (index) => {
    setForm({
      ...form,
      thanh_phan_con: form.thanh_phan_con.filter((_, i) => i !== index)
    });
  };

  const updateThanhPhanCon = (index, field, value) => {
    const newCon = [...form.thanh_phan_con];
    newCon[index] = { ...newCon[index], [field]: value };
    setForm({ ...form, thanh_phan_con: newCon });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thành phẩm</h1>
          <p className="text-gray-600">Quản lý danh mục sản phẩm (Mẹ + Con)</p>
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
              setEditingProduct(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />Thêm thành phẩm
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
              placeholder="Mã hàng, tên sản phẩm, khách hàng..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Có con</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">KTSX</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mã phim</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mã khuôn</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map(product => {
                const ktsx = getKTSXThucTe(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-bold text-blue-600">{product.ma_hang}</td>
                    <td className="px-4 py-4 text-sm font-medium">{product.ten_san_pham}</td>
                    <td className="px-4 py-4 text-sm">{getCustomerName(product.khach_hang_id)}</td>
                    <td className="px-4 py-4 text-center">
                      {product.co_thanh_phan_con ? (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                          {product.thanh_phan_con.length} con
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {ktsx.display}
                      </span>
                    </td>
                    
                    {/* Mã phim */}
                    <td className="px-4 py-4 text-sm text-center">
                      {product.cong_doan?.ma_phim ? (
                        product.cong_doan.ma_phim_file ? (
                          <a
                            href={product.cong_doan.ma_phim_file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            title="Click để xem file"
                          >
                            📄 {product.cong_doan.ma_phim}
                          </a>
                        ) : (
                          <span className="text-gray-600">{product.cong_doan.ma_phim}</span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    {/* Mã khuôn */}
                    <td className="px-4 py-4 text-sm text-center">
                      {product.cong_doan?.ma_khuon ? (
                        product.cong_doan.ma_khuon_file ? (
                          <a
                            href={product.cong_doan.ma_khuon_file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            title="Click để xem file"
                          >
                            📄 {product.cong_doan.ma_khuon}
                          </a>
                        ) : (
                          <span className="text-gray-600">{product.cong_doan.ma_khuon}</span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 text-sm text-right font-medium text-green-600">
                      {product.don_gia.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Nhân bản"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
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
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 rounded-t-xl">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Sửa thành phẩm' : 'Thêm thành phẩm'}
              </h2>
            </div>
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mã hàng mẹ *</label>
                  <input
                    type="text"
                    value={form.ma_hang}
                    onChange={(e) => setForm({ ...form, ma_hang: e.target.value.toUpperCase() })}
                    placeholder="VD: A1"
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tên sản phẩm (Thùng) *</label>
                  <TextInput
                    value={form.ten_san_pham}
                    onChange={(value) => setForm({ ...form, ten_san_pham: value })}
                    placeholder="VD: Thùng A1"
                    className="w-full px-4 py-2 border rounded-lg"
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
              </div>

              {/* Thông tin thùng mẹ */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold mb-4 text-blue-900">Thông tin Thùng (Mẹ)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Kích thước PO (Cao tùy chọn) *</label>
                    <div className="grid grid-cols-5 gap-2">
                      <input
                        type="number"
                        value={form.po_dai}
                        onChange={(e) => setForm({ ...form, po_dai: e.target.value })}
                        placeholder="Dài *"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={form.po_rong}
                        onChange={(e) => setForm({ ...form, po_rong: e.target.value })}
                        placeholder="Rộng *"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={form.po_cao}
                        onChange={(e) => setForm({ ...form, po_cao: e.target.value })}
                        placeholder="Cao"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <select
                        value={form.song}
                        onChange={(e) => setForm({ ...form, song: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="E">E</option>
                      </select>
                      <TextInput
                        value={form.dvt}
                        onChange={(value) => setForm({ ...form, dvt: value })}
                        placeholder="ĐVT"
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">💡 Cao có thể để trống (VD: Lót chỉ cần Dài×Rộng)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Kích thước SX (Để trống nếu giống PO)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={form.sx_dai}
                        onChange={(e) => setForm({ ...form, sx_dai: e.target.value })}
                        placeholder="Dài"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={form.sx_rong}
                        onChange={(e) => setForm({ ...form, sx_rong: e.target.value })}
                        placeholder="Rộng"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={form.sx_cao}
                        onChange={(e) => setForm({ ...form, sx_cao: e.target.value })}
                        placeholder="Cao"
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Đơn giá (cả bộ)</label>
                      <input
                        type="number"
                        value={form.don_gia}
                        onChange={(e) => setForm({ ...form, don_gia: e.target.value })}
                        placeholder="14,500"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">HH cố định (đ/bộ)</label>
                      <input
                        type="number"
                        value={form.hoa_hong_co_dinh}
                        onChange={(e) => setForm({ ...form, hoa_hong_co_dinh: e.target.value })}
                        placeholder="1000"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">HH % (%)</label>
                      <input
                        type="number"
                        value={form.hoa_hong_phan_tram}
                        onChange={(e) => setForm({ ...form, hoa_hong_phan_tram: e.target.value })}
                        placeholder="2"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Công đoạn (Thùng)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Mã phim + Upload */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="w-28 text-sm font-medium">Mã phim:</label>
                          <TextInput
                            value={form.cong_doan.ma_phim || ''}
                            onChange={(value) => setForm({
                              ...form,
                              cong_doan: { ...form.cong_doan, ma_phim: value }
                            })}
                            placeholder="VD: C5"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <FileUpload
                          label="File thiết kế (PDF/Ảnh)"
                          currentFile={form.cong_doan.ma_phim_file}
                          onFileChange={handleMaPhimFileChange}
                          onFileRemove={handleMaPhimFileRemove}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                      </div>

                      {/* Số màu */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Số màu:</label>
                        <input
                          type="number"
                          value={form.cong_doan.so_mau || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, so_mau: e.target.value }
                          })}
                          placeholder="VD: 4"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* In */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">In:</label>
                        <input
                          type="number"
                          value={form.cong_doan.in || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, in: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Bồi */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Bồi:</label>
                        <input
                          type="number"
                          value={form.cong_doan.boi || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, boi: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Cán màng */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Cán màng:</label>
                        <input
                          type="number"
                          value={form.cong_doan.can_mang || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, can_mang: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Mã khuôn + Upload */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="w-28 text-sm font-medium">Mã khuôn:</label>
                          <TextInput
                            value={form.cong_doan.ma_khuon || ''}
                            onChange={(value) => setForm({
                              ...form,
                              cong_doan: { ...form.cong_doan, ma_khuon: value }
                            })}
                            placeholder="VD: K100"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <FileUpload
                          label="File thiết kế (PDF/Ảnh)"
                          currentFile={form.cong_doan.ma_khuon_file}
                          onFileChange={handleMaKhuonFileChange}
                          onFileRemove={handleMaKhuonFileRemove}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                      </div>

                      {/* Bế */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Bế:</label>
                        <input
                          type="number"
                          value={form.cong_doan.be || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, be: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Chạp */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Chạp:</label>
                        <input
                          type="number"
                          value={form.cong_doan.chap || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, chap: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Đóng */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Đóng:</label>
                        <input
                          type="number"
                          value={form.cong_doan.dong || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, dong: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Dán */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Dán:</label>
                        <input
                          type="number"
                          value={form.cong_doan.dan || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, dan: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      {/* Khác */}
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-sm font-medium">Khác:</label>
                        <input
                          type="number"
                          value={form.cong_doan.khac || ''}
                          onChange={(e) => setForm({
                            ...form,
                            cong_doan: { ...form.cong_doan, khac: e.target.value }
                          })}
                          placeholder="Định mức (cái/h)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thành phần con */}
              <div className="border rounded-lg p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="co_thanh_phan_con"
                      checked={form.co_thanh_phan_con}
                      onChange={(e) => setForm({ ...form, co_thanh_phan_con: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="co_thanh_phan_con" className="font-bold text-purple-900">
                      Có thành phần con (Lót, Khay...)
                    </label>
                  </div>
                  {form.co_thanh_phan_con && (
                    <button
                      onClick={addThanhPhanCon}
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />Thêm con
                    </button>
                  )}
                </div>

                {form.co_thanh_phan_con && (
                  <div className="space-y-4">
                    {form.thanh_phan_con.map((con, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-purple-900">
                            Con {index + 1}: {form.ma_hang ? generateMaHangCon(form.ma_hang, index) : '(Nhập mã mẹ trước)'}
                          </h4>
                          <button
                            onClick={() => removeThanhPhanCon(index)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Tên *</label>
                            <TextInput
                              value={con.ten}
                              onChange={(value) => updateThanhPhanCon(index, 'ten', value)}
                              placeholder="VD: Lót A1"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Số lượng/bộ *</label>
                            <input
                              type="number"
                              value={con.so_luong}
                              onChange={(e) => updateThanhPhanCon(index, 'so_luong', e.target.value)}
                              placeholder="2"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">PO: Dài × Rộng × Cao</label>
                            <div className="grid grid-cols-3 gap-1">
                              <input
                                type="number"
                                value={con.po_dai}
                                onChange={(e) => updateThanhPhanCon(index, 'po_dai', e.target.value)}
                                placeholder="Dài*"
                                className="px-2 py-2 border rounded text-sm"
                              />
                              <input
                                type="number"
                                value={con.po_rong}
                                onChange={(e) => updateThanhPhanCon(index, 'po_rong', e.target.value)}
                                placeholder="Rộng*"
                                className="px-2 py-2 border rounded text-sm"
                              />
                              <input
                                type="number"
                                value={con.po_cao}
                                onChange={(e) => updateThanhPhanCon(index, 'po_cao', e.target.value)}
                                placeholder="Cao"
                                className="px-2 py-2 border rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Công đoạn con */}
                        <div className="border-t pt-3">
                          <h5 className="text-xs font-medium mb-2 text-gray-700">Công đoạn (tùy chọn)</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {CONG_DOAN_MAC_DINH.map(cd => (
                              <div key={cd.ma} className="flex items-center gap-2">
                                <label className="w-20 text-xs">{cd.ten}:</label>
                                {cd.type === 'text' ? (
                                  <TextInput
                                    value={con.cong_doan?.[cd.ma] || ''}
                                    onChange={(value) => {
                                      const newCon = [...form.thanh_phan_con];
                                      newCon[index] = {
                                        ...newCon[index],
                                        cong_doan: { ...newCon[index].cong_doan, [cd.ma]: value }
                                      };
                                      setForm({ ...form, thanh_phan_con: newCon });
                                    }}
                                    placeholder={cd.placeholder}
                                    className="flex-1 px-2 py-1 border rounded text-xs"
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    value={con.cong_doan?.[cd.ma] || ''}
                                    onChange={(e) => {
                                      const newCon = [...form.thanh_phan_con];
                                      newCon[index] = {
                                        ...newCon[index],
                                        cong_doan: { ...newCon[index].cong_doan, [cd.ma]: e.target.value }
                                      };
                                      setForm({ ...form, thanh_phan_con: newCon });
                                    }}
                                    placeholder={cd.placeholder}
                                    className="flex-1 px-2 py-1 border rounded text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {form.thanh_phan_con.length > 0 && (
                      <div className="bg-blue-100 p-3 rounded-lg text-sm">
                        <p className="font-medium text-blue-900 mb-2">📊 Ví dụ: Đơn hàng 1000 bộ {form.ma_hang}</p>
                        <div className="space-y-1 text-blue-800">
                          <div>• {form.ma_hang || 'Mã mẹ'} (Thùng): 1000 cái</div>
                          {form.thanh_phan_con.map((con, idx) => (
                            <div key={idx}>
                              • {form.ma_hang ? generateMaHangCon(form.ma_hang, idx) : 'Mã con'} ({con.ten || 'Chưa đặt tên'}): 
                              {con.so_luong ? ` 1000 × ${con.so_luong} = ${1000 * parseInt(con.so_luong)} cái` : ' (Chưa nhập SL)'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Giao đủ */}
              <div className="border rounded-lg p-4 bg-orange-50">
                <h3 className="font-bold mb-3">Điều kiện giao hàng</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cho_phep_sai_lech"
                      checked={form.cho_phep_sai_lech}
                      onChange={(e) => setForm({ ...form, cho_phep_sai_lech: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="cho_phep_sai_lech" className="text-sm font-medium">
                      Cho phép sai lệch
                    </label>
                  </div>
                  {form.cho_phep_sai_lech && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <label className="block text-sm mb-2">Sai lệch ±(cái)</label>
                        <input
                          type="number"
                          value={form.sai_lech_so_luong}
                          onChange={(e) => setForm({ ...form, sai_lech_so_luong: e.target.value })}
                          placeholder="50"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Sai lệch ±(%)</label>
                        <input
                          type="number"
                          value={form.sai_lech_phan_tram}
                          onChange={(e) => setForm({ ...form, sai_lech_phan_tram: e.target.value })}
                          placeholder="5"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Khác */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kiểu</label>
                  <TextInput
                    value={form.kieu}
                    onChange={(value) => setForm({ ...form, kieu: value })}
                    placeholder="VD: A5"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ghi chú</label>
                  <TextArea
                    value={form.ghi_chu}
                    onChange={(value) => setForm({ ...form, ghi_chu: value })}
                    placeholder="Ghi chú..."
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="1"
                  />
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-xl">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
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
                {editingProduct ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 rounded-t-xl">
              <h2 className="text-xl font-bold">Chi tiết thành phẩm: {selectedProduct.ma_hang}</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Thông tin cơ bản */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold mb-3 text-gray-900">Thông tin cơ bản</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã hàng</p>
                    <p className="font-bold text-blue-600">{selectedProduct.ma_hang}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tên sản phẩm</p>
                    <p className="font-medium">{selectedProduct.ten_san_pham}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng</p>
                    <p className="font-medium">{getCustomerName(selectedProduct.khach_hang_id)}</p>
                  </div>
                </div>
              </div>

              {/* Kích thước */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold mb-3 text-blue-900">Kích thước (Mẹ)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Kích thước PO:</p>
                    <p className="font-mono text-lg">
                      {selectedProduct.po_dai} × {selectedProduct.po_rong}
                      {selectedProduct.po_cao ? ` × ${selectedProduct.po_cao}` : ''}
                    </p>
                    <p className="text-xs text-gray-600">Sóng: {selectedProduct.song} | ĐVT: {selectedProduct.dvt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Kích thước SX:</p>
                    {(selectedProduct.sx_dai || selectedProduct.sx_rong || selectedProduct.sx_cao) ? (
                      <p className="font-mono text-lg">
                        {selectedProduct.sx_dai || selectedProduct.po_dai} × {selectedProduct.sx_rong || selectedProduct.po_rong}
                        {(selectedProduct.sx_cao || selectedProduct.po_cao) ? ` × ${selectedProduct.sx_cao || selectedProduct.po_cao}` : ''}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Giống PO</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Giá & Hoa hồng */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-bold mb-3 text-green-900">Giá & Hoa hồng</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-700">Đơn giá</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedProduct.don_gia.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">HH cố định</p>
                    <p className="text-lg font-medium">
                      {selectedProduct.hoa_hong_co_dinh ? `${selectedProduct.hoa_hong_co_dinh.toLocaleString('vi-VN')} đ` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">HH phần trăm</p>
                    <p className="text-lg font-medium">
                      {selectedProduct.hoa_hong_phan_tram ? `${selectedProduct.hoa_hong_phan_tram}%` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Giao hàng */}
              {selectedProduct.cho_phep_sai_lech && (
                <div className="border rounded-lg p-4 bg-orange-50">
                  <h3 className="font-bold mb-3 text-orange-900">Điều kiện giao hàng</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded">Cho phép sai lệch</span>
                    {selectedProduct.sai_lech_so_luong > 0 && (
                      <span>±{selectedProduct.sai_lech_so_luong} cái</span>
                    )}
                    {selectedProduct.sai_lech_phan_tram > 0 && (
                      <span>±{selectedProduct.sai_lech_phan_tram}%</span>
                    )}
                  </div>
                </div>
              )}

              {/* Công đoạn Mẹ */}
              {selectedProduct.cong_doan && Object.keys(selectedProduct.cong_doan).length > 0 && (
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="font-bold mb-3 text-purple-900">Công đoạn (Mẹ)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {CONG_DOAN_MAC_DINH.map(cd => {
                      const value = selectedProduct.cong_doan[cd.ma];
                      if (!value) return null;
                      
                      return (
                        <div key={cd.ma} className="bg-white p-2 rounded border">
                          <p className="text-xs text-gray-600">{cd.ten}</p>
                          <p className="font-medium">{value}</p>
                          
                          {/* Link file Mã phim */}
                          {cd.ma === 'ma_phim' && selectedProduct.cong_doan.ma_phim_file && (
                            <a
                              href={selectedProduct.cong_doan.ma_phim_file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              📄 Xem file ({selectedProduct.cong_doan.ma_phim_file.type?.includes('image') ? 'Ảnh' : 'PDF'})
                            </a>
                          )}
                          
                          {/* Link file Mã khuôn */}
                          {cd.ma === 'ma_khuon' && selectedProduct.cong_doan.ma_khuon_file && (
                            <a
                              href={selectedProduct.cong_doan.ma_khuon_file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              📄 Xem file ({selectedProduct.cong_doan.ma_khuon_file.type?.includes('image') ? 'Ảnh' : 'PDF'})
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Thành phần con */}
              {selectedProduct.co_thanh_phan_con && selectedProduct.thanh_phan_con.length > 0 && (
                <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                  <h3 className="font-bold mb-4 text-purple-900 flex items-center gap-2">
                    <ChevronRight className="w-5 h-5" />
                    Thành phần con ({selectedProduct.thanh_phan_con.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedProduct.thanh_phan_con.map((con, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {con.ma_hang_con}
                          </span>
                          <span className="font-bold text-gray-900">{con.ten}</span>
                          <span className="ml-auto text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {con.so_luong} cái/bộ
                          </span>
                        </div>

                        {/* Kích thước con */}
                        <div className="mb-3 bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">Kích thước PO:</p>
                          <p className="font-mono text-sm">
                            {con.po_dai} × {con.po_rong}{con.po_cao ? ` × ${con.po_cao}` : ''}
                          </p>
                          {(con.sx_dai || con.sx_rong || con.sx_cao) && (
                            <>
                              <p className="text-xs text-gray-600 mb-1 mt-2">Kích thước SX:</p>
                              <p className="font-mono text-sm">
                                {con.sx_dai || con.po_dai} × {con.sx_rong || con.po_rong}
                                {(con.sx_cao || con.po_cao) ? ` × ${con.sx_cao || con.po_cao}` : ''}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Công đoạn con */}
                        {con.cong_doan && Object.keys(con.cong_doan).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-2">Công đoạn:</p>
                            <div className="grid grid-cols-4 gap-2">
                              {CONG_DOAN_MAC_DINH.map(cd => {
                                const value = con.cong_doan[cd.ma];
                                if (!value) return null;
                                return (
                                  <div key={cd.ma} className="bg-gray-50 p-2 rounded text-xs">
                                    <p className="text-gray-600">{cd.ten}</p>
                                    <p className="font-medium">{value}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thông tin khác */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold mb-3 text-gray-900">Thông tin khác</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProduct.kieu && (
                    <div>
                      <p className="text-sm text-gray-600">Kiểu</p>
                      <p className="font-medium">{selectedProduct.kieu}</p>
                    </div>
                  )}
                  {selectedProduct.ghi_chu && (
                    <div>
                      <p className="text-sm text-gray-600">Ghi chú</p>
                      <p className="font-medium">{selectedProduct.ghi_chu}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-medium">
                      {new Date(selectedProduct.ngay_tao).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <span className={`px-2 py-1 rounded text-sm ${
                      selectedProduct.trang_thai === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedProduct.trang_thai === 'active' ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedProduct);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Sửa
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
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

export default Product;
