import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Building2, Wallet, ArrowRightLeft } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function CashBook() {
  const loadAccounts = () => {
    const saved = localStorage.getItem('cash_accounts');
    return saved ? JSON.parse(saved) : [];
  };

  const loadTransactions = () => {
    const saved = localStorage.getItem('cash_transactions');
    return saved ? JSON.parse(saved) : [];
  };

  const [accounts, setAccounts] = useState(loadAccounts);
  const [transactions, setTransactions] = useState(loadTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [viewMode, setViewMode] = useState('transactions'); // 'transactions' | 'accounts'

  const [accountForm, setAccountForm] = useState({
    loai: 'tien_mat',
    ten: '',
    so_du: 0,
    ngan_hang: '',
    so_tai_khoan: '',
    chi_nhanh: '',
    trang_thai: 'active',
    ghi_chu: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    tai_khoan_id: '',
    ngay: new Date().toISOString().slice(0, 10),
    loai: 'thu',
    danh_muc: 'tam_ung_nv',
    doi_tuong: '',
    ten_doi_tuong: '',
    so_tien: 0,
    ly_do: '',
    tai_khoan_den_id: '',
    ghi_chu: ''
  });

  useEffect(() => {
    localStorage.setItem('cash_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('cash_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const categories = {
    tam_ung_nv: 'Tạm ứng nhân viên',
    luong: 'Lương',
    mua_hang: 'Mua hàng',
    ban_hang: 'Bán hàng',
    chi_phi: 'Chi phí khác',
    vay: 'Vay',
    tra_no: 'Trả nợ',
    khac: 'Khác'
  };

  const handleAddAccount = () => {
    if (!accountForm.ten.trim()) {
      alert('Vui lòng nhập tên tài khoản!');
      return;
    }

    if (accountForm.loai === 'ngan_hang' && !accountForm.so_tai_khoan.trim()) {
      alert('Vui lòng nhập số tài khoản ngân hàng!');
      return;
    }

    const newAccount = {
      id: Date.now(),
      ...accountForm,
      so_du: parseFloat(accountForm.so_du) || 0,
      ngay_tao: new Date().toISOString()
    };

    setAccounts([...accounts, newAccount]);
    setShowAccountModal(false);
    setAccountForm({
      loai: 'tien_mat',
      ten: '',
      so_du: 0,
      ngan_hang: '',
      so_tai_khoan: '',
      chi_nhanh: '',
      trang_thai: 'active',
      ghi_chu: ''
    });
    alert('Đã thêm tài khoản thành công!');
  };

  const handleUpdateAccount = () => {
    if (!accountForm.ten.trim()) {
      alert('Vui lòng nhập tên tài khoản!');
      return;
    }

    setAccounts(accounts.map(acc =>
      acc.id === editingAccount.id ? { ...acc, ...accountForm } : acc
    ));
    setShowAccountModal(false);
    setEditingAccount(null);
    setAccountForm({
      loai: 'tien_mat',
      ten: '',
      so_du: 0,
      ngan_hang: '',
      so_tai_khoan: '',
      chi_nhanh: '',
      trang_thai: 'active',
      ghi_chu: ''
    });
    alert('Đã cập nhật tài khoản!');
  };

  const handleDeleteAccount = (account) => {
    const accountTransactions = transactions.filter(t => 
      t.tai_khoan_id === account.id || t.tai_khoan_den_id === account.id
    );

    if (accountTransactions.length > 0) {
      alert('Không thể xóa tài khoản đã có giao dịch!');
      return;
    }

    if (window.confirm(`Xóa tài khoản "${account.ten}"?`)) {
      setAccounts(accounts.filter(acc => acc.id !== account.id));
    }
  };

  const handleAddTransaction = () => {
    if (!transactionForm.tai_khoan_id) {
      alert('Vui lòng chọn tài khoản!');
      return;
    }

    if (transactionForm.so_tien <= 0) {
      alert('Số tiền phải lớn hơn 0!');
      return;
    }

    if (!transactionForm.ly_do.trim()) {
      alert('Vui lòng nhập lý do!');
      return;
    }

    const account = accounts.find(acc => acc.id === parseInt(transactionForm.tai_khoan_id));
    const amount = parseFloat(transactionForm.so_tien);

    // Check balance for chi
    if (transactionForm.loai === 'chi' && account.so_du < amount) {
      alert(`Số dư không đủ!\nSố dư hiện tại: ${account.so_du.toLocaleString('vi-VN')} đ\nSố tiền chi: ${amount.toLocaleString('vi-VN')} đ\nThiếu: ${(amount - account.so_du).toLocaleString('vi-VN')} đ`);
      return;
    }

    // Check for chuyen
    if (transactionForm.loai === 'chuyen') {
      if (!transactionForm.tai_khoan_den_id) {
        alert('Vui lòng chọn tài khoản đích!');
        return;
      }
      if (transactionForm.tai_khoan_id === transactionForm.tai_khoan_den_id) {
        alert('Không thể chuyển vào cùng tài khoản!');
        return;
      }
    }

    const newTransaction = {
      id: Date.now(),
      ...transactionForm,
      tai_khoan_id: parseInt(transactionForm.tai_khoan_id),
      tai_khoan_den_id: transactionForm.tai_khoan_den_id ? parseInt(transactionForm.tai_khoan_den_id) : null,
      so_tien: amount,
      nguoi_tao: 'Admin',
      ngay_tao: new Date().toISOString()
    };

    // Update account balance
    let updatedAccounts = [...accounts];

    if (transactionForm.loai === 'thu') {
      updatedAccounts = updatedAccounts.map(acc =>
        acc.id === parseInt(transactionForm.tai_khoan_id)
          ? { ...acc, so_du: acc.so_du + amount }
          : acc
      );
    } else if (transactionForm.loai === 'chi') {
      updatedAccounts = updatedAccounts.map(acc =>
        acc.id === parseInt(transactionForm.tai_khoan_id)
          ? { ...acc, so_du: acc.so_du - amount }
          : acc
      );
    } else if (transactionForm.loai === 'chuyen') {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === parseInt(transactionForm.tai_khoan_id)) {
          return { ...acc, so_du: acc.so_du - amount };
        }
        if (acc.id === parseInt(transactionForm.tai_khoan_den_id)) {
          return { ...acc, so_du: acc.so_du + amount };
        }
        return acc;
      });
    }

    setAccounts(updatedAccounts);
    setTransactions([...transactions, newTransaction]);
    setShowTransactionModal(false);
    setTransactionForm({
      tai_khoan_id: '',
      ngay: new Date().toISOString().slice(0, 10),
      loai: 'thu',
      danh_muc: 'tam_ung_nv',
      doi_tuong: '',
      ten_doi_tuong: '',
      so_tien: 0,
      ly_do: '',
      tai_khoan_den_id: '',
      ghi_chu: ''
    });
    alert('Đã thêm giao dịch thành công!');
  };

  const getTotalBalance = () => {
    return accounts
      .filter(acc => acc.trang_thai === 'active')
      .reduce((sum, acc) => sum + acc.so_du, 0);
  };

  const getAccountName = (id) => {
    const account = accounts.find(acc => acc.id === id);
    return account ? account.ten : 'N/A';
  };

  const getSummary = () => {
    const monthTransactions = filteredTransactions.filter(t => 
      t.ngay.startsWith(filterMonth)
    );

    const thu = monthTransactions
      .filter(t => t.loai === 'thu')
      .reduce((sum, t) => sum + t.so_tien, 0);

    const chi = monthTransactions
      .filter(t => t.loai === 'chi')
      .reduce((sum, t) => sum + t.so_tien, 0);

    return { thu, chi, count: monthTransactions.length };
  };

  const filteredTransactions = transactions.filter(t => {
    // Filter by account
    if (filterAccount !== 'all') {
      const accountId = parseInt(filterAccount);
      if (t.tai_khoan_id !== accountId && t.tai_khoan_den_id !== accountId) {
        return false;
      }
    }

    // Filter by month
    if (!t.ngay.startsWith(filterMonth)) {
      return false;
    }

    // Filter by search
    if (searchTerm) {
      const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
      const searchableFields = [
        t.doi_tuong || '',
        t.ten_doi_tuong || '',
        t.ly_do || '',
        categories[t.danh_muc] || ''
      ];
      return searchableFields.some(field =>
        removeVietnameseTones(field.toLowerCase()).includes(searchLower)
      );
    }

    return true;
  }).sort((a, b) => new Date(b.ngay) - new Date(a.ngay));

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sổ quỹ</h1>
          <p className="text-gray-600">Quản lý tiền mặt & ngân hàng</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'accounts' ? 'transactions' : 'accounts')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'accounts' ? 'Xem giao dịch' : 'Quản lý tài khoản'}
          </button>
          <button
            onClick={() => {
              if (viewMode === 'accounts') {
                setEditingAccount(null);
                setShowAccountModal(true);
              } else {
                setShowTransactionModal(true);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {viewMode === 'accounts' ? 'Thêm tài khoản' : 'Thêm giao dịch'}
          </button>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {accounts.filter(acc => acc.trang_thai === 'active').map(account => (
          <div
            key={account.id}
            className={`rounded-xl p-6 text-white ${
              account.loai === 'tien_mat'
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {account.loai === 'tien_mat' ? (
                  <Wallet className="w-6 h-6" />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
                <span className="text-sm opacity-90">{account.ten}</span>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {(account.so_du / 1000000).toFixed(1)}M
            </p>
            {account.loai === 'ngan_hang' && (
              <p className="text-xs opacity-75 mt-2">
                {account.ngan_hang} ***{account.so_tai_khoan.slice(-4)}
              </p>
            )}
          </div>
        ))}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm opacity-90">Tổng cộng</span>
            </div>
          </div>
          <p className="text-3xl font-bold">
            {(getTotalBalance() / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs opacity-75 mt-2">
            {accounts.filter(acc => acc.trang_thai === 'active').length} tài khoản
          </p>
        </div>
      </div>

      {viewMode === 'accounts' ? (
        /* Account Management View */
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tài khoản</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thông tin</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số dư</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {accounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {account.loai === 'tien_mat' ? (
                          <Wallet className="w-5 h-5 text-green-600" />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-600" />
                        )}
                        <span className="text-sm font-medium">
                          {account.loai === 'tien_mat' ? 'Tiền mặt' : 'Ngân hàng'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">{account.ten}</p>
                      {account.ghi_chu && (
                        <p className="text-xs text-gray-500">{account.ghi_chu}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {account.loai === 'ngan_hang' ? (
                        <div className="text-sm">
                          <p className="font-medium">{account.ngan_hang}</p>
                          <p className="text-gray-500">{account.so_tai_khoan}</p>
                          {account.chi_nhanh && (
                            <p className="text-xs text-gray-400">{account.chi_nhanh}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-lg font-bold ${
                        account.so_du >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.so_du.toLocaleString('vi-VN')} đ
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.trang_thai === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.trang_thai === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAccount(account);
                            setAccountForm(account);
                            setShowAccountModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account)}
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
          {accounts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">Chưa có tài khoản nào</p>
              <button
                onClick={() => setShowAccountModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm tài khoản đầu tiên
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Transaction View */
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tài khoản</label>
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="all">Tất cả tài khoản</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.ten}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tháng</label>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Đối tượng, lý do..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tổng thu</p>
                  <p className="text-2xl font-bold mt-1">{(summary.thu / 1000000).toFixed(1)}M</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Tổng chi</p>
                  <p className="text-2xl font-bold mt-1">{(summary.chi / 1000000).toFixed(1)}M</p>
                </div>
                <TrendingDown className="w-12 h-12 text-red-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Số giao dịch</p>
                  <p className="text-3xl font-bold mt-1">{summary.count}</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-200" />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài khoản</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đối tượng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm">
                        {new Date(transaction.ngay).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.loai === 'thu'
                            ? 'bg-green-100 text-green-800'
                            : transaction.loai === 'chi'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.loai === 'thu' ? 'Thu' : transaction.loai === 'chi' ? 'Chi' : 'Chuyển'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {transaction.loai === 'chuyen' ? (
                          <div>
                            <p>{getAccountName(transaction.tai_khoan_id)}</p>
                            <p className="text-xs text-gray-500">→ {getAccountName(transaction.tai_khoan_den_id)}</p>
                          </div>
                        ) : (
                          getAccountName(transaction.tai_khoan_id)
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium">{transaction.ten_doi_tuong || '-'}</p>
                        <p className="text-xs text-gray-500">{categories[transaction.danh_muc]}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{transaction.ly_do}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`text-sm font-bold ${
                          transaction.loai === 'thu' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.loai === 'thu' ? '+' : '-'}{transaction.so_tien.toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">Không có giao dịch</div>
            )}
          </div>
        </>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loại tài khoản *</label>
                  <select
                    value={accountForm.loai}
                    onChange={(e) => setAccountForm({ ...accountForm, loai: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="tien_mat">Tiền mặt</option>
                    <option value="ngan_hang">Ngân hàng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tên tài khoản *</label>
                  <input
                    type="text"
                    value={accountForm.ten}
                    onChange={(e) => setAccountForm({ ...accountForm, ten: e.target.value })}
                    placeholder="VD: Quỹ tiền mặt, Tài khoản chính..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {accountForm.loai === 'ngan_hang' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngân hàng *</label>
                    <input
                      type="text"
                      value={accountForm.ngan_hang}
                      onChange={(e) => setAccountForm({ ...accountForm, ngan_hang: e.target.value })}
                      placeholder="VD: Vietcombank, Techcombank..."
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số tài khoản *</label>
                    <input
                      type="text"
                      value={accountForm.so_tai_khoan}
                      onChange={(e) => setAccountForm({ ...accountForm, so_tai_khoan: e.target.value })}
                      placeholder="0123456789"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Chi nhánh</label>
                    <input
                      type="text"
                      value={accountForm.chi_nhanh}
                      onChange={(e) => setAccountForm({ ...accountForm, chi_nhanh: e.target.value })}
                      placeholder="VD: TP. Hồ Chí Minh"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Số dư ban đầu</label>
                  <input
                    type="number"
                    value={accountForm.so_du}
                    onChange={(e) => setAccountForm({ ...accountForm, so_du: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={!!editingAccount}
                  />
                  {editingAccount && (
                    <p className="text-xs text-orange-600 mt-1">Số dư thay đổi qua giao dịch, không sửa trực tiếp</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <select
                    value={accountForm.trang_thai}
                    onChange={(e) => setAccountForm({ ...accountForm, trang_thai: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={accountForm.ghi_chu}
                  onChange={(e) => setAccountForm({ ...accountForm, ghi_chu: e.target.value })}
                  placeholder="Ghi chú về tài khoản..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  setEditingAccount(null);
                  setAccountForm({
                    loai: 'tien_mat',
                    ten: '',
                    so_du: 0,
                    ngan_hang: '',
                    so_tai_khoan: '',
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
                onClick={editingAccount ? handleUpdateAccount : handleAddAccount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingAccount ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">Thêm giao dịch mới</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loại giao dịch *</label>
                  <select
                    value={transactionForm.loai}
                    onChange={(e) => setTransactionForm({ ...transactionForm, loai: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="thu">Thu tiền</option>
                    <option value="chi">Chi tiền</option>
                    <option value="chuyen">Chuyển khoản</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày *</label>
                  <input
                    type="date"
                    value={transactionForm.ngay}
                    onChange={(e) => setTransactionForm({ ...transactionForm, ngay: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số tiền *</label>
                  <input
                    type="number"
                    value={transactionForm.so_tien}
                    onChange={(e) => setTransactionForm({ ...transactionForm, so_tien: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {transactionForm.loai === 'chuyen' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Từ tài khoản *</label>
                    <select
                      value={transactionForm.tai_khoan_id}
                      onChange={(e) => setTransactionForm({ ...transactionForm, tai_khoan_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Chọn tài khoản</option>
                      {accounts.filter(acc => acc.trang_thai === 'active').map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.ten} ({acc.so_du.toLocaleString('vi-VN')} đ)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Đến tài khoản *</label>
                    <select
                      value={transactionForm.tai_khoan_den_id}
                      onChange={(e) => setTransactionForm({ ...transactionForm, tai_khoan_den_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Chọn tài khoản</option>
                      {accounts.filter(acc => acc.trang_thai === 'active').map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.ten}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Tài khoản *</label>
                  <select
                    value={transactionForm.tai_khoan_id}
                    onChange={(e) => setTransactionForm({ ...transactionForm, tai_khoan_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn tài khoản</option>
                    {accounts.filter(acc => acc.trang_thai === 'active').map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.ten} ({acc.so_du.toLocaleString('vi-VN')} đ)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục</label>
                  <select
                    value={transactionForm.danh_muc}
                    onChange={(e) => setTransactionForm({ ...transactionForm, danh_muc: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mã đối tượng</label>
                  <input
                    type="text"
                    value={transactionForm.doi_tuong}
                    onChange={(e) => setTransactionForm({ ...transactionForm, doi_tuong: e.target.value })}
                    placeholder="VD: NV001, KH001..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên đối tượng</label>
                <input
                  type="text"
                  value={transactionForm.ten_doi_tuong}
                  onChange={(e) => setTransactionForm({ ...transactionForm, ten_doi_tuong: e.target.value })}
                  placeholder="Tên nhân viên, khách hàng, nhà cung cấp..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lý do *</label>
                <textarea
                  value={transactionForm.ly_do}
                  onChange={(e) => setTransactionForm({ ...transactionForm, ly_do: e.target.value })}
                  placeholder="Lý do thu/chi tiền..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <input
                  type="text"
                  value={transactionForm.ghi_chu}
                  onChange={(e) => setTransactionForm({ ...transactionForm, ghi_chu: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setTransactionForm({
                    tai_khoan_id: '',
                    ngay: new Date().toISOString().slice(0, 10),
                    loai: 'thu',
                    danh_muc: 'tam_ung_nv',
                    doi_tuong: '',
                    ten_doi_tuong: '',
                    so_tien: 0,
                    ly_do: '',
                    tai_khoan_den_id: '',
                    ghi_chu: ''
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddTransaction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashBook;
