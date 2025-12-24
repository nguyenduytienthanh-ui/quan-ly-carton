import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, History, Upload, Download, TrendingUp, Package } from 'lucide-react';
import * as XLSX from 'xlsx';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Material() {
  const loadMaterials = () => {
    const saved = localStorage.getItem('materials');
    return saved ? JSON.parse(saved) : [];
  };

  const loadPriceHistory = () => {
    const saved = localStorage.getItem('material_price_history');
    return saved ? JSON.parse(saved) : [];
  };

  const [materials, setMaterials] = useState(loadMaterials);
  const [priceHistory, setPriceHistory] = useState(loadPriceHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [form, setForm] = useState({
    ma: '',
    ten: '',
    dvt: '',
    gia_mua: '',
    gia_ban: '',
    ghi_chu: ''
  });

  const [priceForm, setPriceForm] = useState({
    loai: 'gia_mua',
    gia_moi: '',
    ngay_ap_dung: new Date().toISOString().slice(0, 10),
    ly_do: ''
  });

  useEffect(() => {
    localStorage.setItem('materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('material_price_history', JSON.stringify(priceHistory));
  }, [priceHistory]);

  const handleSubmit = () => {
    if (!form.ma.trim() || !form.ten.trim() || !form.dvt.trim()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    // Check duplicate code
    const existingCode = materials.find(m => 
      m.ma.toUpperCase() === form.ma.toUpperCase().trim() && 
      (!editingMaterial || m.id !== editingMaterial.id)
    );

    if (existingCode) {
      alert('Mã nguyên liệu đã tồn tại!');
      return;
    }

    if (editingMaterial) {
      // Check if price changed
      const oldMaterial = materials.find(m => m.id === editingMaterial.id);
      const gia_mua_moi = parseFloat(form.gia_mua) || 0;
      const gia_ban_moi = parseFloat(form.gia_ban) || 0;

      // Save price history if changed
      if (oldMaterial.gia_mua_hien_tai !== gia_mua_moi && gia_mua_moi > 0) {
        const historyRecord = {
          id: Date.now(),
          nguyen_lieu_id: editingMaterial.id,
          nguyen_lieu_ma: form.ma.toUpperCase().trim(),
          nguyen_lieu_ten: form.ten.trim(),
          loai: 'gia_mua',
          gia_cu: oldMaterial.gia_mua_hien_tai,
          gia_moi: gia_mua_moi,
          ngay_ap_dung: new Date().toISOString().slice(0, 10),
          ly_do: 'Cập nhật giá',
          nguoi_tao: 'Admin',
          ngay_tao: new Date().toISOString()
        };
        setPriceHistory([...priceHistory, historyRecord]);
      }

      if (oldMaterial.gia_ban_hien_tai !== gia_ban_moi && gia_ban_moi > 0) {
        const historyRecord = {
          id: Date.now() + 1,
          nguyen_lieu_id: editingMaterial.id,
          nguyen_lieu_ma: form.ma.toUpperCase().trim(),
          nguyen_lieu_ten: form.ten.trim(),
          loai: 'gia_ban',
          gia_cu: oldMaterial.gia_ban_hien_tai,
          gia_moi: gia_ban_moi,
          ngay_ap_dung: new Date().toISOString().slice(0, 10),
          ly_do: 'Cập nhật giá',
          nguoi_tao: 'Admin',
          ngay_tao: new Date().toISOString()
        };
        setPriceHistory([...priceHistory, historyRecord]);
      }

      setMaterials(materials.map(m =>
        m.id === editingMaterial.id
          ? {
              ...m,
              ma: form.ma.toUpperCase().trim(),
              ten: form.ten.trim(),
              dvt: form.dvt.trim(),
              gia_mua_hien_tai: gia_mua_moi,
              gia_ban_hien_tai: gia_ban_moi,
              ghi_chu: form.ghi_chu.trim()
            }
          : m
      ));
      alert('Đã cập nhật nguyên liệu!');
    } else {
      const newMaterial = {
        id: Date.now(),
        ma: form.ma.toUpperCase().trim(),
        ten: form.ten.trim(),
        dvt: form.dvt.trim(),
        gia_mua_hien_tai: parseFloat(form.gia_mua) || 0,
        gia_ban_hien_tai: parseFloat(form.gia_ban) || 0,
        ghi_chu: form.ghi_chu.trim(),
        trang_thai: 'active',
        ngay_tao: new Date().toISOString()
      };

      // Save initial price history
      if (newMaterial.gia_mua_hien_tai > 0) {
        const historyRecord = {
          id: Date.now() + 1,
          nguyen_lieu_id: newMaterial.id,
          nguyen_lieu_ma: newMaterial.ma,
          nguyen_lieu_ten: newMaterial.ten,
          loai: 'gia_mua',
          gia_cu: 0,
          gia_moi: newMaterial.gia_mua_hien_tai,
          ngay_ap_dung: new Date().toISOString().slice(0, 10),
          ly_do: 'Giá khởi tạo',
          nguoi_tao: 'Admin',
          ngay_tao: new Date().toISOString()
        };
        setPriceHistory([...priceHistory, historyRecord]);
      }

      setMaterials([...materials, newMaterial]);
      alert('Đã thêm nguyên liệu!');
    }

    setShowModal(false);
    setEditingMaterial(null);
    setForm({ ma: '', ten: '', dvt: '', gia_mua: '', gia_ban: '', ghi_chu: '' });
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setForm({
      ma: material.ma,
      ten: material.ten,
      dvt: material.dvt,
      gia_mua: material.gia_mua_hien_tai || '',
      gia_ban: material.gia_ban_hien_tai || '',
      ghi_chu: material.ghi_chu || ''
    });
    setShowModal(true);
  };

  const handleDelete = (material) => {
    if (window.confirm(`Xóa nguyên liệu "${material.ten}"?`)) {
      setMaterials(materials.filter(m => m.id !== material.id));
      // Also delete price history
      setPriceHistory(priceHistory.filter(h => h.nguyen_lieu_id !== material.id));
    }
  };

  const handleUpdatePrice = () => {
    if (!selectedMaterial || !priceForm.gia_moi) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const gia_moi = parseFloat(priceForm.gia_moi);
    if (gia_moi <= 0) {
      alert('Giá phải lớn hơn 0!');
      return;
    }

    const gia_cu = priceForm.loai === 'gia_mua' 
      ? selectedMaterial.gia_mua_hien_tai 
      : selectedMaterial.gia_ban_hien_tai;

    if (gia_moi === gia_cu) {
      alert('Giá mới phải khác giá cũ!');
      return;
    }

    // Update material
    setMaterials(materials.map(m =>
      m.id === selectedMaterial.id
        ? {
            ...m,
            [priceForm.loai === 'gia_mua' ? 'gia_mua_hien_tai' : 'gia_ban_hien_tai']: gia_moi
          }
        : m
    ));

    // Save history
    const historyRecord = {
      id: Date.now(),
      nguyen_lieu_id: selectedMaterial.id,
      nguyen_lieu_ma: selectedMaterial.ma,
      nguyen_lieu_ten: selectedMaterial.ten,
      loai: priceForm.loai,
      gia_cu: gia_cu,
      gia_moi: gia_moi,
      ngay_ap_dung: priceForm.ngay_ap_dung,
      ly_do: priceForm.ly_do.trim() || 'Cập nhật giá',
      nguoi_tao: 'Admin',
      ngay_tao: new Date().toISOString()
    };
    setPriceHistory([...priceHistory, historyRecord]);

    setShowPriceModal(false);
    setSelectedMaterial(null);
    setPriceForm({
      loai: 'gia_mua',
      gia_moi: '',
      ngay_ap_dung: new Date().toISOString().slice(0, 10),
      ly_do: ''
    });
    alert('Đã cập nhật giá!');
  };

  const handleViewHistory = (material) => {
    setSelectedMaterial(material);
    setShowHistoryModal(true);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        let updated = 0;
        const now = new Date().toISOString().slice(0, 10);

        jsonData.forEach(row => {
          const ma = row['Mã']?.toString().toUpperCase().trim();
          const gia_mua = parseFloat(row['Giá mua']) || 0;
          const gia_ban = parseFloat(row['Giá bán']) || 0;

          if (!ma) return;

          const material = materials.find(m => m.ma === ma);
          if (material) {
            // Update existing
            const newHistory = [];

            if (gia_mua > 0 && gia_mua !== material.gia_mua_hien_tai) {
              newHistory.push({
                id: Date.now() + updated,
                nguyen_lieu_id: material.id,
                nguyen_lieu_ma: material.ma,
                nguyen_lieu_ten: material.ten,
                loai: 'gia_mua',
                gia_cu: material.gia_mua_hien_tai,
                gia_moi: gia_mua,
                ngay_ap_dung: now,
                ly_do: 'Import từ Excel',
                nguoi_tao: 'Admin',
                ngay_tao: new Date().toISOString()
              });
            }

            if (gia_ban > 0 && gia_ban !== material.gia_ban_hien_tai) {
              newHistory.push({
                id: Date.now() + updated + 1,
                nguyen_lieu_id: material.id,
                nguyen_lieu_ma: material.ma,
                nguyen_lieu_ten: material.ten,
                loai: 'gia_ban',
                gia_cu: material.gia_ban_hien_tai,
                gia_moi: gia_ban,
                ngay_ap_dung: now,
                ly_do: 'Import từ Excel',
                nguoi_tao: 'Admin',
                ngay_tao: new Date().toISOString()
              });
            }

            if (newHistory.length > 0) {
              setPriceHistory(prev => [...prev, ...newHistory]);
              setMaterials(prev => prev.map(m =>
                m.id === material.id
                  ? {
                      ...m,
                      gia_mua_hien_tai: gia_mua > 0 ? gia_mua : m.gia_mua_hien_tai,
                      gia_ban_hien_tai: gia_ban > 0 ? gia_ban : m.gia_ban_hien_tai
                    }
                  : m
              ));
              updated++;
            }
          }
        });

        alert(`Đã cập nhật giá cho ${updated} nguyên liệu!`);
      } catch (error) {
        alert('Lỗi đọc file Excel!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = () => {
    if (materials.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const data = materials.map(m => ({
      'Mã': m.ma,
      'Tên': m.ten,
      'ĐVT': m.dvt,
      'Giá mua': m.gia_mua_hien_tai,
      'Giá bán': m.gia_ban_hien_tai || '',
      'Ghi chú': m.ghi_chu || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 10 }, 
      { wch: 15 }, { wch: 15 }, { wch: 30 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nguyên liệu');
    XLSX.writeFile(wb, 'Danh-muc-nguyen-lieu.xlsx');
  };

  const handleExportTemplate = () => {
    const data = [
      { 'Mã': 'AV-MAU', 'Tên': 'Màu', 'ĐVT': 'Cái', 'Giá mua': 1200000, 'Giá bán': 0, 'Ghi chú': '' },
      { 'Mã': 'AV-TEM', 'Tên': 'Tem in offset', 'ĐVT': 'Cái', 'Giá mua': 10300, 'Giá bán': 0, 'Ghi chú': '' }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 10 }, 
      { wch: 15 }, { wch: 15 }, { wch: 30 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu');
    XLSX.writeFile(wb, 'Mau-nguyen-lieu.xlsx');
  };

  const getSummary = () => {
    const active = materials.filter(m => m.trang_thai === 'active').length;
    const coGiaMua = materials.filter(m => m.gia_mua_hien_tai > 0).length;
    const coGiaBan = materials.filter(m => m.gia_ban_hien_tai > 0).length;
    return { total: materials.length, active, coGiaMua, coGiaBan };
  };

  const filteredMaterials = materials.filter(m => {
    if (!searchTerm) return true;
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const searchableFields = [m.ma, m.ten, m.dvt, m.ghi_chu || ''];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.ma.localeCompare(b.ma));

  const getMaterialHistory = (materialId) => {
    return priceHistory
      .filter(h => h.nguyen_lieu_id === materialId)
      .sort((a, b) => new Date(b.ngay_ap_dung) - new Date(a.ngay_ap_dung));
  };

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nguyên liệu</h1>
          <p className="text-gray-600">Quản lý danh mục & giá nguyên liệu</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportTemplate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-5 h-5" />Tải mẫu
          </button>
          <label className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-5 h-5" />Xuất Excel
          </button>
          <button
            onClick={() => {
              setEditingMaterial(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />Thêm nguyên liệu
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
              placeholder="Mã, tên, đơn vị tính..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
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
            <Package className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Đang dùng</p>
              <p className="text-3xl font-bold mt-1">{summary.active}</p>
            </div>
            <Package className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Có giá mua</p>
              <p className="text-3xl font-bold mt-1">{summary.coGiaMua}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Có giá bán</p>
              <p className="text-3xl font-bold mt-1">{summary.coGiaBan}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên nguyên liệu</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ĐVT</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá mua</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá bán</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMaterials.map(material => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-bold text-blue-600">{material.ma}</td>
                  <td className="px-4 py-4 text-sm font-medium">{material.ten}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                      {material.dvt}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className="font-medium text-green-600">
                      {material.gia_mua_hien_tai > 0 ? material.gia_mua_hien_tai.toLocaleString('vi-VN') : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className="font-medium text-blue-600">
                      {material.gia_ban_hien_tai > 0 ? material.gia_ban_hien_tai.toLocaleString('vi-VN') : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{material.ghi_chu || '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMaterial(material);
                          setPriceForm({
                            loai: 'gia_mua',
                            gia_moi: '',
                            ngay_ap_dung: new Date().toISOString().slice(0, 10),
                            ly_do: ''
                          });
                          setShowPriceModal(true);
                        }}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Cập nhật giá"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewHistory(material)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Lịch sử giá"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(material)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(material)}
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
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {editingMaterial ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mã *</label>
                  <input
                    type="text"
                    value={form.ma}
                    onChange={(e) => setForm({ ...form, ma: e.target.value.toUpperCase() })}
                    placeholder="VD: AV-MAU"
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                    maxLength={20}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Tên nguyên liệu *</label>
                  <input
                    type="text"
                    value={form.ten}
                    onChange={(e) => setForm({ ...form, ten: e.target.value })}
                    placeholder="VD: Màu"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Đơn vị tính *</label>
                  <input
                    type="text"
                    value={form.dvt}
                    onChange={(e) => setForm({ ...form, dvt: e.target.value })}
                    placeholder="VD: Cái, Kg..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Giá mua</label>
                  <input
                    type="number"
                    value={form.gia_mua}
                    onChange={(e) => setForm({ ...form, gia_mua: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Giá bán</label>
                  <input
                    type="number"
                    value={form.gia_ban}
                    onChange={(e) => setForm({ ...form, gia_ban: e.target.value })}
                    placeholder="0 (Tùy chọn)"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={form.ghi_chu}
                  onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
                  placeholder="Ghi chú về nguyên liệu..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingMaterial(null);
                  setForm({ ma: '', ten: '', dvt: '', gia_mua: '', gia_ban: '', ghi_chu: '' });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingMaterial ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {showPriceModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">Cập nhật giá - {selectedMaterial.ten}</h2>
              <p className="text-sm text-gray-600">Mã: {selectedMaterial.ma}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại giá *</label>
                <select
                  value={priceForm.loai}
                  onChange={(e) => setPriceForm({ ...priceForm, loai: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="gia_mua">Giá mua</option>
                  <option value="gia_ban">Giá bán</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Giá hiện tại</label>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-700">
                    {(priceForm.loai === 'gia_mua' 
                      ? selectedMaterial.gia_mua_hien_tai 
                      : selectedMaterial.gia_ban_hien_tai
                    ).toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Giá mới *</label>
                  <input
                    type="number"
                    value={priceForm.gia_moi}
                    onChange={(e) => setPriceForm({ ...priceForm, gia_moi: e.target.value })}
                    placeholder="Nhập giá mới"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ngày áp dụng *</label>
                <input
                  type="date"
                  value={priceForm.ngay_ap_dung}
                  onChange={(e) => setPriceForm({ ...priceForm, ngay_ap_dung: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lý do</label>
                <input
                  type="text"
                  value={priceForm.ly_do}
                  onChange={(e) => setPriceForm({ ...priceForm, ly_do: e.target.value })}
                  placeholder="VD: Nhà cung cấp tăng giá..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedMaterial(null);
                  setPriceForm({
                    loai: 'gia_mua',
                    gia_moi: '',
                    ngay_ap_dung: new Date().toISOString().slice(0, 10),
                    ly_do: ''
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdatePrice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <h2 className="text-xl font-bold">Lịch sử giá - {selectedMaterial.ten}</h2>
              <p className="text-sm text-gray-600">Mã: {selectedMaterial.ma}</p>
            </div>
            <div className="p-6">
              {getMaterialHistory(selectedMaterial.id).length === 0 ? (
                <div className="text-center py-12 text-gray-500">Chưa có lịch sử thay đổi giá</div>
              ) : (
                <div className="space-y-3">
                  {getMaterialHistory(selectedMaterial.id).map(history => (
                    <div key={history.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              history.loai === 'gia_mua'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {history.loai === 'gia_mua' ? 'Giá mua' : 'Giá bán'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(history.ngay_ap_dung).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 line-through">
                              {history.gia_cu.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-lg font-bold text-blue-600">
                              {history.gia_moi.toLocaleString('vi-VN')} đ
                            </span>
                            <span className={`text-sm font-medium ${
                              history.gia_moi > history.gia_cu ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ({history.gia_moi > history.gia_cu ? '+' : ''}
                              {((history.gia_moi - history.gia_cu) / history.gia_cu * 100).toFixed(1)}%)
                            </span>
                          </div>
                          {history.ly_do && (
                            <p className="text-sm text-gray-600 mt-2">Lý do: {history.ly_do}</p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>{history.nguoi_tao}</div>
                          <div>{new Date(history.ngay_tao).toLocaleString('vi-VN')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedMaterial(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default Material;
