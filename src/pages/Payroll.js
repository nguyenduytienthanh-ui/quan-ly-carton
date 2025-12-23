import React, { useState, useEffect } from 'react';
import { Search, Eye, Lock, Unlock, Download, Printer, TrendingUp, TrendingDown, DollarSign, Calculator, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Payroll() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    return saved ? JSON.parse(saved) : [];
  };

  const loadAllowances = () => {
    const saved = localStorage.getItem('employee_allowances');
    return saved ? JSON.parse(saved) : [];
  };

  const loadBonusPenalty = () => {
    const saved = localStorage.getItem('bonus_penalty');
    return saved ? JSON.parse(saved) : [];
  };

  const loadAttendance = () => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  };

  const loadAdvanceTransaction = () => {
    const saved = localStorage.getItem('advance_transaction');
    return saved ? JSON.parse(saved) : [];
  };

  const loadPayroll = () => {
    const saved = localStorage.getItem('payroll');
    if (saved) return JSON.parse(saved);
    return [];
  };

  const [employees] = useState(loadEmployees);
  const [allowances] = useState(loadAllowances);
  const [bonusPenalty] = useState(loadBonusPenalty);
  const [attendance] = useState(loadAttendance);
  const [advanceTransaction, setAdvanceTransaction] = useState(loadAdvanceTransaction);
  const [payroll, setPayroll] = useState(loadPayroll);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printingPayslip, setPrintingPayslip] = useState(null);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertingPayslip, setRevertingPayslip] = useState(null);
  const [revertReason, setRevertReason] = useState('');

  // Insurance configuration
  const [insuranceConfig] = useState({
    employee_social: 8.0,
    employee_health: 1.5,
    employee_unemployment: 1.0,
    company_social: 17.5,
    company_health: 3.0,
    company_unemployment: 1.0,
    max_salary: 234880000
  });

  useEffect(() => {
    localStorage.setItem('payroll', JSON.stringify(payroll));
  }, [payroll]);

  useEffect(() => {
    localStorage.setItem('advance_transaction', JSON.stringify(advanceTransaction));
  }, [advanceTransaction]);

  // Calculate seniority allowance (0.5% per year)
  const calculateSeniorityAllowance = (basicSalary, startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(basicSalary * years * 0.005);
  };

  // Calculate total allowances for an employee
  const calculateAllowances = (empId, actualDays, standardDays) => {
    const empAllowances = allowances.filter(a => a.emp_id === empId);
    let total = 0;

    empAllowances.forEach(a => {
      const calculationType = a.calculation_type || 'daily_ratio';
      if (calculationType === 'fixed') {
        total += a.amount;
      } else {
        total += a.amount * (actualDays / standardDays);
      }
    });

    return Math.floor(total);
  };

  // Calculate insurance base salary
  const calculateInsuranceBase = (empId, basicSalary) => {
    const empAllowances = allowances.filter(a => a.emp_id === empId);
    let insuranceBase = basicSalary;

    empAllowances.forEach(a => {
      if (a.include_in_insurance || a.tinh_bhxh) {
        insuranceBase += a.amount;
      }
    });

    if (insuranceConfig.max_salary && insuranceBase > insuranceConfig.max_salary) {
      insuranceBase = insuranceConfig.max_salary;
    }

    return insuranceBase;
  };

  // Calculate overtime pay
  const calculateOvertimePay = (empId, basicSalary, standardDays) => {
    const empAttendance = attendance.find(a => a.emp_id === empId && a.month === selectedMonth);
    if (!empAttendance || !empAttendance.overtime || empAttendance.overtime.length === 0) {
      return 0;
    }

    const hourlyRate = basicSalary / (standardDays * 8);
    let totalOvertimePay = 0;

    empAttendance.overtime.forEach(ot => {
      totalOvertimePay += hourlyRate * ot.hours * ot.rate;
    });

    return Math.floor(totalOvertimePay);
  };

  // Calculate bonus and penalty
  const calculateBonusAndPenalty = (empId, actualDays, standardDays) => {
    const items = bonusPenalty.filter(item => item.emp_id === empId && item.month === selectedMonth);
    let totalBonus = 0;
    let totalPenalty = 0;

    items.forEach(item => {
      let amount = item.amount;
      
      if (item.calculation_type === 'daily_ratio') {
        amount = amount * (actualDays / standardDays);
      }

      if (item.type === 'bonus') {
        totalBonus += amount;
      } else {
        totalPenalty += amount;
      }
    });

    return { 
      totalBonus: Math.floor(totalBonus), 
      totalPenalty: Math.floor(totalPenalty) 
    };
  };

  // Calculate advance deduction from advance_transaction
  const calculateAdvanceDeduction = (empId) => {
    const empTransactions = advanceTransaction.filter(t => 
      t.ma_nv === empId && 
      t.tru_luong === true &&
      t.thang_tru === selectedMonth
    );
    
    let total = 0;
    empTransactions.forEach(t => {
      if (t.loai === 'chi') {
        total += t.so_tien;
      } else {
        total -= t.so_tien;
      }
    });
    
    return total;
  };

  // Main calculation function
  const calculatePayrollForEmployee = (employee) => {
    const empAttendance = attendance.find(a => a.emp_id === employee.id && a.month === selectedMonth);
    
    if (!empAttendance) {
      return null;
    }

    const standardDays = empAttendance.standard_days;
    const actualDays = empAttendance.actual_days;
    const basicSalary = employee.salary_basic;
    const isProbation = employee.status === 'Thử việc';

    const salaryByAttendance = Math.floor(basicSalary * (actualDays / standardDays));
    const totalAllowances = calculateAllowances(employee.id, actualDays, standardDays);
    const seniorityAllowance = calculateSeniorityAllowance(basicSalary, employee.start_date);
    const overtimePay = calculateOvertimePay(employee.id, basicSalary, standardDays);
    const { totalBonus, totalPenalty } = calculateBonusAndPenalty(employee.id, actualDays, standardDays);
    const totalIncome = salaryByAttendance + totalAllowances + seniorityAllowance + overtimePay + totalBonus;

    let insuranceDeductions = {
      social: 0,
      health: 0,
      unemployment: 0,
      total: 0
    };

    if (!isProbation) {
      const insuranceBase = calculateInsuranceBase(employee.id, basicSalary);
      insuranceDeductions = {
        social: Math.floor(insuranceBase * insuranceConfig.employee_social / 100),
        health: Math.floor(insuranceBase * insuranceConfig.employee_health / 100),
        unemployment: Math.floor(insuranceBase * insuranceConfig.employee_unemployment / 100),
        total: 0
      };
      insuranceDeductions.total = insuranceDeductions.social + insuranceDeductions.health + insuranceDeductions.unemployment;
    }

    const advanceDeduction = calculateAdvanceDeduction(employee.id);
    const totalDeductions = insuranceDeductions.total + totalPenalty + advanceDeduction;
    const netPay = totalIncome - totalDeductions;

    return {
      id: Date.now() + Math.random(),
      month: selectedMonth,
      emp_id: employee.id,
      emp_code: employee.code,
      emp_name: employee.name,
      emp_position: employee.position || '',
      emp_department: employee.department || '',
      
      standard_days: standardDays,
      actual_days: actualDays,
      
      basic_salary: basicSalary,
      salary_by_attendance: salaryByAttendance,
      total_allowances: totalAllowances,
      seniority_allowance: seniorityAllowance,
      overtime_pay: overtimePay,
      total_bonus: totalBonus,
      total_income: totalIncome,
      
      insurance_social: insuranceDeductions.social,
      insurance_health: insuranceDeductions.health,
      insurance_unemployment: insuranceDeductions.unemployment,
      insurance_total: insuranceDeductions.total,
      total_penalty: totalPenalty,
      advance_deduction: advanceDeduction,
      total_deductions: totalDeductions,
      
      net_pay: netPay,
      
      advance_reverted: false,
      advance_revert_reason: '',
      advance_revert_date: null,
      advance_revert_by: '',
      
      status: 'unlocked',
      created_date: new Date().toISOString(),
      note: ''
    };
  };

  // Calculate payroll for all employees
  const handleCalculatePayroll = () => {
    const existingPayroll = payroll.filter(p => p.month === selectedMonth);
    if (existingPayroll.length > 0) {
      if (!window.confirm(`Đã có bảng lương tháng ${selectedMonth}. Tính lại?`)) {
        return;
      }
      setPayroll(payroll.filter(p => p.month !== selectedMonth));
    }

    const newPayrollRecords = [];
    
    employees.forEach(emp => {
      if (emp.status === 'Nghỉ việc') return;
      
      const payrollRecord = calculatePayrollForEmployee(emp);
      if (payrollRecord) {
        newPayrollRecords.push(payrollRecord);
      }
    });

    if (newPayrollRecords.length === 0) {
      alert('Không có dữ liệu chấm công cho tháng này!');
      return;
    }

    // Auto deduct advances
    const updatedTransactions = advanceTransaction.map(t => {
      if (t.tru_luong && t.thang_tru === selectedMonth && t.trang_thai === 'chua_tru') {
        return { ...t, trang_thai: 'da_tru' };
      }
      return t;
    });
    setAdvanceTransaction(updatedTransactions);

    setPayroll([...payroll.filter(p => p.month !== selectedMonth), ...newPayrollRecords]);
    alert(`Đã tính lương cho ${newPayrollRecords.length} nhân viên!`);
  };

  // Revert advance deduction
  const handleRevertAdvance = () => {
    if (!revertReason.trim()) {
      alert('Vui lòng nhập lý do hỗ trợ!');
      return;
    }

    const record = revertingPayslip;
    
    // Update payroll record
    const updatedPayroll = payroll.map(p => {
      if (p.id === record.id) {
        const newNetPay = p.net_pay + p.advance_deduction;
        return {
          ...p,
          advance_deduction: 0,
          total_deductions: p.total_deductions - p.advance_deduction,
          net_pay: newNetPay,
          advance_reverted: true,
          advance_revert_reason: revertReason,
          advance_revert_date: new Date().toISOString(),
          advance_revert_by: 'Admin'
        };
      }
      return p;
    });
    setPayroll(updatedPayroll);

    // Revert advance transactions
    const updatedTransactions = advanceTransaction.map(t => {
      if (t.ma_nv === record.emp_id && t.tru_luong && t.thang_tru === selectedMonth) {
        return { 
          ...t, 
          trang_thai: 'chua_tru',
          reverted: true,
          revert_reason: revertReason,
          revert_date: new Date().toISOString()
        };
      }
      return t;
    });
    setAdvanceTransaction(updatedTransactions);

    setShowRevertModal(false);
    setRevertingPayslip(null);
    setRevertReason('');
    alert('Đã hoàn tạm ứng thành công!');
  };

  const handleViewDetail = (record) => {
    setViewingDetail(record);
    setShowDetailModal(true);
  };

  const handleUnlock = (record) => {
    if (window.confirm('Mở khóa bảng lương này?')) {
      setPayroll(payroll.map(p => 
        p.id === record.id ? { ...p, status: 'unlocked' } : p
      ));
    }
  };

  const handleLock = (record) => {
    if (window.confirm('Khóa bảng lương này?')) {
      setPayroll(payroll.map(p => 
        p.id === record.id ? { ...p, status: 'locked' } : p
      ));
    }
  };

  const handlePrintPayslip = (record) => {
    setPrintingPayslip(record);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const monthPayroll = payroll.filter(p => p.month === selectedMonth);
    
    if (monthPayroll.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const data = monthPayroll.map(p => ({
      'Mã NV': p.emp_code,
      'Tên': p.emp_name,
      'Phòng ban': p.emp_department,
      'Chức vụ': p.emp_position,
      'Ngày công': `${p.actual_days}/${p.standard_days}`,
      'Lương CB': p.basic_salary,
      'Lương theo công': p.salary_by_attendance,
      'Phụ cấp': p.total_allowances,
      'Thâm niên': p.seniority_allowance,
      'Tăng ca': p.overtime_pay,
      'Thưởng': p.total_bonus,
      'Tổng thu nhập': p.total_income,
      'BHXH': p.insurance_social,
      'BHYT': p.insurance_health,
      'BHTN': p.insurance_unemployment,
      'Phạt': p.total_penalty,
      'Tạm ứng': p.advance_deduction,
      'Tổng khấu trừ': p.total_deductions,
      'Thực lãnh': p.net_pay,
      'Hoàn TU': p.advance_reverted ? 'Có' : 'Không'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = Array(20).fill({ wch: 12 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Lương ${selectedMonth}`);
    XLSX.writeFile(wb, `Bang-luong-${selectedMonth}.xlsx`);
  };

  const getSummary = () => {
    const monthPayroll = payroll.filter(p => p.month === selectedMonth);
    return {
      count: monthPayroll.length,
      totalIncome: monthPayroll.reduce((sum, p) => sum + p.total_income, 0),
      totalDeductions: monthPayroll.reduce((sum, p) => sum + p.total_deductions, 0),
      totalNetPay: monthPayroll.reduce((sum, p) => sum + p.net_pay, 0)
    };
  };

  const filteredPayroll = payroll.filter(p => {
    if (p.month !== selectedMonth) return false;
    if (!searchTerm) return true;
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const searchableFields = [p.emp_code, p.emp_name, p.emp_department || '', p.emp_position || ''];
    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.emp_code.localeCompare(b.emp_code));

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bảng lương</h1>
          <p className="text-gray-600">Tính lương & quản lý phiếu lương</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={filteredPayroll.length === 0}
          >
            <Download className="w-5 h-5" />Xuất Excel
          </button>
          <button
            onClick={handleCalculatePayroll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Calculator className="w-5 h-5" />Tính lương
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tháng</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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
                placeholder="Mã NV, tên, phòng ban..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredPayroll.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Số nhân viên</p>
                <p className="text-3xl font-bold mt-1">{summary.count}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tổng thu nhập</p>
                <p className="text-2xl font-bold mt-1">{(summary.totalIncome / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Tổng khấu trừ</p>
                <p className="text-2xl font-bold mt-1">{(summary.totalDeductions / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Thực lãnh</p>
                <p className="text-2xl font-bold mt-1">{(summary.totalNetPay / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày công</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tạm ứng</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thực lãnh</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPayroll.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-blue-600">{record.emp_code}</td>
                  <td className="px-4 py-4 text-sm">{record.emp_name}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {record.actual_days}/{record.standard_days}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    {record.advance_deduction > 0 && (
                      <span className={`font-medium ${record.advance_reverted ? 'text-green-600' : 'text-orange-600'}`}>
                        {record.advance_reverted ? '(Đã hoàn) ' : ''}{record.advance_deduction.toLocaleString('vi-VN')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">
                      {record.net_pay.toLocaleString('vi-VN')} đ
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {record.status === 'locked' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit mx-auto">
                        <Lock className="w-3 h-3" />Đã khóa
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit mx-auto">
                        <Unlock className="w-3 h-3" />Chưa khóa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetail(record)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintPayslip(record)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="In phiếu lương"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {record.advance_deduction > 0 && !record.advance_reverted && record.status === 'unlocked' && (
                        <button
                          onClick={() => {
                            setRevertingPayslip(record);
                            setShowRevertModal(true);
                          }}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Hoàn tạm ứng"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      {record.status === 'locked' ? (
                        <button
                          onClick={() => handleUnlock(record)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Mở khóa"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLock(record)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Khóa"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayroll.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {payroll.filter(p => p.month === selectedMonth).length === 0 ? (
              <div>
                <p className="mb-4">Chưa có bảng lương cho tháng này</p>
                <button
                  onClick={handleCalculatePayroll}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Calculator className="w-5 h-5" />Tính lương ngay
                </button>
              </div>
            ) : (
              'Không tìm thấy dữ liệu'
            )}
          </div>
        )}
      </div>

      {/* Revert Modal */}
      {showRevertModal && revertingPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-orange-600">⚠️ Xác nhận hoàn tạm ứng</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Nhân viên</p>
                <p className="font-medium">{revertingPayslip.emp_code} - {revertingPayslip.emp_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số tiền tạm ứng</p>
                <p className="font-bold text-orange-600 text-lg">{revertingPayslip.advance_deduction.toLocaleString('vi-VN')} đ</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lý do hỗ trợ *</label>
                <textarea
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  placeholder="VD: Gia đình khó khăn, hoàn cảnh đặc biệt..."
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Sau khi hoàn:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Tạm ứng về trạng thái "Chưa trừ"</li>
                  <li>✓ Thực lãnh tăng: +{revertingPayslip.advance_deduction.toLocaleString('vi-VN')} đ</li>
                  <li>✓ Lưu lịch sử hoàn tạm ứng</li>
                </ul>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRevertModal(false);
                  setRevertingPayslip(null);
                  setRevertReason('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRevertAdvance}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Xác nhận hoàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - giữ nguyên như cũ */}
      {showDetailModal && viewingDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h2 className="text-xl font-bold">Chi tiết lương - {viewingDetail.emp_name}</h2>
              <p className="text-sm text-gray-600">Tháng {viewingDetail.month}</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-gray-700">Thông tin nhân viên</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Mã nhân viên</p>
                    <p className="font-medium">{viewingDetail.emp_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phòng ban</p>
                    <p className="font-medium">{viewingDetail.emp_department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chức vụ</p>
                    <p className="font-medium">{viewingDetail.emp_position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày công</p>
                    <p className="font-medium">{viewingDetail.actual_days}/{viewingDetail.standard_days}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-green-700">Thu nhập</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Lương cơ bản</span>
                    <span className="font-medium">{viewingDetail.basic_salary.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Lương theo ngày công</span>
                    <span className="font-medium">{viewingDetail.salary_by_attendance.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Tổng phụ cấp</span>
                    <span className="font-medium">{viewingDetail.total_allowances.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Trợ cấp thâm niên</span>
                    <span className="font-medium">{viewingDetail.seniority_allowance.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Tiền tăng ca</span>
                    <span className="font-medium">{viewingDetail.overtime_pay.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Thưởng</span>
                    <span className="font-medium text-green-600">{viewingDetail.total_bonus.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg">
                    <span className="font-semibold">Tổng thu nhập</span>
                    <span className="font-bold text-green-600 text-lg">{viewingDetail.total_income.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-red-700">Khấu trừ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">BHXH (8%)</span>
                    <span className="font-medium">{viewingDetail.insurance_social.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">BHYT (1.5%)</span>
                    <span className="font-medium">{viewingDetail.insurance_health.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">BHTN (1%)</span>
                    <span className="font-medium">{viewingDetail.insurance_unemployment.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Phạt</span>
                    <span className="font-medium text-red-600">{viewingDetail.total_penalty.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Tạm ứng {viewingDetail.advance_reverted && <span className="text-green-600 text-xs">(Đã hoàn)</span>}</span>
                    <span className="font-medium">{viewingDetail.advance_deduction.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-3 bg-red-50 px-3 rounded-lg">
                    <span className="font-semibold">Tổng khấu trừ</span>
                    <span className="font-bold text-red-600 text-lg">{viewingDetail.total_deductions.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">THỰC LÃNH</span>
                  <span className="text-4xl font-bold">{viewingDetail.net_pay.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
              {viewingDetail.advance_reverted && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="font-semibold text-green-800">✓ Đã hoàn tạm ứng</p>
                  <p className="text-sm text-green-700 mt-1">Lý do: {viewingDetail.advance_revert_reason}</p>
                  <p className="text-sm text-green-600 mt-1">Ngày: {new Date(viewingDetail.advance_revert_date).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal - giữ nguyên như cũ */}
      {showPrintModal && printingPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
            <div className="border-b px-6 py-4 flex justify-between items-center print:hidden">
              <h2 className="text-xl font-bold">Phiếu lương</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />In
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="p-8" id="payslip">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">PHIẾU LƯƠNG</h1>
                <p className="text-gray-600">Tháng {printingPayslip.month}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p><strong>Mã nhân viên:</strong> {printingPayslip.emp_code}</p>
                  <p><strong>Họ tên:</strong> {printingPayslip.emp_name}</p>
                </div>
                <div>
                  <p><strong>Phòng ban:</strong> {printingPayslip.emp_department || '-'}</p>
                  <p><strong>Chức vụ:</strong> {printingPayslip.emp_position || '-'}</p>
                </div>
              </div>
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Khoản mục</th>
                    <th className="border p-2 text-right">Số tiền (đ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-2 font-semibold" colSpan="2">THU NHẬP</td></tr>
                  <tr><td className="border p-2 pl-6">Lương cơ bản</td><td className="border p-2 text-right">{printingPayslip.basic_salary.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Lương theo ngày công ({printingPayslip.actual_days}/{printingPayslip.standard_days})</td><td className="border p-2 text-right">{printingPayslip.salary_by_attendance.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Phụ cấp</td><td className="border p-2 text-right">{printingPayslip.total_allowances.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Trợ cấp thâm niên</td><td className="border p-2 text-right">{printingPayslip.seniority_allowance.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Tăng ca</td><td className="border p-2 text-right">{printingPayslip.overtime_pay.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Thưởng</td><td className="border p-2 text-right">{printingPayslip.total_bonus.toLocaleString('vi-VN')}</td></tr>
                  <tr className="bg-green-50 font-bold"><td className="border p-2">Tổng thu nhập</td><td className="border p-2 text-right">{printingPayslip.total_income.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 font-semibold" colSpan="2">KHẤU TRỪ</td></tr>
                  <tr><td className="border p-2 pl-6">Bảo hiểm xã hội (8%)</td><td className="border p-2 text-right">{printingPayslip.insurance_social.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Bảo hiểm y tế (1.5%)</td><td className="border p-2 text-right">{printingPayslip.insurance_health.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Bảo hiểm thất nghiệp (1%)</td><td className="border p-2 text-right">{printingPayslip.insurance_unemployment.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Phạt</td><td className="border p-2 text-right">{printingPayslip.total_penalty.toLocaleString('vi-VN')}</td></tr>
                  <tr><td className="border p-2 pl-6">Tạm ứng</td><td className="border p-2 text-right">{printingPayslip.advance_deduction.toLocaleString('vi-VN')}</td></tr>
                  <tr className="bg-red-50 font-bold"><td className="border p-2">Tổng khấu trừ</td><td className="border p-2 text-right">{printingPayslip.total_deductions.toLocaleString('vi-VN')}</td></tr>
                  <tr className="bg-purple-100 font-bold text-lg"><td className="border p-3">THỰC LÃNH</td><td className="border p-3 text-right">{printingPayslip.net_pay.toLocaleString('vi-VN')}</td></tr>
                </tbody>
              </table>
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <p className="font-semibold mb-16">Người lập phiếu</p>
                  <p>.................................</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-16">Nhân viên</p>
                  <p>.................................</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-8">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          body * { visibility: hidden; }
          #payslip, #payslip * { visibility: visible; }
          #payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Payroll;
