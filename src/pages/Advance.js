import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, TrendingDown, DollarSign, Calendar, Wallet } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Advance() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    return saved ? JSON.parse(saved) : [];
  };

  const loadBankAccounts = () => {
    const saved = localStorage.getItem('bank_accounts');
    return saved ? JSON.parse(saved) : [];
  };

  const loadCashAccounts = () => {
    const saved = localStorage.getItem('cash_accounts');
    return saved ? JSON.parse(saved) : [];
  };

  const loadAdvances = () => {
    const saved = localStorage.getItem('advance_payment');
    return saved ? JSON.parse(saved) : [];
  };

  const [employees] = useState(loadEmployees);
  const [bankAccounts] = useState(loadBankAccounts);
  const [cashAccounts, setCashAccounts] = useState(loadCashAccounts);
  const [advances, setAdvances] = useState(loadAdvances);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);

  const [form, setForm] = useState({
    emp_id: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    reason: 'Ứng lương',
    month: new Date().toISOString().slice(0, 7),
    approver: '',
    note: '',
    source_type: 'cash', // 'cash' hoặc 'bank'
    source_id: ''
  });

  useEffect(() => {
    localStorage.setItem('advance_payment', JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem('cash_accounts', JSON.stringify(cashAccounts));
  }, [cashAccounts]);

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.code} - ${emp.name}` : 'N/A';
  };

  const getEmployeeCode = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.code : 'N/A';
  };

  const getSourceName = (sourceType, sourceId) => {
    if (sourceType === 'cash') {
      const acc = cashAccounts.find(a => a.id === sourceId);
      return acc ? acc.ten : 'Tiền mặt';
    } else {
      const bank = bankAccounts.find(b => b.id === sourceId);
      return bank ? `${bank.ma} (${bank.so_tk})` : 'N/A';
    }
  };

  const handleSubmit = () => {
    if (!form.emp_id || !form.amount || !form.reason.trim()) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!form.source_id) {
      alert('Vui lòng chọn nguồn tiền!');
      return;
    }

    const amount = parseFloat(form.amount);
    if (amount <= 0) {
      alert('Số tiền phải lớn hơn 0!');
      return;
    }

    // Check balance
    if (form.source_type === 'cash') {
      const cashAccount = cashAccounts.find(a => a.id === parseInt(form.source_id));
      if (cashAccount && cashAccount.so_du < amount) {
        alert(`Số dư không đủ!\nSố dư: ${cashAccount.so_du.toLocaleString('vi-VN')} đ`);
        return;
      }
    }

    if (editingAdvance) {
      // Return old money first
      if (editingAdvance.source_type === 'cash') {
        setCashAccounts(cashAccounts.map(acc =>
          acc.id === editingAdvance.source_id
            ? { ...acc, so_du: acc.so_du + editingAdvance.amount }
            : acc
        ));
      }

      // Deduct new money
      if (form.source_type === 'cash') {
        setCashAccounts(cashAccounts.map(acc =>
          acc.id === parseInt(form.source_id)
            ? { ...acc, so_du: acc.so_du - amount }
            : acc
        ));
      }

      setAdvances(advances.map(adv =>
        adv.id === editingAdvance.id
          ? {
              ...adv,
              emp_id: parseInt(form.emp_id),
              date: form.date,
              amount: amount,
              reason: form.reason,
              month: form.month,
              approver: form.approver,
              note: form.note,
              source_type: form.source_type,
              source_id: parseInt(form.source_id)
            }
          : adv
      ));
      alert('Đã cập nhật ứng lương!');
    } else {
      // Deduct money
      if (form.source_type === 'cash') {
        setCashAccounts(cashAccounts.map(acc =>
          acc.id === parseInt(form.source_id)
            ? { ...acc, so_du: acc.so_du - amount }
            : acc
        ));
      }

      const newAdvance = {
        id: Date.now(),
        emp_id: parseInt(form.emp_id),
        date: form.date,
        amount: amount,
        reason: form.reason,
        month: form.month,
        status: 'chua_tru',
        approver: form.approver,
        note: form.note,
        source_type: form.source_type,
        source_id: parseInt(form.source_id),
        created_date: new Date().toISOString()
      };
      setAdvances([...advances, newAdvance]);
      alert('Đã thêm ứng lương!');
    }

    setShowModal(false);
    setEditingAdvance(null);
    setForm({
      emp_id: '',
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      reason: 'Ứng lương',
      month: new Date().toISOString().slice(0, 7),
      approver: '',
      note: '',
      source_type: 'cash',
      source_id: ''
    });
  };

  const handleEdit = (advance) => {
    setEditingAdvance(advance);
    setForm({
      emp_id: advance.emp_id.toString(),
      date: advance.date,
      amount: advance.amount,
      reason: advance.reason,
      month: advance.month,
      approver: advance.approver || '',
      note: advance.note || '',
      source_type: advance.source_type || 'cash',
      source_id: advance.source_id ? advance.source_id.toString() : ''
    });
    setShowModal(true);
  };

  const handleDelete = (advance) => {
    if (window.confirm('Xóa ứng lương này?')) {
      // Return money
      if (advance.source_type === 'cash') {
        setCashAccounts(cashAccounts.map(acc =>
          acc.id === advance.source_id
            ? { ...acc, so_du: acc.so_du + advance.amount }
            : acc
        ));
      }
      setAdvances(advances.filter(adv => adv.id !== advance.id));
    }
  };

  const getSummary = () => {
    const monthAdvances = filteredAdvances.filter(adv => adv.month === filterMonth);
    const total = monthAdvances.reduce((sum, adv) => sum + adv.amount, 0);
    const chuaTru = monthAdvances.filter(adv => adv.status === 'chua_tru').reduce((sum, adv) => sum + adv.amount, 0);
    const daTru = monthAdvances.filter(adv => adv.status === 'da_tru').reduce((sum, adv) => sum + adv.amount, 0);
    return { total, chuaTru, daTru, count: monthAdvances.length };
  };

  const filteredAdvances = advances.filter(adv => {
    if (adv.month !== filterMonth) return false;
    if (!searchTerm) return true;
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const empName = getEmployeeName(adv.emp_id);
    const empCode = getEmployeeCode(adv.emp_id);
    const searchableFields = [empName, empCode, adv.reason || ''];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const summary = getSummary();

  // Get all payment sources
  const cashSources = cashAccounts.filter(acc => acc.trang_thai === 'active');
  const bankSources = bankAccounts.filter(bank => bank.trang_thai === 'active');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ứng lương</h1>
          <p className="text-gray-600">Quản lý ứng lương nhân viên</p>
        </div>
        <button
          onClick={() => {
            setEditingAdvance(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm ứng lương
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-2 gap-4">
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
                placeholder="Mã NV, tên, lý do..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredAdvances.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Số giao dịch</p>
                <p className="text-3xl font-bold mt-1">{summary.count}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Tổng ứng</p>
                <p className="text-2xl font-bold mt-1">{(summary.total / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Chưa trừ</p>
                <p className="text-2xl font-bold mt-1">{(summary.chuaTru / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingDown className="w-12 h-12 text-orange-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Đã trừ</p>
                <p className="text-2xl font-bold mt-1">{(summary.daTru / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nguồn tiền</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tháng trừ</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAdvances.map(advance => {
                const emp = employees.find(e => e.id === advance.emp_id);
                return (
                  <tr key={advance.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      {new Date(advance.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-blue-600">
                      {emp?.code}
                    </td>
                    <td className="px-4 py-4 text-sm">{emp?.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{advance.reason}</td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-bold">
                        {advance.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Wallet className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {getSourceName(advance.source_type, advance.source_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {advance.month}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(advance)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(advance)}
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
        {filteredAdvances.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không có ứng lương nào trong tháng này
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {editingAdvance ? 'Sửa ứng lương' : 'Thêm ứng lương'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nhân viên *</label>
                  <select
                    value={form.emp_id}
                    onChange={(e) => setForm({ ...form, emp_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees
                      .filter(emp => emp.status !== 'Nghỉ việc')
                      .map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.code} - {emp.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Số tiền *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="VD: 2000000"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lý do *</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="VD: Ứng lương, Khó khăn tạm thời..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nguồn tiền *</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="source-cash"
                      checked={form.source_type === 'cash'}
                      onChange={() => setForm({ ...form, source_type: 'cash', source_id: '' })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="source-cash" className="text-sm font-medium">Tiền mặt / Quỹ</label>
                  </div>
                  {form.source_type === 'cash' && (
                    <select
                      value={form.source_id}
                      onChange={(e) => setForm({ ...form, source_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg ml-6"
                    >
                      <option value="">Chọn quỹ</option>
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
                      id="source-bank"
                      checked={form.source_type === 'bank'}
                      onChange={() => setForm({ ...form, source_type: 'bank', source_id: '' })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="source-bank" className="text-sm font-medium">Ngân hàng</label>
                  </div>
                  {form.source_type === 'bank' && (
                    <select
                      value={form.source_id}
                      onChange={(e) => setForm({ ...form, source_id: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tháng trừ lương *</label>
                  <input
                    type="month"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Tự động trừ vào lương tháng này
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Người duyệt</label>
                  <input
                    type="text"
                    value={form.approver}
                    onChange={(e) => setForm({ ...form, approver: e.target.value })}
                    placeholder="VD: Giám đốc, Quản lý..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAdvance(null);
                  setForm({
                    emp_id: '',
                    date: new Date().toISOString().slice(0, 10),
                    amount: '',
                    reason: 'Ứng lương',
                    month: new Date().toISOString().slice(0, 7),
                    approver: '',
                    note: '',
                    source_type: 'cash',
                    source_id: ''
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
                {editingAdvance ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Advance;
