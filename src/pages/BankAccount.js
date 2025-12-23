import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, CreditCard } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function BankAccount() {
  const loadBanks = () => {
    const saved = localStorage.getItem('bank_accounts');
    if (saved) return JSON.parse(saved);
    
    // Default data
    return [
      {
        id: 1,
        ma: 'ACB-HP',
        so_tk: '4393407',
        ten: 'CÔNG TY TNHH SXTM BAO BÌ HOÀNG PHÁT',
        ngan_hang: 'ACB',
        chi_nhanh: 'PGD Hàm Tử, HCM',
        trang_thai: 'active',
        ghi_chu: ''
      },
      {
        id: 2,
        ma: 'ACB-HPUSD',
        so_tk: '4393408',
        ten: 'Công ty TNHH SXTM Bao Bì Hoàng Phát',
        ngan_hang: 'ACB',
        chi_nhanh: 'PGD Hàm Tử, HCM',
        trang_thai: 'active',
        ghi_chu: ''
      }
    ];
  };

  const [banks, setBanks] = useState(loadBanks);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);

  const [form, setForm] = useState({
    ma: '',
    so_tk: '',
    ten: '',
    ngan_hang: '',
    chi_nhanh: '',
    trang_thai: 'active',
    ghi_chu: ''
  });

  useEffect(() => {
    localStorage.setItem('bank_accounts', JSON.stringify(banks));
  }, [banks]);

  const handleSubmit = () => {
    if (!form.ma.trim() || !form.so_tk.trim() || !form.ten.trim() || !form.ngan_hang.trim()) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Check duplicate code
    const existingCode = banks.find(b => 
      b.ma.toUpperCase() === form.ma.toUpperCase().trim() && 
      (!editingBank || b.id !== editingBank.id)
    );

    if (existingCode) {
      alert('Mã đã tồn tại!');
      return;
    }

    // Check duplicate account number
    const existingAccount = banks.find(b => 
      b.so_tk === form.so_tk.trim() && 
      (!editingBank || b.id !== editingBank.id)
    );

    if (existingAccount) {
      alert('Số tài khoản đã tồn tại!');
      return;
    }

    if (editingBank) {
      setBanks(banks.map(b =>
        b.id === editingBank.id
          ? {
              ...b,
              ma: form.ma.trim().toUpperCase(),
              so_tk: form.so_tk.trim(),
              ten: form.ten.trim(),
              ngan_hang: form.ngan_hang.trim(),
              chi_nhanh: form.chi_nhanh.trim(),
              trang_thai: form.trang_thai,
              ghi_chu: form.ghi_chu
            }
          : b
      ));
      alert('Đã cập nhật!');
    } else {
      const newBank = {
        id: Date.now(),
        ma: form.ma.trim().toUpperCase(),
        so_tk: form.so_tk.trim(),
        ten: form.ten.trim(),
        ngan_hang: form.ngan_hang.trim(),
        chi_nhanh: form.chi_nhanh.trim(),
        trang_thai: form.trang_thai,
        ghi_chu: form.ghi_chu
      };
      setBanks([...banks, newBank]);
      alert('Đã thêm ngân hàng!');
    }

    setShowModal(false);
    setEditingBank(null);
    setForm({
      ma: '',
      so_tk: '',
      ten: '',
      ngan_hang: '',
      chi_nhanh: '',
      trang_thai: 'active',
      ghi_chu: ''
    });
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setForm({
      ma: bank.ma,
      so_tk: bank.so_tk,
      ten: bank.ten,
      ngan_hang: bank.ngan_hang,
      chi_nhanh: bank.chi_nhanh || '',
      trang_thai: bank.trang_thai,
      ghi_chu: bank.ghi_chu || ''
    });
    setShowModal(true);
  };

  const handleDelete = (bank) => {
    if (window.confirm(`Xóa tài khoản ngân hàng "${bank.ten}"?`)) {
      setBanks(banks.filter(b => b.id !== bank.id));
    }
  };

  const getSummary = () => {
    const active = banks.filter(b => b.trang_thai === 'active').length;
    const inactive = banks.filter(b => b.trang_thai === 'inactive').length;
    return { active, inactive, total: banks.length };
  };

  const filteredBanks = banks.filter(b => {
    if (!searchTerm) return true;

    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const searchableFields = [b.ma, b.so_tk, b.ten, b.ngan_hang, b.chi_nhanh || ''];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.ma.localeCompare(b.ma));

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ngân hàng</h1>
          <p className="text-gray-600">Quản lý tài khoản ngân hàng</p>
        </div>
        <button
          onClick={() => {
            setEditingBank(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm ngân hàng
        </button>
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
              placeholder="Mã, số TK, tên, ngân hàng..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng số</p>
              <p className="text-3xl font-bold mt-1">{summary.total}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Đang dùng</p>
              <p className="text-3xl font-bold mt-1">{summary.active}</p>
            </div>
            <CreditCard className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Tạm ngưng</p>
              <p className="text-3xl font-bold mt-1">{summary.inactive}</p>
            </div>
            <CreditCard className="w-12 h-12 text-gray-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số TK</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên công ty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngân hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi nhánh</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBanks.map(bank => (
                <tr key={bank.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-bold text-blue-600">{bank.ma}</td>
                  <td className="px-4 py-4 text-sm font-medium">{bank.so_tk}</td>
                  <td className="px-4 py-4 text-sm">{bank.ten}</td>
                  <td className="px-4 py-4 text-sm font-medium">{bank.ngan_hang}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{bank.chi_nhanh || '-'}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bank.trang_thai === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bank.trang_thai === 'active' ? 'Đang dùng' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(bank)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bank)}
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
        {filteredBanks.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {editingBank ? 'Sửa ngân hàng' : 'Thêm ngân hàng'}
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
                    placeholder="VD: ACB-HP"
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số tài khoản *</label>
                  <input
                    type="text"
                    value={form.so_tk}
                    onChange={(e) => setForm({ ...form, so_tk: e.target.value })}
                    placeholder="VD: 4393407"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên công ty *</label>
                <input
                  type="text"
                  value={form.ten}
                  onChange={(e) => setForm({ ...form, ten: e.target.value })}
                  placeholder="VD: CÔNG TY TNHH SXTM BAO BÌ HOÀNG PHÁT"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngân hàng *</label>
                  <input
                    type="text"
                    value={form.ngan_hang}
                    onChange={(e) => setForm({ ...form, ngan_hang: e.target.value })}
                    placeholder="VD: ACB, Vietcombank..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Chi nhánh</label>
                  <input
                    type="text"
                    value={form.chi_nhanh}
                    onChange={(e) => setForm({ ...form, chi_nhanh: e.target.value })}
                    placeholder="VD: PGD Hàm Tử, HCM"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trạng thái</label>
                <select
                  value={form.trang_thai}
                  onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="active">Đang dùng</option>
                  <option value="inactive">Tạm ngưng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={form.ghi_chu}
                  onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
                  placeholder="Ghi chú về tài khoản..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBank(null);
                  setForm({
                    ma: '',
                    so_tk: '',
                    ten: '',
                    ngan_hang: '',
                    chi_nhanh: '',
                    trang_thai: 'active',
                    ghi_chu: ''
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingBank ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankAccount;
