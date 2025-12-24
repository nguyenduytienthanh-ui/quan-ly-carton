import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Eye, Download, ArrowRight, X, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

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
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, ten: 'Quỹ tiền mặt', loai: 'tien_mat', so_du: 0, trang_thai: 'active', ghi_chu: '', ngay_tao: new Date().toISOString() }
    ];
  };

  const loadTransactions = () => {
    const saved = localStorage.getItem('cash_transactions');
    return saved ? JSON.parse(saved) : [];
  };

  const loadBankAccounts = () => {
    const saved = localStorage.getItem('bank_accounts');
    return saved ? JSON.parse(saved) : [];
  };

  const loadTransactionCategories = () => {
    const saved = localStorage.getItem('transaction_categories');
    return saved ? JSON.parse(saved) : [];
  };

  const loadSuppliers = () => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : [];
  };

  const loadCustomers = () => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  };

  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    return saved ? JSON.parse(saved) : [];
  };

  const [accounts, setAccounts] = useState(loadAccounts);
  const [transactions, setTransactions] = useState(loadTransactions);
  const [bankAccounts] = useState(loadBankAccounts);
  const [categories] = useState(loadTransactionCategories);
  const [suppliers] = useState(loadSuppliers);
  const [customers] = useState(loadCustomers);
  const [employees] = useState(loadEmployees);
  const [viewMode, setViewMode] = useState('transactions');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [accountForm, setAccountForm] = useState({
    ten: '',
    loai: 'tien_mat',
    so_du: 0,
    ghi_chu: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    loai: 'chi',
    source_type: 'cash',
    source_id: '',
    target_id: '',
    ngay: new Date().toISOString().slice(0, 10),
    so_tien: '',
    
    // Đối tượng
    doi_tuong_loai: 'khong',
    doi_tuong_id: '',
    doi_tuong_ten: '',
    
    // Danh mục
    danh_muc_id: '',
    
    // Thanh toán theo phiếu
    thanh_toan_theo_phieu: false,
    chi_tiet_phieu: [],
    
    ly_do: '',
    ghi_chu: ''
  });

  const [receiptForm, setReceiptForm] = useState({
    loai_phieu: 'hoa_don',
    so_phieu: '',
    ngay_phieu: new Date().toISOString().slice(0, 10),
    so_tien: '',
    ghi_chu: ''
  });

  useEffect(() => {
    localStorage.setItem('cash_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('cash_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddAccount = () => {
    if (!accountForm.ten.trim()) {
      alert('Vui lòng nhập tên tài khoản!');
      return;
    }

    const newAccount = {
      id: Date.now(),
      ten: accountForm.ten.trim(),
      loai: accountForm.loai,
      so_du: parseFloat(accountForm.so_du) || 0,
      trang_thai: 'active',
      ghi_chu: accountForm.ghi_chu,
      ngay_tao: new Date().toISOString()
    };

    setAccounts([...accounts, newAccount]);
    setShowAccountModal(false);
    setAccountForm({ ten: '', loai: 'tien_mat', so_du: 0, ghi_chu: '' });
    alert('Đã thêm tài khoản!');
  };

  const handleAddReceipt = () => {
    if (!receiptForm.so_phieu.trim() || !receiptForm.so_tien) {
      alert('Vui lòng điền đầy đủ thông tin phiếu!');
      return;
    }

    const newReceipt = {
      loai_phieu: receiptForm.loai_phieu,
      so_phieu: receiptForm.so_phieu.trim(),
      ngay_phieu: receiptForm.ngay_phieu,
      so_tien: parseFloat(receiptForm.so_tien),
      ghi_chu: receiptForm.ghi_chu
    };

    setTransactionForm({
      ...transactionForm,
      chi_tiet_phieu: [...transactionForm.chi_tiet_phieu, newReceipt]
    });

    setShowReceiptModal(false);
    setReceiptForm({
      loai_phieu: 'hoa_don',
      so_phieu: '',
      ngay_phieu: new Date().toISOString().slice(0, 10),
      so_tien: '',
      ghi_chu: ''
    });
  };

  const handleRemoveReceipt = (index) => {
    const newReceipts = transactionForm.chi_tiet_phieu.filter((_, i) => i !== index);
    setTransactionForm({ ...transactionForm, chi_tiet_phieu: newReceipts });
  };

  const handleAddTransaction = () => {
    if (!transactionForm.source_id || !transactionForm.so_tien) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (transactionForm.loai === 'chuyen' && !transactionForm.target_id) {
      alert('Vui lòng chọn tài khoản đích!');
      return;
    }

    if (transactionForm.doi_tuong_loai !== 'khong' && !transactionForm.doi_tuong_id) {
      alert('Vui lòng chọn đối tượng!');
      return;
    }

    if (!transactionForm.danh_muc_id) {
      alert('Vui lòng chọn danh mục!');
      return;
    }

    const amount = parseFloat(transactionForm.so_tien);
    if (amount <= 0) {
      alert('Số tiền phải lớn hơn 0!');
      return;
    }

    // Validate receipts if enabled
    if (transactionForm.thanh_toan_theo_phieu) {
      if (transactionForm.chi_tiet_phieu.length === 0) {
        alert('Vui lòng thêm ít nhất 1 phiếu!');
        return;
      }
      const totalReceipt = transactionForm.chi_tiet_phieu.reduce((sum, r) => sum + r.so_tien, 0);
      if (Math.abs(totalReceipt - amount) > 0.01) {
        alert(`Tổng tiền phiếu (${totalReceipt.toLocaleString('vi-VN')}) không khớp với số tiền giao dịch (${amount.toLocaleString('vi-VN')})!`);
        return;
      }
    }

    // Check balance for chi/chuyen
    if ((transactionForm.loai === 'chi' || transactionForm.loai === 'chuyen') && transactionForm.source_type === 'cash') {
      const account = accounts.find(acc => acc.id === parseInt(transactionForm.source_id));
      if (account && account.so_du < amount) {
        alert(`Số dư không đủ!\nSố dư: ${account.so_du.toLocaleString('vi-VN')} đ\nCần: ${amount.toLocaleString('vi-VN')} đ`);
        return;
      }
    }

    // Get object name
    let doi_tuong_ten = transactionForm.doi_tuong_ten;
    if (transactionForm.doi_tuong_loai !== 'khong' && transactionForm.doi_tuong_id) {
      if (transactionForm.doi_tuong_loai === 'nha_cung_cap') {
        const supplier = suppliers.find(s => s.id === parseInt(transactionForm.doi_tuong_id));
        doi_tuong_ten = supplier ? `${supplier.code} - ${supplier.name}` : '';
      } else if (transactionForm.doi_tuong_loai === 'khach_hang') {
        const customer = customers.find(c => c.id === parseInt(transactionForm.doi_tuong_id));
        doi_tuong_ten = customer ? `${customer.code} - ${customer.name}` : '';
      } else if (transactionForm.doi_tuong_loai === 'nhan_vien') {
        const emp = employees.find(e => e.id === parseInt(transactionForm.doi_tuong_id));
        doi_tuong_ten = emp ? `${emp.code} - ${emp.name}` : '';
      }
    }

    // Get category info
    const category = categories.find(c => c.ma === transactionForm.danh_muc_id);

    const newTransaction = {
      id: Date.now(),
      loai: transactionForm.loai,
      source_type: transactionForm.source_type,
      source_id: parseInt(transactionForm.source_id),
      target_id: transactionForm.target_id ? parseInt(transactionForm.target_id) : null,
      ngay: transactionForm.ngay,
      so_tien: amount,
      
      doi_tuong_loai: transactionForm.doi_tuong_loai,
      doi_tuong_id: transactionForm.doi_tuong_id ? parseInt(transactionForm.doi_tuong_id) : null,
      doi_tuong_ten: doi_tuong_ten,
      
      danh_muc_id: transactionForm.danh_muc_id,
      danh_muc_ten: category ? category.ten : '',
      danh_muc_mau: category ? category.mau_sac : '#666',
      
      thanh_toan_theo_phieu: transactionForm.thanh_toan_theo_phieu,
      chi_tiet_phieu: transactionForm.thanh_toan_theo_phieu ? transactionForm.chi_tiet_phieu : [],
      
      ly_do: transactionForm.ly_do,
      ghi_chu: transactionForm.ghi_chu,
      nguoi_tao: 'Admin',
      ngay_tao: new Date().toISOString()
    };

    // Update balances
    if (transactionForm.source_type === 'cash') {
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === parseInt(transactionForm.source_id)) {
          if (transactionForm.loai === 'thu') {
            return { ...acc, so_du: acc.so_du + amount };
          } else {
            return { ...acc, so_du: acc.so_du - amount };
          }
        }
        if (transactionForm.loai === 'chuyen' && acc.id === parseInt(transactionForm.target_id)) {
          return { ...acc, so_du: acc.so_du + amount };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
    }

    setTransactions([...transactions, newTransaction]);
    setShowAddModal(false);
    setTransactionForm({
      loai: 'chi',
      source_type: 'cash',
      source_id: '',
      target_id: '',
      ngay: new Date().toISOString().slice(0, 10),
      so_tien: '',
      doi_tuong_loai: 'khong',
      doi_tuong_id: '',
      doi_tuong_ten: '',
      danh_muc_id: '',
      thanh_toan_theo_phieu: false,
      chi_tiet_phieu: [],
      ly_do: '',
      ghi_chu: ''
    });
    alert('Đã thêm giao dịch!');
  };

  const handleDeleteTransaction = (transaction) => {
    if (!window.confirm('Xóa giao dịch này?')) return;

    // Restore balance
    if (transaction.source_type === 'cash') {
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === transaction.source_id) {
          if (transaction.loai === 'thu') {
            return { ...acc, so_du: acc.so_du - transaction.so_tien };
          } else {
            return { ...acc, so_du: acc.so_du + transaction.so_tien };
          }
        }
        if (transaction.loai === 'chuyen' && acc.id === transaction.target_id) {
          return { ...acc, so_du: acc.so_du - transaction.so_tien };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
    }

    setTransactions(transactions.filter(t => t.id !== transaction.id));
  };

  const handleExportExcel = () => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const data = filtered.map(t => ({
      'Ngày': new Date(t.ngay).toLocaleDateString('vi-VN'),
      'Loại': t.loai === 'thu' ? 'Thu' : t.loai === 'chi' ? 'Chi' : 'Chuyển',
      'Nguồn': getSourceName(t.source_type, t.source_id),
      'Đối tượng': t.doi_tuong_ten || '-',
      'Danh mục': t.danh_muc_ten,
      'Lý do': t.ly_do,
      'Số tiền': t.so_tien,
      'Ghi chú': t.ghi_chu || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 25 }, 
      { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Thu chi ${filterMonth}`);
    XLSX.writeFile(wb, `So-quy-${filterMonth}.xlsx`);
  };

  const getSourceName = (sourceType, sourceId) => {
    if (sourceType === 'cash') {
      const acc = accounts.find(a => a.id === sourceId);
      return acc ? acc.ten : 'N/A';
    } else {
      const bank = bankAccounts.find(b => b.id === sourceId);
      return bank ? `${bank.ma} (${bank.so_tk})` : 'N/A';
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      if (!t.ngay.startsWith(filterMonth)) return false;
      if (selectedAccount && t.source_type === 'cash' && t.source_id !== selectedAccount.id) return false;
      if (filterType !== 'all' && t.loai !== filterType) return false;
      if (!searchTerm) return true;

      const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
      const searchableFields = [
        t.doi_tuong_ten || '',
        t.danh_muc_ten || '',
        t.ly_do || '',
        t.ghi_chu || '',
        getSourceName(t.source_type, t.source_id)
      ];
      return searchableFields.some(field =>
        removeVietnameseTones(field.toLowerCase()).includes(searchLower)
      );
    }).sort((a, b) => new Date(b.ngay) - new Date(a.ngay));
  };

  const getSummary = () => {
    const filtered = getFilteredTransactions();
    const thu = filtered.filter(t => t.loai === 'thu').reduce((sum, t) => sum + t.so_tien, 0);
    const chi = filtered.filter(t => t.loai === 'chi').reduce((sum, t) => sum + t.so_tien, 0);
    return { thu, chi, balance: thu - chi, count: filtered.length };
  };

  const cashSources = accounts.filter(acc => acc.trang_thai === 'active');
  const bankSources = bankAccounts.filter(bank => bank.trang_thai === 'active');
  const filteredTransactions = getFilteredTransactions();
  const summary = getSummary();

  // Get objects by type
  const getObjects = (type) => {
    if (type === 'nha_cung_cap') return suppliers;
    if (type === 'khach_hang') return customers;
    if (type === 'nhan_vien') return employees.filter(e => e.status !== 'Nghỉ việc');
    return [];
  };

  // Get categories by transaction type
  const getCategories = (loai) => {
    if (loai === 'thu') return categories.filter(c => c.loai === 'thu');
    if (loai === 'chi') return categories.filter(c => c.loai === 'chi');
    return categories;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sổ quỹ</h1>
          <p className="text-gray-600">Quản lý thu chi & dòng tiền</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-5 h-5" />Xuất Excel
          </button>
          {viewMode === 'accounts' && (
            <button
              onClick={() => setShowAccountModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />Thêm tài khoản
            </button>
          )}
          {viewMode === 'transactions' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />Thêm giao dịch
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => { setViewMode('transactions'); setSelectedAccount(null); }}
              className={`px-6 py-3 font-medium ${
                viewMode === 'transactions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Giao dịch
            </button>
            <button
              onClick={() => setViewMode('accounts')}
              className={`px-6 py-3 font-medium ${
                viewMode === 'accounts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tài khoản
            </button>
          </div>
        </div>

        {viewMode === 'transactions' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium mb-2">Loại</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="all">Tất cả</option>
                  <option value="thu">Thu</option>
                  <option value="chi">Chi</option>
                  <option value="chuyen">Chuyển</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tài khoản</label>
                <select
                  value={selectedAccount?.id || ''}
                  onChange={(e) => {
                    const acc = accounts.find(a => a.id === parseInt(e.target.value));
                    setSelectedAccount(acc || null);
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Tất cả</option>
                  {cashSources.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.ten}</option>
                  ))}
                </select>
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

            {filteredTransactions.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <p className="text-green-100 text-sm">Tổng thu</p>
                  <p className="text-2xl font-bold mt-1">{(summary.thu / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                  <p className="text-red-100 text-sm">Tổng chi</p>
                  <p className="text-2xl font-bold mt-1">{(summary.chi / 1000000).toFixed(1)}M</p>
                </div>
                <div className={`bg-gradient-to-br ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white`}>
                  <p className={`${summary.balance >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm`}>Chênh lệch</p>
                  <p className="text-2xl font-bold mt-1">{(summary.balance / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nguồn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đối tượng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
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
                        {getSourceName(transaction.source_type, transaction.source_id)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div>
                          <div className="font-medium">{transaction.doi_tuong_ten || '-'}</div>
                          {transaction.thanh_toan_theo_phieu && (
                            <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                              <FileText className="w-3 h-3" />
                              {transaction.chi_tiet_phieu.length} phiếu
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: transaction.danh_muc_mau }}
                          />
                          <span>{transaction.danh_muc_ten}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{transaction.ly_do}</td>
                      <td className="px-4 py-4 text-sm text-right">
                        <span className={`font-bold ${
                          transaction.loai === 'thu' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.loai === 'thu' ? '+' : '-'}{transaction.so_tien.toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              if (transaction.thanh_toan_theo_phieu) {
                                alert(`Chi tiết phiếu:\n${transaction.chi_tiet_phieu.map(p => `- ${p.loai_phieu}: ${p.so_phieu} (${p.so_tien.toLocaleString('vi-VN')} đ)`).join('\n')}`);
                              }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction)}
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
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">Không có giao dịch nào</div>
            )}
          </div>
        )}

        {viewMode === 'accounts' && (
          <div className="p-4">
            <div className="grid gap-4">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className="border rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{account.ten}</h3>
                      <p className="text-sm text-gray-600 mt-1">{account.ghi_chu || 'Không có ghi chú'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Số dư</p>
                      <p className={`text-2xl font-bold ${account.so_du >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {account.so_du.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">Thêm tài khoản</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên tài khoản *</label>
                <input
                  type="text"
                  value={accountForm.ten}
                  onChange={(e) => setAccountForm({ ...accountForm, ten: e.target.value })}
                  placeholder="VD: Quỹ tiền mặt cửa hàng"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loại</label>
                  <select
                    value={accountForm.loai}
                    onChange={(e) => setAccountForm({ ...accountForm, loai: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="tien_mat">Tiền mặt</option>
                    <option value="quy">Quỹ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số dư ban đầu</label>
                  <input
                    type="number"
                    value={accountForm.so_du}
                    onChange={(e) => setAccountForm({ ...accountForm, so_du: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
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
                  setAccountForm({ ten: '', loai: 'tien_mat', so_du: 0, ghi_chu: '' });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddAccount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <h2 className="text-xl font-bold">Thêm giao dịch thu/chi</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Loại & Ngày */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loại giao dịch *</label>
                  <select
                    value={transactionForm.loai}
                    onChange={(e) => setTransactionForm({ ...transactionForm, loai: e.target.value, danh_muc_id: '' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="thu">Thu</option>
                    <option value="chi">Chi</option>
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
              </div>

              {/* Nguồn tiền */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {transactionForm.loai === 'chuyen' ? 'Từ tài khoản *' : 'Nguồn tiền *'}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="trans-source-cash"
                      checked={transactionForm.source_type === 'cash'}
                      onChange={() => setTransactionForm({ ...transactionForm, source_type: 'cash', source_id: '' })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="trans-source-cash" className="text-sm font-medium">Tiền mặt / Quỹ</label>
                  </div>
                  {transactionForm.source_type === 'cash' && (
                    <select
                      value={transactionForm.source_id}
                      onChange={(e) => setTransactionForm({ ...transactionForm, source_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg ml-6"
                    >
                      <option value="">Chọn tài khoản</option>
                      {cashSources.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.ten} ({acc.so_du.toLocaleString('vi-VN')} đ)
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="trans-source-bank"
                      checked={transactionForm.source_type === 'bank'}
                      onChange={() => setTransactionForm({ ...transactionForm, source_type: 'bank', source_id: '' })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="trans-source-bank" className="text-sm font-medium">Ngân hàng</label>
                  </div>
                  {transactionForm.source_type === 'bank' && (
                    <select
                      value={transactionForm.source_id}
                      onChange={(e) => setTransactionForm({ ...transactionForm, source_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg ml-6"
                    >
                      <option value="">Chọn tài khoản</option>
                      {bankSources.map(bank => (
                        <option key={bank.id} value={bank.id}>
                          {bank.ma} - {bank.so_tk} ({bank.ngan_hang})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Đến tài khoản (chỉ cho chuyển) */}
              {transactionForm.loai === 'chuyen' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Đến tài khoản *</label>
                  <select
                    value={transactionForm.target_id}
                    onChange={(e) => setTransactionForm({ ...transactionForm, target_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn tài khoản</option>
                    {cashSources
                      .filter(acc => acc.id !== parseInt(transactionForm.source_id))
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.ten}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Đối tượng */}
              {transactionForm.loai !== 'chuyen' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Đối tượng</label>
                    <select
                      value={transactionForm.doi_tuong_loai}
                      onChange={(e) => setTransactionForm({ ...transactionForm, doi_tuong_loai: e.target.value, doi_tuong_id: '', doi_tuong_ten: '' })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="khong">Không có (Thu/Chi khác)</option>
                      <option value="nha_cung_cap">Nhà cung cấp</option>
                      <option value="khach_hang">Khách hàng</option>
                      <option value="nhan_vien">Nhân viên</option>
                    </select>
                  </div>

                  {transactionForm.doi_tuong_loai === 'khong' ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">Tên đối tượng (Tùy chọn)</label>
                      <input
                        type="text"
                        value={transactionForm.doi_tuong_ten}
                        onChange={(e) => setTransactionForm({ ...transactionForm, doi_tuong_ten: e.target.value })}
                        placeholder="VD: Mua tạp vụ, Chi khác..."
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Chọn {transactionForm.doi_tuong_loai === 'nha_cung_cap' ? 'nhà cung cấp' : transactionForm.doi_tuong_loai === 'khach_hang' ? 'khách hàng' : 'nhân viên'} *
                      </label>
                      <select
                        value={transactionForm.doi_tuong_id}
                        onChange={(e) => setTransactionForm({ ...transactionForm, doi_tuong_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Chọn đối tượng</option>
                        {getObjects(transactionForm.doi_tuong_loai).map(obj => (
                          <option key={obj.id} value={obj.id}>
                            {obj.code} - {obj.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Danh mục */}
              {transactionForm.loai !== 'chuyen' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục *</label>
                  <select
                    value={transactionForm.danh_muc_id}
                    onChange={(e) => setTransactionForm({ ...transactionForm, danh_muc_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn danh mục</option>
                    {getCategories(transactionForm.loai).map(cat => (
                      <option key={cat.id} value={cat.ma}>
                        {cat.ten}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Chưa có danh mục. Vui lòng tạo ở menu "Loại Thu Chi"
                    </p>
                  )}
                </div>
              )}

              {/* Thanh toán theo phiếu */}
              {transactionForm.loai !== 'chuyen' && transactionForm.doi_tuong_loai !== 'khong' && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="thanh-toan-phieu"
                      checked={transactionForm.thanh_toan_theo_phieu}
                      onChange={(e) => setTransactionForm({ ...transactionForm, thanh_toan_theo_phieu: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="thanh-toan-phieu" className="text-sm font-medium">
                      {transactionForm.loai === 'thu' ? 'Thu tiền' : 'Thanh toán'} theo phiếu
                    </label>
                  </div>

                  {transactionForm.thanh_toan_theo_phieu && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowReceiptModal(true)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />Thêm phiếu
                      </button>

                      {transactionForm.chi_tiet_phieu.length > 0 && (
                        <div className="space-y-2">
                          {transactionForm.chi_tiet_phieu.map((phieu, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                              <div>
                                <div className="font-medium text-sm">
                                  {phieu.loai_phieu === 'hoa_don' ? '📄 Hóa đơn' : phieu.loai_phieu === 'don_hang' ? '📦 Đơn hàng' : '📋 Phiếu'}: {phieu.so_phieu}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {new Date(phieu.ngay_phieu).toLocaleDateString('vi-VN')} • {phieu.so_tien.toLocaleString('vi-VN')} đ
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveReceipt(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <div className="text-right font-semibold text-blue-600">
                            Tổng: {transactionForm.chi_tiet_phieu.reduce((sum, p) => sum + p.so_tien, 0).toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Số tiền */}
              <div>
                <label className="block text-sm font-medium mb-2">Số tiền *</label>
                <input
                  type="number"
                  value={transactionForm.so_tien}
                  onChange={(e) => setTransactionForm({ ...transactionForm, so_tien: e.target.value })}
                  placeholder="VD: 5000000"
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled={transactionForm.thanh_toan_theo_phieu && transactionForm.chi_tiet_phieu.length > 0}
                />
                {transactionForm.thanh_toan_theo_phieu && transactionForm.chi_tiet_phieu.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Số tiền tự động tính từ các phiếu đã thêm
                  </p>
                )}
              </div>

              {/* Lý do & Ghi chú */}
              <div>
                <label className="block text-sm font-medium mb-2">Lý do *</label>
                <input
                  type="text"
                  value={transactionForm.ly_do}
                  onChange={(e) => setTransactionForm({ ...transactionForm, ly_do: e.target.value })}
                  placeholder="VD: Thanh toán hóa đơn tháng 12..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={transactionForm.ghi_chu}
                  onChange={(e) => setTransactionForm({ ...transactionForm, ghi_chu: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setTransactionForm({
                    loai: 'chi',
                    source_type: 'cash',
                    source_id: '',
                    target_id: '',
                    ngay: new Date().toISOString().slice(0, 10),
                    so_tien: '',
                    doi_tuong_loai: 'khong',
                    doi_tuong_id: '',
                    doi_tuong_ten: '',
                    danh_muc_id: '',
                    thanh_toan_theo_phieu: false,
                    chi_tiet_phieu: [],
                    ly_do: '',
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
                Thêm giao dịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">Thêm phiếu</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loại phiếu *</label>
                  <select
                    value={receiptForm.loai_phieu}
                    onChange={(e) => setReceiptForm({ ...receiptForm, loai_phieu: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="hoa_don">Hóa đơn</option>
                    <option value="don_hang">Đơn hàng</option>
                    <option value="phieu_nhap_kho">Phiếu nhập kho</option>
                    <option value="phieu_xuat_kho">Phiếu xuất kho</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số phiếu *</label>
                  <input
                    type="text"
                    value={receiptForm.so_phieu}
                    onChange={(e) => setReceiptForm({ ...receiptForm, so_phieu: e.target.value })}
                    placeholder="VD: HD001"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày phiếu *</label>
                  <input
                    type="date"
                    value={receiptForm.ngay_phieu}
                    onChange={(e) => setReceiptForm({ ...receiptForm, ngay_phieu: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số tiền *</label>
                  <input
                    type="number"
                    value={receiptForm.so_tien}
                    onChange={(e) => setReceiptForm({ ...receiptForm, so_tien: e.target.value })}
                    placeholder="VD: 5000000"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <input
                  type="text"
                  value={receiptForm.ghi_chu}
                  onChange={(e) => setReceiptForm({ ...receiptForm, ghi_chu: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptForm({
                    loai_phieu: 'hoa_don',
                    so_phieu: '',
                    ngay_phieu: new Date().toISOString().slice(0, 10),
                    so_tien: '',
                    ghi_chu: ''
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddReceipt}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashBook;
