import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, TrendingDown, TrendingUp, DollarSign, Calendar, FileText, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function AdvanceTransaction() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    return saved ? JSON.parse(saved) : [];
  };

  const loadCashAccounts = () => {
    const saved = localStorage.getItem('cash_accounts');
    return saved ? JSON.parse(saved) : [];
  };

  const loadCashTransactions = () => {
    const saved = localStorage.getItem('cash_transactions');
    return saved ? JSON.parse(saved) : [];
  };

  const loadAdvanceTransactions = () => {
    const saved = localStorage.getItem('advance_transactions');
    return saved ? JSON.parse(saved) : [];
  };

  const loadSettlements = () => {
    const saved = localStorage.getItem('advance_settlements');
    return saved ? JSON.parse(saved) : [];
  };

  const [employees] = useState(loadEmployees);
  const [cashAccounts, setCashAccounts] = useState(loadCashAccounts);
  const [cashTransactions, setCashTransactions] = useState(loadCashTransactions);
  const [transactions, setTransactions] = useState(loadAdvanceTransactions);
  const [settlements, setSettlements] = useState(loadSettlements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showBatchRefundModal, setShowBatchRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [addForm, setAddForm] = useState({
    type: 'chi',
    emp_id: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    reason: 'Mua vật tư',
    account_id: '',
    note: ''
  });

  const [settlementForm, setSettlementForm] = useState({
    items: [
      { category: 'chi_phi_co_dinh', amount: 0 },
      { category: 'chi_phi_san_xuat', amount: 0 },
      { category: 'chi_phi_nguyen_vat_lieu', amount: 0 },
      { category: 'chi_phi_sua_may', amount: 0 },
      { category: 'chi_phi_van_chuyen', amount: 0 },
      { category: 'chi_phi_khac', amount: 0 }
    ],
    remaining_action: 'hoan_quy',
    account_id: '',
    note: ''
  });

  const expenseCategories = {
    chi_phi_co_dinh: 'Chi phí cố định',
    chi_phi_san_xuat: 'Chi phí sản xuất',
    chi_phi_nguyen_vat_lieu: 'Chi phí nguyên vật liệu',
    chi_phi_sua_may: 'Chi phí sửa máy móc',
    chi_phi_van_chuyen: 'Chi phí vận chuyển',
    chi_phi_khac: 'Chi phí khác'
  };

  useEffect(() => {
    localStorage.setItem('advance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('advance_settlements', JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem('cash_accounts', JSON.stringify(cashAccounts));
  }, [cashAccounts]);

  useEffect(() => {
    localStorage.setItem('cash_transactions', JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.code} - ${emp.name}` : 'N/A';
  };

  const getAccountName = (accountId) => {
    const account = cashAccounts.find(acc => acc.id === accountId);
    return account ? account.ten : 'N/A';
  };

  const handleAddTransaction = () => {
    if (!addForm.emp_id || !addForm.amount || !addForm.account_id) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const amount = parseFloat(addForm.amount);
    if (amount <= 0) {
      alert('Số tiền phải lớn hơn 0!');
      return;
    }

    const account = cashAccounts.find(acc => acc.id === parseInt(addForm.account_id));
    
    if (addForm.type === 'chi' && account.so_du < amount) {
      alert(`Số dư không đủ!\nSố dư: ${account.so_du.toLocaleString('vi-VN')} đ\nCần: ${amount.toLocaleString('vi-VN')} đ`);
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type: addForm.type,
      emp_id: parseInt(addForm.emp_id),
      amount: amount,
      date: addForm.date,
      reason: addForm.reason,
      account_id: parseInt(addForm.account_id),
      status: 'chua_quyet_toan',
      note: addForm.note,
      created_date: new Date().toISOString()
    };

    // Update cash account
    const updatedAccounts = cashAccounts.map(acc => {
      if (acc.id === parseInt(addForm.account_id)) {
        return {
          ...acc,
          so_du: addForm.type === 'chi' ? acc.so_du - amount : acc.so_du + amount
        };
      }
      return acc;
    });
    setCashAccounts(updatedAccounts);

    // Create cash transaction
    const cashTransaction = {
      id: Date.now() + 1,
      tai_khoan_id: parseInt(addForm.account_id),
      ngay: addForm.date,
      loai: addForm.type === 'chi' ? 'chi' : 'thu',
      danh_muc: 'tam_ung_nv',
      doi_tuong: getEmployeeName(parseInt(addForm.emp_id)),
      ten_doi_tuong: getEmployeeName(parseInt(addForm.emp_id)),
      so_tien: amount,
      ly_do: addForm.reason,
      ghi_chu: `Tạm ứng - ${addForm.note}`,
      nguoi_tao: 'Admin',
      ngay_tao: new Date().toISOString()
    };
    setCashTransactions([...cashTransactions, cashTransaction]);

    setTransactions([...transactions, newTransaction]);
    setShowAddModal(false);
    setAddForm({
      type: 'chi',
      emp_id: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      reason: 'Mua vật tư',
      account_id: '',
      note: ''
    });
    alert(`Đã ${addForm.type === 'chi' ? 'chi' : 'thu'} tạm ứng thành công!`);
  };

  const handleSettlement = () => {
    if (!selectedTransaction) return;

    const totalSpent = settlementForm.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const remaining = selectedTransaction.amount - totalSpent;

    if (totalSpent > selectedTransaction.amount) {
      alert('Tổng chi vượt quá số tiền tạm ứng!');
      return;
    }

    if (remaining > 0 && !settlementForm.account_id) {
      alert('Vui lòng chọn tài khoản để hoàn tiền!');
      return;
    }

    const newSettlement = {
      id: Date.now(),
      transaction_id: selectedTransaction.id,
      settlement_date: new Date().toISOString().slice(0, 10),
      items: settlementForm.items.filter(item => item.amount > 0),
      total_spent: totalSpent,
      remaining: remaining,
      remaining_action: settlementForm.remaining_action,
      account_id: settlementForm.account_id ? parseInt(settlementForm.account_id) : null,
      note: settlementForm.note,
      created_date: new Date().toISOString()
    };

    setSettlements([...settlements, newSettlement]);

    // Update transaction status
    setTransactions(transactions.map(t =>
      t.id === selectedTransaction.id
        ? { ...t, status: 'da_quyet_toan' }
        : t
    ));

    // Refund to cash account if needed
    if (remaining > 0 && settlementForm.remaining_action === 'hoan_quy') {
      const updatedAccounts = cashAccounts.map(acc => {
        if (acc.id === parseInt(settlementForm.account_id)) {
          return { ...acc, so_du: acc.so_du + remaining };
        }
        return acc;
      });
      setCashAccounts(updatedAccounts);

      // Create refund cash transaction
      const refundTransaction = {
        id: Date.now() + 1,
        tai_khoan_id: parseInt(settlementForm.account_id),
        ngay: new Date().toISOString().slice(0, 10),
        loai: 'thu',
        danh_muc: 'tam_ung_nv',
        doi_tuong: getEmployeeName(selectedTransaction.emp_id),
        ten_doi_tuong: getEmployeeName(selectedTransaction.emp_id),
        so_tien: remaining,
        ly_do: `Hoàn tạm ứng - ${selectedTransaction.reason}`,
        ghi_chu: settlementForm.note,
        nguoi_tao: 'Admin',
        ngay_tao: new Date().toISOString()
      };
      setCashTransactions([...cashTransactions, refundTransaction]);
    }

    setShowSettlementModal(false);
    setSelectedTransaction(null);
    setSettlementForm({
      items: [
        { category: 'chi_phi_co_dinh', amount: 0 },
        { category: 'chi_phi_san_xuat', amount: 0 },
        { category: 'chi_phi_nguyen_vat_lieu', amount: 0 },
        { category: 'chi_phi_sua_may', amount: 0 },
        { category: 'chi_phi_van_chuyen', amount: 0 },
        { category: 'chi_phi_khac', amount: 0 }
      ],
      remaining_action: 'hoan_quy',
      account_id: '',
      note: ''
    });
    alert('Đã quyết toán thành công!');
  };

  const handleBatchRefund = (empId) => {
    const empTransactions = transactions.filter(t =>
      t.emp_id === empId &&
      t.type === 'chi' &&
      t.status === 'chua_quyet_toan'
    );

    setSelectedEmployee(empId);
    setShowBatchRefundModal(true);
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

        const newItems = settlementForm.items.map(item => {
          const row = jsonData.find(r => r['Loại chi phí'] === expenseCategories[item.category]);
          return {
            category: item.category,
            amount: row ? parseFloat(row['Số tiền']) || 0 : 0
          };
        });

        setSettlementForm({ ...settlementForm, items: newItems });
        alert('Đã nhập dữ liệu từ Excel!');
      } catch (error) {
        alert('Lỗi đọc file Excel!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportTemplate = () => {
    const data = Object.entries(expenseCategories).map(([key, value]) => ({
      'Loại chi phí': value,
      'Số tiền': 0
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Mau-quyet-toan.xlsx');
  };

  const getSummary = () => {
    const monthTransactions = filteredTransactions;
    const totalChi = monthTransactions.filter(t => t.type === 'chi').reduce((sum, t) => sum + t.amount, 0);
    const totalThu = monthTransactions.filter(t => t.type === 'thu').reduce((sum, t) => sum + t.amount, 0);
    const chuaQuyetToan = monthTransactions.filter(t => t.status === 'chua_quyet_toan').reduce((sum, t) => sum + t.amount, 0);
    const daQuyetToan = monthTransactions.filter(t => t.status === 'da_quyet_toan').reduce((sum, t) => sum + t.amount, 0);

    return { totalChi, totalThu, chuaQuyetToan, daQuyetToan, count: monthTransactions.length };
  };

  const filteredTransactions = transactions.filter(t => {
    if (!t.date.startsWith(filterMonth)) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (!searchTerm) return true;

    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const empName = getEmployeeName(t.emp_id);
    const searchableFields = [empName, t.reason || '', t.note || ''];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Giao dịch tạm ứng</h1>
          <p className="text-gray-600">Quản lý tạm ứng mua hàng & thu chi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm giao dịch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Tất cả</option>
              <option value="chua_quyet_toan">Chưa quyết toán</option>
              <option value="da_quyet_toan">Đã quyết toán</option>
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
                placeholder="Nhân viên, lý do..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Tổng chi</p>
                <p className="text-2xl font-bold mt-1">{(summary.totalChi / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tổng thu</p>
                <p className="text-2xl font-bold mt-1">{(summary.totalThu / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Chưa quyết toán</p>
                <p className="text-2xl font-bold mt-1">{(summary.chuaQuyetToan / 1000000).toFixed(1)}M</p>
              </div>
              <Calendar className="w-12 h-12 text-orange-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Đã quyết toán</p>
                <p className="text-2xl font-bold mt-1">{(summary.daQuyetToan / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">
                    {new Date(transaction.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'chi'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.type === 'chi' ? 'Chi' : 'Thu'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">{getEmployeeName(transaction.emp_id)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{transaction.reason}</td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className={`font-bold ${
                      transaction.type === 'chi' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'chi' ? '-' : '+'}{transaction.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'chua_quyet_toan'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.status === 'chua_quyet_toan' ? 'Chưa quyết toán' : 'Đã quyết toán'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      {transaction.type === 'chi' && transaction.status === 'chua_quyet_toan' && (
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowSettlementModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Quyết toán"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {transaction.status === 'da_quyet_toan' && (
                        <button
                          onClick={() => {
                            const settlement = settlements.find(s => s.transaction_id === transaction.id);
                            if (settlement) {
                              alert(`Đã quyết toán:\nTổng chi: ${settlement.total_spent.toLocaleString('vi-VN')} đ\nCòn lại: ${settlement.remaining.toLocaleString('vi-VN')} đ`);
                            }
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
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

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">Thêm giao dịch tạm ứng</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loại giao dịch *</label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="chi">Chi tạm ứng</option>
                    <option value="thu">Thu tiền</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày *</label>
                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nhân viên *</label>
                  <select
                    value={addForm.emp_id}
                    onChange={(e) => setAddForm({ ...addForm, emp_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.filter(e => e.status !== 'Nghỉ việc').map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.code} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số tiền *</label>
                  <input
                    type="number"
                    value={addForm.amount}
                    onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                    placeholder="VD: 10000000"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lý do *</label>
                <input
                  type="text"
                  value={addForm.reason}
                  onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                  placeholder="Mua vật tư, Đi công tác..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tài khoản *</label>
                <select
                  value={addForm.account_id}
                  onChange={(e) => setAddForm({ ...addForm, account_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Chọn tài khoản</option>
                  {cashAccounts.filter(acc => acc.trang_thai === 'active').map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.ten} ({acc.so_du.toLocaleString('vi-VN')} đ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={addForm.note}
                  onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({
                    type: 'chi',
                    emp_id: '',
                    amount: '',
                    date: new Date().toISOString().slice(0, 10),
                    reason: 'Mua vật tư',
                    account_id: '',
                    note: ''
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

      {/* Settlement Modal */}
      {showSettlementModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h2 className="text-xl font-bold">Quyết toán tạm ứng</h2>
              <p className="text-sm text-gray-600">
                {getEmployeeName(selectedTransaction.emp_id)} - {selectedTransaction.amount.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Chi tiết chi phí</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportTemplate}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />Tải mẫu
                  </button>
                  <label className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 cursor-pointer">
                    <Upload className="w-4 h-4" />Nhập Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleImportExcel}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {settlementForm.items.map((item, index) => (
                <div key={item.category} className="grid grid-cols-2 gap-4 items-center">
                  <label className="text-sm font-medium">{expenseCategories[item.category]}</label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => {
                      const newItems = [...settlementForm.items];
                      newItems[index].amount = parseFloat(e.target.value) || 0;
                      setSettlementForm({ ...settlementForm, items: newItems });
                    }}
                    className="px-4 py-2 border rounded-lg"
                    placeholder="0"
                  />
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Tổng chi:</span>
                  <span className="text-blue-600">
                    {settlementForm.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Còn lại:</span>
                  <span className="text-green-600">
                    {(selectedTransaction.amount - settlementForm.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {(selectedTransaction.amount - settlementForm.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)) > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Xử lý số dư</label>
                    <select
                      value={settlementForm.remaining_action}
                      onChange={(e) => setSettlementForm({ ...settlementForm, remaining_action: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="hoan_quy">Hoàn lại quỹ</option>
                      <option value="giu_lai">Giữ lại tiếp</option>
                      <option value="chi_phi_khac">Ghi nhận chi phí khác</option>
                    </select>
                  </div>

                  {settlementForm.remaining_action === 'hoan_quy' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Hoàn vào tài khoản *</label>
                      <select
                        value={settlementForm.account_id}
                        onChange={(e) => setSettlementForm({ ...settlementForm, account_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Chọn tài khoản</option>
                        {cashAccounts.filter(acc => acc.trang_thai === 'active').map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.ten}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={settlementForm.note}
                  onChange={(e) => setSettlementForm({ ...settlementForm, note: e.target.value })}
                  placeholder="Ghi chú về quyết toán..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSettlementModal(false);
                  setSelectedTransaction(null);
                  setSettlementForm({
                    items: [
                      { category: 'chi_phi_co_dinh', amount: 0 },
                      { category: 'chi_phi_san_xuat', amount: 0 },
                      { category: 'chi_phi_nguyen_vat_lieu', amount: 0 },
                      { category: 'chi_phi_sua_may', amount: 0 },
                      { category: 'chi_phi_van_chuyen', amount: 0 },
                      { category: 'chi_phi_khac', amount: 0 }
                    ],
                    remaining_action: 'hoan_quy',
                    account_id: '',
                    note: ''
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSettlement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Quyết toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvanceTransaction;
