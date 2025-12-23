import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Clock, Calendar, TrendingUp } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Attendance() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    return saved ? JSON.parse(saved) : [];
  };

  const loadAttendance = () => {
    const saved = localStorage.getItem('attendance');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        emp_id: 1,
        emp_code: 'NV001',
        emp_name: 'Nguyễn Văn Thanh',
        month: '2024-11',
        standard_days: 26,
        actual_days: 24,
        paid_leave: 2,
        unpaid_leave: 0,
        overtime: [
          {
            date: '2024-11-15',
            type: 'weekday',
            shift: 'evening',
            hours: 3,
            rate: 1.5,
            note: 'Gấp giao hàng'
          }
        ],
        total_overtime_hours: 3,
        total_overtime_amount: 0,
        note: ''
      }
    ];
  };

  const [employees] = useState(loadEmployees);
  const [attendance, setAttendance] = useState(loadAttendance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    emp_id: '',
    month: new Date().toISOString().slice(0, 7),
    standard_days: 26,
    actual_days: '',
    paid_leave: 0,
    unpaid_leave: 0,
    note: ''
  });

  const [overtimeForm, setOvertimeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'weekday',
    shift: 'evening',
    hours: '',
    rate: 1.5,
    note: ''
  });

  const [currentOvertime, setCurrentOvertime] = useState([]);
  const [editingOvertimeIndex, setEditingOvertimeIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emp_id) {
      newErrors.emp_id = 'Vui lòng chọn nhân viên';
    }

    if (!formData.actual_days || formData.actual_days < 0) {
      newErrors.actual_days = 'Số ngày công không hợp lệ';
    }

    if (formData.actual_days > formData.standard_days) {
      newErrors.actual_days = 'Số ngày công không được lớn hơn ngày công chuẩn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateOvertimeRate = (type, shift) => {
    if (type === 'holiday') return 3.0;
    if (type === 'sunday') return 2.0;
    if (shift === 'night') return 1.3;
    return 1.5;
  };

  const handleOvertimeTypeChange = (type) => {
    const rate = calculateOvertimeRate(type, overtimeForm.shift);
    setOvertimeForm({ ...overtimeForm, type, rate });
  };

  const handleOvertimeShiftChange = (shift) => {
    const rate = calculateOvertimeRate(overtimeForm.type, shift);
    setOvertimeForm({ ...overtimeForm, shift, rate });
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      emp_id: '',
      month: selectedMonth,
      standard_days: 26,
      actual_days: '',
      paid_leave: 0,
      unpaid_leave: 0,
      note: ''
    });
    setCurrentOvertime([]);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      emp_id: item.emp_id,
      month: item.month,
      standard_days: item.standard_days,
      actual_days: item.actual_days,
      paid_leave: item.paid_leave || 0,
      unpaid_leave: item.unpaid_leave || 0,
      note: item.note || ''
    });
    setCurrentOvertime([...(item.overtime || [])]);
    setErrors({});
    setShowModal(true);
  };

  const handleAddOvertime = () => {
    setEditingOvertimeIndex(null);
    setOvertimeForm({
      date: new Date().toISOString().split('T')[0],
      type: 'weekday',
      shift: 'evening',
      hours: '',
      rate: 1.5,
      note: ''
    });
    setShowOvertimeModal(true);
  };

  const handleEditOvertime = (index) => {
    setEditingOvertimeIndex(index);
    setOvertimeForm({ ...currentOvertime[index] });
    setShowOvertimeModal(true);
  };

  const handleSaveOvertime = () => {
    if (!overtimeForm.hours || overtimeForm.hours <= 0) {
      alert('Vui lòng nhập số giờ hợp lệ!');
      return;
    }

    const overtimeData = {
      date: overtimeForm.date,
      type: overtimeForm.type,
      shift: overtimeForm.shift,
      hours: parseFloat(overtimeForm.hours),
      rate: parseFloat(overtimeForm.rate),
      note: overtimeForm.note
    };

    if (editingOvertimeIndex !== null) {
      setCurrentOvertime(currentOvertime.map((ot, i) =>
        i === editingOvertimeIndex ? overtimeData : ot
      ));
    } else {
      setCurrentOvertime([...currentOvertime, overtimeData]);
    }

    setShowOvertimeModal(false);
  };

  const handleDeleteOvertime = (index) => {
    if (window.confirm('Xác nhận xóa tăng ca này?')) {
      setCurrentOvertime(currentOvertime.filter((_, i) => i !== index));
    }
  };

  const calculateOvertimeTotal = (overtimeList) => {
    return overtimeList.reduce((sum, ot) => sum + ot.hours, 0);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const employee = employees.find(e => e.id === parseInt(formData.emp_id));
    if (!employee) {
      alert('Không tìm thấy nhân viên!');
      return;
    }

    // Check duplicate
    const duplicate = attendance.find(a =>
      a.emp_id === parseInt(formData.emp_id) &&
      a.month === formData.month &&
      (!editingItem || a.id !== editingItem.id)
    );

    if (duplicate) {
      alert('Đã có chấm công cho nhân viên này trong tháng này!');
      return;
    }

    const totalOvertimeHours = calculateOvertimeTotal(currentOvertime);

    const dataToSave = {
      ...formData,
      emp_id: parseInt(formData.emp_id),
      emp_code: employee.code,
      emp_name: employee.name,
      actual_days: parseFloat(formData.actual_days),
      paid_leave: parseInt(formData.paid_leave) || 0,
      unpaid_leave: parseInt(formData.unpaid_leave) || 0,
      overtime: currentOvertime,
      total_overtime_hours: totalOvertimeHours,
      total_overtime_amount: 0 // Will be calculated in payroll
    };

    if (editingItem) {
      setAttendance(attendance.map(item =>
        item.id === editingItem.id ? { ...item, ...dataToSave } : item
      ));
    } else {
      setAttendance([...attendance, {
        id: Date.now(),
        ...dataToSave
      }]);
    }

    setShowModal(false);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setAttendance(attendance.filter(item => item.id !== deletingItem.id));
    setShowDeleteModal(false);
  };

  const filteredItems = attendance.filter(item => {
    if (item.month !== selectedMonth) return false;

    if (!searchTerm) return true;

    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    const searchableFields = [
      item.emp_code,
      item.emp_name,
      item.note || ''
    ];

    return searchableFields.some(field =>
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.emp_code.localeCompare(b.emp_code));

  const getOvertypeTypeName = (type) => {
    const names = {
      'weekday': 'Ngày thường',
      'sunday': 'Chủ nhật',
      'holiday': 'Ngày lễ'
    };
    return names[type] || type;
  };

  const getShiftName = (shift) => {
    const names = {
      'morning': 'Sáng',
      'afternoon': 'Chiều',
      'evening': 'Tối',
      'night': 'Đêm',
      'fullday': 'Cả ngày'
    };
    return names[shift] || shift;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chấm công</h1>
          <p className="text-gray-600">Quản lý chấm công & tăng ca theo tháng</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm chấm công
        </button>
      </div>

      {/* Filters */}
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
                placeholder="Mã NV, tên..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày công chuẩn</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày công thực tế</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nghỉ phép</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nghỉ không phép</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tăng ca (giờ)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-blue-600">{item.emp_code}</td>
                  <td className="px-4 py-4 text-sm">{item.emp_name}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.standard_days}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                      {item.actual_days}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-center">{item.paid_leave || 0}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    {item.unpaid_leave > 0 ? (
                      <span className="text-red-600 font-medium">{item.unpaid_leave}</span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    {item.total_overtime_hours > 0 ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium flex items-center gap-1 justify-center w-fit mx-auto">
                        <TrendingUp className="w-3 h-3" />
                        {item.total_overtime_hours}h
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
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
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Chưa có dữ liệu chấm công trong tháng này
          </div>
        )}
      </div>

      {/* Modal thêm/sửa chấm công */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Sửa chấm công' : 'Thêm chấm công'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tháng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nhân viên <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.emp_id}
                      onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.emp_id ? 'border-red-500' : ''}`}
                      disabled={editingItem !== null}
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.code} - {emp.name}
                        </option>
                      ))}
                    </select>
                    {errors.emp_id && <p className="text-red-500 text-sm mt-1">{errors.emp_id}</p>}
                  </div>
                </div>
              </div>

              {/* Ngày công */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Ngày công</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngày công chuẩn</label>
                    <input
                      type="number"
                      value={formData.standard_days}
                      onChange={(e) => setFormData({ ...formData, standard_days: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ngày công thực tế <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.actual_days}
                      onChange={(e) => setFormData({ ...formData, actual_days: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.actual_days ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.5"
                    />
                    {errors.actual_days && <p className="text-red-500 text-sm mt-1">{errors.actual_days}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nghỉ phép</label>
                    <input
                      type="number"
                      value={formData.paid_leave}
                      onChange={(e) => setFormData({ ...formData, paid_leave: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nghỉ không phép</label>
                    <input
                      type="number"
                      value={formData.unpaid_leave}
                      onChange={(e) => setFormData({ ...formData, unpaid_leave: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Tăng ca */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Tăng ca ({calculateOvertimeTotal(currentOvertime).toFixed(1)} giờ)
                  </h3>
                  <button
                    onClick={handleAddOvertime}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />Thêm tăng ca
                  </button>
                </div>

                {currentOvertime.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    Chưa có tăng ca nào
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentOvertime.map((ot, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{ot.date}</p>
                          <p className="text-sm text-gray-600">
                            {getOvertypeTypeName(ot.type)} - {getShiftName(ot.shift)} - {ot.hours}h (× {ot.rate})
                          </p>
                          {ot.note && <p className="text-sm text-gray-500 italic">{ot.note}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditOvertime(index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOvertime(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa tăng ca */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingOvertimeIndex !== null ? 'Sửa tăng ca' : 'Thêm tăng ca'}
              </h3>
              <button onClick={() => setShowOvertimeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={overtimeForm.date}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loại ngày</label>
                  <select
                    value={overtimeForm.type}
                    onChange={(e) => handleOvertimeTypeChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="weekday">Ngày thường</option>
                    <option value="sunday">Chủ nhật</option>
                    <option value="holiday">Ngày lễ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Buổi</label>
                  <select
                    value={overtimeForm.shift}
                    onChange={(e) => handleOvertimeShiftChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="morning">Sáng</option>
                    <option value="afternoon">Chiều</option>
                    <option value="evening">Tối</option>
                    <option value="night">Đêm (22h-6h)</option>
                    <option value="fullday">Cả ngày</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số giờ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={overtimeForm.hours}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                    step="0.5"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hệ số</label>
                  <input
                    type="number"
                    value={overtimeForm.rate}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, rate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    step="0.1"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Tự động tính dựa trên loại ngày & buổi</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={overtimeForm.note}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, note: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                  placeholder="VD: Gấp giao hàng, Đơn hàng đặc biệt..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Quy tắc hệ số:</strong> Ngày thường × 1.5, Chủ nhật × 2.0, Ngày lễ × 3.0, Ca đêm × 1.3
                </p>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowOvertimeModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveOvertime}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                {editingOvertimeIndex !== null ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc muốn xóa chấm công của <strong>{deletingItem?.emp_name}</strong> tháng <strong>{deletingItem?.month}</strong>?
              </p>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
