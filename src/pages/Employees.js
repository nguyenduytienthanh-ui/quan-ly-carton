import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Users, DollarSign, Award, Copy } from 'lucide-react';

const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function Employees() {
  const loadEmployees = () => {
    const saved = localStorage.getItem('employees_v2');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: 1, 
        code: 'NV001', 
        name: 'Nguyễn Văn Thanh', 
        cccd: '079123456789',
        birth_date: '1990-05-15',
        gender: 'Nam',
        address: 'TP.HCM', 
        phone: '0901234567',
        email: 'thanh@example.com',
        department: 'Sản xuất',
        position: 'Công nhân',
        start_date: '2020-01-15',
        status: 'Đang làm',
        salary_basic: 8000000,
        account: '0123456789',
        bank: 'Vietcombank',
        branch: 'TP.HCM',
        note: ''
      }
    ];
  };

  const loadTemplates = () => {
    const saved = localStorage.getItem('allowance_templates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        name: 'Công nhân sản xuất',
        description: 'Phụ cấp chuẩn cho công nhân xưởng',
        allowances: [
          { type: 'Tay nghề', amount: 500000 },
          { type: 'Độc hại', amount: 300000 },
          { type: 'Ca đêm', amount: 200000 }
        ]
      },
      {
        id: 2,
        name: 'Trưởng ca',
        description: 'Phụ cấp cho trưởng ca sản xuất',
        allowances: [
          { type: 'Tay nghề', amount: 800000 },
          { type: 'Chức vụ', amount: 1000000 },
          { type: 'Điện thoại', amount: 300000 }
        ]
      },
      {
        id: 3,
        name: 'Nhân viên văn phòng',
        description: 'Phụ cấp cho nhân viên văn phòng',
        allowances: [
          { type: 'Xăng xe', amount: 400000 },
          { type: 'Điện thoại', amount: 200000 }
        ]
      }
    ];
  };

  const loadAllowances = () => {
    const saved = localStorage.getItem('employee_allowances');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, emp_id: 1, type: 'Tay nghề', amount: 500000, from_date: '2020-01-15', to_date: null, note: '' },
      { id: 2, emp_id: 1, type: 'Độc hại', amount: 300000, from_date: '2020-01-15', to_date: null, note: '' }
    ];
  };

  const [employees, setEmployees] = useState(loadEmployees);
  const [templates, setTemplates] = useState(loadTemplates);
  const [allowances, setAllowances] = useState(loadAllowances);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [viewingAllowances, setViewingAllowances] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    cccd: '',
    birth_date: '',
    gender: 'Nam',
    address: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    start_date: '',
    status: 'Đang làm',
    salary_basic: '',
    account: '',
    bank: '',
    branch: '',
    note: ''
  });

  useEffect(() => {
    localStorage.setItem('employees_v2', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('allowance_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('employee_allowances', JSON.stringify(allowances));
  }, [allowances]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã nhân viên là bắt buộc';
    } else if (formData.code.length > 15) {
      newErrors.code = 'Mã nhân viên tối đa 15 ký tự';
    } else {
      const codeUpper = formData.code.toUpperCase();
      const isDuplicate = employees.some(e => 
        e.code === codeUpper && (!editingEmployee || e.id !== editingEmployee.id)
      );
      if (isDuplicate) {
        newErrors.code = 'Mã nhân viên đã tồn tại';
      }
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhân viên là bắt buộc';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'SĐT phải có 10 số và bắt đầu bằng 0';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Ngày vào làm là bắt buộc';
    }
    
    if (!formData.salary_basic || formData.salary_basic <= 0) {
      newErrors.salary_basic = 'Lương cơ bản là bắt buộc';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      code: '',
      name: '',
      cccd: '',
      birth_date: '',
      gender: 'Nam',
      address: '',
      phone: '',
      email: '',
      department: '',
      position: '',
      start_date: '',
      status: 'Đang làm',
      salary_basic: '',
      account: '',
      bank: '',
      branch: '',
      note: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      code: employee.code,
      name: employee.name,
      cccd: employee.cccd || '',
      birth_date: employee.birth_date || '',
      gender: employee.gender || 'Nam',
      address: employee.address || '',
      phone: employee.phone || '',
      email: employee.email || '',
      department: employee.department || '',
      position: employee.position || '',
      start_date: employee.start_date || '',
      status: employee.status || 'Đang làm',
      salary_basic: employee.salary_basic || '',
      account: employee.account || '',
      bank: employee.bank || '',
      branch: employee.branch || '',
      note: employee.note || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const dataToSave = {
      ...formData,
      code: formData.code.toUpperCase(),
      salary_basic: parseFloat(formData.salary_basic)
    };

    if (editingEmployee) {
      setEmployees(employees.map(e => 
        e.id === editingEmployee.id ? { ...e, ...dataToSave } : e
      ));
    } else {
      setEmployees([...employees, { 
        id: Date.now(), 
        ...dataToSave
      }]);
    }
    
    setShowModal(false);
  };

  const handleDeleteClick = (employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setEmployees(employees.filter(e => e.id !== deletingEmployee.id));
    // Xóa luôn phụ cấp của nhân viên
    setAllowances(allowances.filter(a => a.emp_id !== deletingEmployee.id));
    setShowDeleteModal(false);
  };

  const handleViewAllowances = (employee) => {
    setViewingAllowances(employee);
    setShowAllowanceModal(true);
  };

  const handleApplyTemplate = (employee, templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newAllowances = template.allowances.map(a => ({
      id: Date.now() + Math.random(),
      emp_id: employee.id,
      type: a.type,
      amount: a.amount,
      from_date: new Date().toISOString().split('T')[0],
      to_date: null,
      note: `Áp dụng từ mẫu: ${template.name}`
    }));

    setAllowances([...allowances, ...newAllowances]);
    alert(`Đã áp dụng mẫu "${template.name}" cho ${employee.name}`);
  };

  const handleDeleteAllowance = (allowanceId) => {
    if (window.confirm('Xác nhận xóa phụ cấp này?')) {
      setAllowances(allowances.filter(a => a.id !== allowanceId));
    }
  };

  const calculateSeniority = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(years * 10) / 10; // 1 chữ số thập phân
  };

  const getTotalAllowances = (empId) => {
    return allowances
      .filter(a => a.emp_id === empId)
      .reduce((sum, a) => sum + a.amount, 0);
  };

  const filteredEmployees = employees.filter(e => {
    if (!searchTerm) return true;
    
    const searchLower = removeVietnameseTones(searchTerm.toLowerCase());
    
    const searchableFields = [
      e.code,
      e.name,
      e.phone || '',
      e.email || '',
      e.address || '',
      e.department || '',
      e.position || '',
      e.note || ''
    ];
    
    return searchableFields.some(field => 
      removeVietnameseTones(field.toLowerCase()).includes(searchLower)
    );
  }).sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nhân viên</h1>
          <p className="text-gray-600">Quản lý thông tin nhân viên & phụ cấp</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Award className="w-5 h-5" />Mẫu phụ cấp
          </button>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Users className="w-5 h-5" />Cập nhật hàng loạt
          </button>
          <button 
            onClick={handleAdd} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Tìm kiếm (có thể gõ không dấu)..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chức vụ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày vào</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thâm niên</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lương CB</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng PC</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-blue-600">{e.code}</td>
                  <td className="px-4 py-4 text-sm font-medium">{e.name}</td>
                  <td className="px-4 py-4 text-sm">{e.phone}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{e.department || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{e.position || '-'}</td>
                  <td className="px-4 py-4 text-sm">{e.start_date || '-'}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {calculateSeniority(e.start_date)} năm
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right font-medium">
                    {e.salary_basic?.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {getTotalAllowances(e.id).toLocaleString('vi-VN')} đ
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      e.status === 'Đang làm' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewAllowances(e)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Quản lý phụ cấp"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(e)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(e)} 
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
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không tìm thấy nhân viên</div>
        )}
      </div>

      {/* Modal thêm/sửa nhân viên */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Thông tin cơ bản</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mã NV <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className={`w-full px-4 py-2 border rounded-lg uppercase ${errors.code ? 'border-red-500' : ''}`}
                      maxLength={15}
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Họ tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CCCD/CMND</label>
                    <input
                      type="text"
                      value={formData.cccd}
                      onChange={(e) => setFormData({...formData, cccd: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      maxLength={12}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Giới tính</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Điện thoại <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                      maxLength={10}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Thông tin công việc */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Thông tin công việc</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phòng ban</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Ví dụ: Sản xuất"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chức vụ</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Ví dụ: Công nhân"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngày vào làm <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.start_date ? 'border-red-500' : ''}`}
                    />
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Trạng thái</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="Đang làm">Đang làm</option>
                      <option value="Nghỉ việc">Nghỉ việc</option>
                      <option value="Tạm nghỉ">Tạm nghỉ</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Lương cơ bản <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={formData.salary_basic}
                      onChange={(e) => setFormData({...formData, salary_basic: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.salary_basic ? 'border-red-500' : ''}`}
                      min="0"
                      placeholder="Ví dụ: 8000000"
                    />
                    {errors.salary_basic && <p className="text-red-500 text-sm mt-1">{errors.salary_basic}</p>}
                  </div>
                </div>
              </div>

              {/* Thông tin ngân hàng */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Thông tin ngân hàng</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Số tài khoản</label>
                    <input
                      type="text"
                      value={formData.account}
                      onChange={(e) => setFormData({...formData, account: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngân hàng</label>
                    <input
                      type="text"
                      value={formData.bank}
                      onChange={(e) => setFormData({...formData, bank: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Ví dụ: Vietcombank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chi nhánh</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Ví dụ: TP.HCM"
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingEmployee ? 'Cập nhật' : 'Thêm'}
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
                Bạn có chắc muốn xóa nhân viên <strong>{deletingEmployee?.name}</strong> (Mã: <strong>{deletingEmployee?.code}</strong>)?
              </p>
              <p className="text-sm text-red-600">Lưu ý: Tất cả phụ cấp của nhân viên cũng sẽ bị xóa!</p>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý phụ cấp */}
      {showAllowanceModal && viewingAllowances && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Quản lý phụ cấp</h2>
                <p className="text-sm text-gray-600">{viewingAllowances.name} ({viewingAllowances.code})</p>
              </div>
              <button onClick={() => setShowAllowanceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Áp dụng mẫu */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Áp dụng mẫu phụ cấp
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleApplyTemplate(viewingAllowances, t.id)}
                      className="px-4 py-2 bg-white border border-blue-300 hover:bg-blue-100 rounded-lg text-sm"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách phụ cấp hiện tại */}
              <div>
                <h3 className="font-semibold mb-3">Phụ cấp hiện tại</h3>
                <div className="space-y-2">
                  {allowances.filter(a => a.emp_id === viewingAllowances.id).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có phụ cấp nào</p>
                  ) : (
                    allowances.filter(a => a.emp_id === viewingAllowances.id).map(a => (
                      <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{a.type}</p>
                          <p className="text-sm text-gray-600">
                            Từ {a.from_date} {a.to_date && `đến ${a.to_date}`}
                          </p>
                          {a.note && <p className="text-sm text-gray-500 italic">{a.note}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-green-600">
                            {a.amount.toLocaleString('vi-VN')} đ
                          </span>
                          <button
                            onClick={() => handleDeleteAllowance(a.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Tổng cộng */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold text-lg">Tổng phụ cấp:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {getTotalAllowances(viewingAllowances.id).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowAllowanceModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal mẫu phụ cấp - Placeholder */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Quản lý mẫu phụ cấp</h2>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {templates.map(t => (
                  <div key={t.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{t.description}</p>
                    <div className="space-y-2">
                      {t.allowances.map((a, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{a.type}</span>
                          <span className="font-medium">{a.amount.toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="mt-6 text-center text-gray-500 text-sm">
                Tính năng thêm/sửa mẫu sẽ được bổ sung sau
              </p>
            </div>

            <div className="border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật hàng loạt - Placeholder */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Cập nhật hàng loạt</h2>
              <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tính năng đang phát triển</h3>
                <p className="text-gray-600 mb-4">
                  Sẽ cho phép cập nhật phụ cấp hàng loạt theo:
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
                  <li>• Tất cả nhân viên</li>
                  <li>• Theo phòng ban</li>
                  <li>• Theo chức vụ</li>
                  <li>• Theo thâm niên</li>
                  <li>• Chọn thủ công</li>
                </ul>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
