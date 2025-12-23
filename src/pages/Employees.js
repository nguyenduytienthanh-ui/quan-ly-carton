import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Users, DollarSign, Award, Copy, Calendar, Filter } from 'lucide-react';

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
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAllowanceFormModal, setShowAllowanceFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [viewingAllowances, setViewingAllowances] = useState(null);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Bulk update state
  const [bulkFilter, setBulkFilter] = useState({
    type: 'all', // all, department, position, manual
    department: '',
    position: '',
    selectedIds: []
  });
  const [bulkAction, setBulkAction] = useState({
    type: 'add', // add, increase, delete
    allowance_type: '',
    amount: '',
    increase_type: 'fixed', // fixed, percent
    increase_value: ''
  });

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

  const [allowanceForm, setAllowanceForm] = useState({
    type: '',
    amount: '',
    from_date: new Date().toISOString().split('T')[0],
    to_date: '',
    note: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    allowances: []
  });

  const [templateAllowanceForm, setTemplateAllowanceForm] = useState({
    type: '',
    amount: ''
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
    setAllowances(allowances.filter(a => a.emp_id !== deletingEmployee.id));
    setShowDeleteModal(false);
  };

  const handleViewAllowances = (employee) => {
    setViewingAllowances(employee);
    setShowAllowanceModal(true);
  };

  const handleAddAllowance = () => {
    setEditingAllowance(null);
    setAllowanceForm({
      type: '',
      amount: '',
      from_date: new Date().toISOString().split('T')[0],
      to_date: '',
      note: ''
    });
    setShowAllowanceFormModal(true);
  };

  const handleEditAllowance = (allowance) => {
    setEditingAllowance(allowance);
    setAllowanceForm({
      type: allowance.type,
      amount: allowance.amount,
      from_date: allowance.from_date,
      to_date: allowance.to_date || '',
      note: allowance.note || ''
    });
    setShowAllowanceFormModal(true);
  };

  const handleSaveAllowance = () => {
    if (!allowanceForm.type.trim() || !allowanceForm.amount || allowanceForm.amount <= 0) {
      alert('Vui lòng nhập đầy đủ: Loại phụ cấp và Số tiền!');
      return;
    }

    if (editingAllowance) {
      setAllowances(allowances.map(a =>
        a.id === editingAllowance.id ? {
          ...a,
          type: allowanceForm.type,
          amount: parseFloat(allowanceForm.amount),
          from_date: allowanceForm.from_date,
          to_date: allowanceForm.to_date || null,
          note: allowanceForm.note
        } : a
      ));
    } else {
      setAllowances([...allowances, {
        id: Date.now() + Math.random(),
        emp_id: viewingAllowances.id,
        type: allowanceForm.type,
        amount: parseFloat(allowanceForm.amount),
        from_date: allowanceForm.from_date,
        to_date: allowanceForm.to_date || null,
        note: allowanceForm.note
      }]);
    }

    setShowAllowanceFormModal(false);
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

  // Template management
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      description: '',
      allowances: []
    });
    setShowTemplateFormModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      allowances: [...template.allowances]
    });
    setShowTemplateFormModal(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) {
      alert('Vui lòng nhập tên mẫu!');
      return;
    }

    if (templateForm.allowances.length === 0) {
      alert('Vui lòng thêm ít nhất 1 phụ cấp!');
      return;
    }

    if (editingTemplate) {
      setTemplates(templates.map(t =>
        t.id === editingTemplate.id ? { ...t, ...templateForm } : t
      ));
    } else {
      setTemplates([...templates, {
        id: Date.now(),
        ...templateForm
      }]);
    }

    setShowTemplateFormModal(false);
    setShowTemplateModal(false);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Xác nhận xóa mẫu này?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleAddTemplateAllowance = () => {
    if (!templateAllowanceForm.type.trim() || !templateAllowanceForm.amount || templateAllowanceForm.amount <= 0) {
      alert('Vui lòng nhập đầy đủ Loại và Số tiền!');
      return;
    }

    setTemplateForm({
      ...templateForm,
      allowances: [...templateForm.allowances, {
        type: templateAllowanceForm.type,
        amount: parseFloat(templateAllowanceForm.amount)
      }]
    });

    setTemplateAllowanceForm({ type: '', amount: '' });
  };

  const handleDeleteTemplateAllowance = (index) => {
    setTemplateForm({
      ...templateForm,
      allowances: templateForm.allowances.filter((_, i) => i !== index)
    });
  };

  // Bulk update
  const getFilteredEmployeesForBulk = () => {
    if (bulkFilter.type === 'all') {
      return employees;
    } else if (bulkFilter.type === 'department') {
      return employees.filter(e => e.department === bulkFilter.department);
    } else if (bulkFilter.type === 'position') {
      return employees.filter(e => e.position === bulkFilter.position);
    } else if (bulkFilter.type === 'manual') {
      return employees.filter(e => bulkFilter.selectedIds.includes(e.id));
    }
    return [];
  };

  const handleToggleEmployeeSelection = (empId) => {
    setBulkFilter({
      ...bulkFilter,
      selectedIds: bulkFilter.selectedIds.includes(empId)
        ? bulkFilter.selectedIds.filter(id => id !== empId)
        : [...bulkFilter.selectedIds, empId]
    });
  };

  const handleApplyBulkUpdate = () => {
    const targetEmployees = getFilteredEmployeesForBulk();
    
    if (targetEmployees.length === 0) {
      alert('Không có nhân viên nào được chọn!');
      return;
    }

    if (bulkAction.type === 'add') {
      if (!bulkAction.allowance_type.trim() || !bulkAction.amount || bulkAction.amount <= 0) {
        alert('Vui lòng nhập đầy đủ: Loại phụ cấp và Số tiền!');
        return;
      }

      const newAllowances = targetEmployees.map(e => ({
        id: Date.now() + Math.random(),
        emp_id: e.id,
        type: bulkAction.allowance_type,
        amount: parseFloat(bulkAction.amount),
        from_date: new Date().toISOString().split('T')[0],
        to_date: null,
        note: 'Cập nhật hàng loạt'
      }));

      setAllowances([...allowances, ...newAllowances]);
      alert(`Đã thêm phụ cấp "${bulkAction.allowance_type}" cho ${targetEmployees.length} nhân viên!`);
      
    } else if (bulkAction.type === 'increase') {
      if (!bulkAction.allowance_type.trim() || !bulkAction.increase_value || bulkAction.increase_value <= 0) {
        alert('Vui lòng nhập đầy đủ: Loại phụ cấp và Giá trị tăng!');
        return;
      }

      const targetEmpIds = targetEmployees.map(e => e.id);
      const updatedAllowances = allowances.map(a => {
        if (targetEmpIds.includes(a.emp_id) && a.type === bulkAction.allowance_type) {
          const increaseAmount = bulkAction.increase_type === 'fixed'
            ? parseFloat(bulkAction.increase_value)
            : a.amount * (parseFloat(bulkAction.increase_value) / 100);
          
          return { ...a, amount: a.amount + increaseAmount };
        }
        return a;
      });

      setAllowances(updatedAllowances);
      alert(`Đã tăng phụ cấp "${bulkAction.allowance_type}" cho ${targetEmployees.length} nhân viên!`);
      
    } else if (bulkAction.type === 'delete') {
      if (!bulkAction.allowance_type.trim()) {
        alert('Vui lòng chọn loại phụ cấp cần xóa!');
        return;
      }

      const targetEmpIds = targetEmployees.map(e => e.id);
      const filteredAllowances = allowances.filter(a =>
        !(targetEmpIds.includes(a.emp_id) && a.type === bulkAction.allowance_type)
      );

      setAllowances(filteredAllowances);
      alert(`Đã xóa phụ cấp "${bulkAction.allowance_type}" của ${targetEmployees.length} nhân viên!`);
    }

    setShowBulkModal(false);
  };

  const calculateSeniority = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(years * 10) / 10;
  };

  const getTotalAllowances = (empId) => {
    return allowances
      .filter(a => a.emp_id === empId)
      .reduce((sum, a) => sum + a.amount, 0);
  };

  const getUniqueDepartments = () => {
    return [...new Set(employees.map(e => e.department).filter(Boolean))];
  };

  const getUniquePositions = () => {
    return [...new Set(employees.map(e => e.position).filter(Boolean))];
  };

  const getUniqueAllowanceTypes = () => {
    return [...new Set(allowances.map(a => a.type))];
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

      {/* Modal xóa nhân viên */}
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

              {/* Thêm phụ cấp mới */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Phụ cấp hiện tại</h3>
                <button
                  onClick={handleAddAllowance}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />Thêm phụ cấp
                </button>
              </div>

              {/* Danh sách phụ cấp */}
              <div className="space-y-2">
                {allowances.filter(a => a.emp_id === viewingAllowances.id).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có phụ cấp nào</p>
                ) : (
                  allowances.filter(a => a.emp_id === viewingAllowances.id).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{a.type}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Từ {a.from_date} {a.to_date && `đến ${a.to_date}`}
                        </p>
                        {a.note && <p className="text-sm text-gray-500 italic">{a.note}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-green-600 whitespace-nowrap">
                          {a.amount.toLocaleString('vi-VN')} đ
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAllowance(a)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAllowance(a.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Tổng cộng */}
              {allowances.filter(a => a.emp_id === viewingAllowances.id).length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold text-lg">Tổng phụ cấp:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {getTotalAllowances(viewingAllowances.id).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowAllowanceModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa phụ cấp */}
      {showAllowanceFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingAllowance ? 'Sửa phụ cấp' : 'Thêm phụ cấp'}</h3>
              <button onClick={() => setShowAllowanceFormModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại phụ cấp <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={allowanceForm.type}
                  onChange={(e) => setAllowanceForm({...allowanceForm, type: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="VD: Tay nghề, Độc hại..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Số tiền <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={allowanceForm.amount}
                  onChange={(e) => setAllowanceForm({...allowanceForm, amount: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="0"
                  placeholder="500000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Từ ngày <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={allowanceForm.from_date}
                    onChange={(e) => setAllowanceForm({...allowanceForm, from_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={allowanceForm.to_date}
                    onChange={(e) => setAllowanceForm({...allowanceForm, to_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Để trống = vô thời hạn</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea
                  value={allowanceForm.note}
                  onChange={(e) => setAllowanceForm({...allowanceForm, note: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowAllowanceFormModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSaveAllowance} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                {editingAllowance ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý mẫu */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Quản lý mẫu phụ cấp</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAddTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />Thêm mẫu
                </button>
                <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {templates.map(t => (
                  <div key={t.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{t.name}</h3>
                        <p className="text-sm text-gray-600">{t.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTemplate(t)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {t.allowances.map((a, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded">
                          <span className="text-gray-700">{a.type}</span>
                          <span className="font-medium">{a.amount.toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm font-medium">Tổng:</span>
                      <span className="text-lg font-bold text-green-600">
                        {t.allowances.reduce((sum, a) => sum + a.amount, 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa mẫu */}
      {showTemplateFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingTemplate ? 'Sửa mẫu' : 'Thêm mẫu mới'}</h3>
              <button onClick={() => setShowTemplateFormModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên mẫu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="VD: Công nhân sản xuất"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                  placeholder="VD: Phụ cấp chuẩn cho công nhân xưởng"
                />
              </div>

              {/* Thêm phụ cấp vào mẫu */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">Danh sách phụ cấp</h4>
                <div className="space-y-2 mb-3">
                  {templateForm.allowances.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Chưa có phụ cấp nào</p>
                  ) : (
                    templateForm.allowances.map((a, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded">
                        <span>{a.type}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{a.amount.toLocaleString('vi-VN')} đ</span>
                          <button
                            onClick={() => handleDeleteTemplateAllowance(idx)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form thêm PC */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateAllowanceForm.type}
                    onChange={(e) => setTemplateAllowanceForm({...templateAllowanceForm, type: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Loại phụ cấp"
                  />
                  <input
                    type="number"
                    value={templateAllowanceForm.amount}
                    onChange={(e) => setTemplateAllowanceForm({...templateAllowanceForm, amount: e.target.value})}
                    className="w-32 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Số tiền"
                    min="0"
                  />
                  <button
                    onClick={handleAddTemplateAllowance}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowTemplateFormModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSaveTemplate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                {editingTemplate ? 'Cập nhật' : 'Lưu mẫu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật hàng loạt */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Cập nhật hàng loạt</h2>
              <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Bước 1: Chọn nhân viên */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Bước 1: Chọn nhân viên áp dụng
                </h3>
                
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={bulkFilter.type === 'all'}
                        onChange={() => setBulkFilter({...bulkFilter, type: 'all'})}
                        className="w-4 h-4"
                      />
                      <span>Tất cả nhân viên ({employees.length})</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={bulkFilter.type === 'department'}
                        onChange={() => setBulkFilter({...bulkFilter, type: 'department'})}
                        className="w-4 h-4"
                      />
                      <span>Theo phòng ban</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={bulkFilter.type === 'position'}
                        onChange={() => setBulkFilter({...bulkFilter, type: 'position'})}
                        className="w-4 h-4"
                      />
                      <span>Theo chức vụ</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={bulkFilter.type === 'manual'}
                        onChange={() => setBulkFilter({...bulkFilter, type: 'manual'})}
                        className="w-4 h-4"
                      />
                      <span>Chọn thủ công</span>
                    </label>
                  </div>

                  {bulkFilter.type === 'department' && (
                    <select
                      value={bulkFilter.department}
                      onChange={(e) => setBulkFilter({...bulkFilter, department: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {getUniqueDepartments().map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}

                  {bulkFilter.type === 'position' && (
                    <select
                      value={bulkFilter.position}
                      onChange={(e) => setBulkFilter({...bulkFilter, position: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">-- Chọn chức vụ --</option>
                      {getUniquePositions().map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  )}

                  {bulkFilter.type === 'manual' && (
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-white">
                      {employees.map(e => (
                        <label key={e.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                          <input
                            type="checkbox"
                            checked={bulkFilter.selectedIds.includes(e.id)}
                            onChange={() => handleToggleEmployeeSelection(e.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{e.code} - {e.name} ({e.position || 'N/A'})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Số nhân viên được chọn: <strong>{getFilteredEmployeesForBulk().length}</strong>
                </div>
              </div>

              {/* Bước 2: Chọn thao tác */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-4">Bước 2: Chọn thao tác</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={bulkAction.type === 'add'}
                        onChange={() => setBulkAction({...bulkAction, type: 'add'})}
                        className="w-4 h-4"
                      />
                      <span>Thêm phụ cấp mới</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={bulkAction.type === 'increase'}
                        onChange={() => setBulkAction({...bulkAction, type: 'increase'})}
                        className="w-4 h-4"
                      />
                      <span>Tăng phụ cấp hiện có</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={bulkAction.type === 'delete'}
                        onChange={() => setBulkAction({...bulkAction, type: 'delete'})}
                        className="w-4 h-4"
                      />
                      <span>Xóa phụ cấp</span>
                    </label>
                  </div>

                  {bulkAction.type === 'add' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Loại phụ cấp</label>
                        <input
                          type="text"
                          value={bulkAction.allowance_type}
                          onChange={(e) => setBulkAction({...bulkAction, allowance_type: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="VD: Tay nghề"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Số tiền</label>
                        <input
                          type="number"
                          value={bulkAction.amount}
                          onChange={(e) => setBulkAction({...bulkAction, amount: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="500000"
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  {bulkAction.type === 'increase' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Loại phụ cấp cần tăng</label>
                        <select
                          value={bulkAction.allowance_type}
                          onChange={(e) => setBulkAction({...bulkAction, allowance_type: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="">-- Chọn loại phụ cấp --</option>
                          {getUniqueAllowanceTypes().map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Loại tăng</label>
                          <select
                            value={bulkAction.increase_type}
                            onChange={(e) => setBulkAction({...bulkAction, increase_type: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg"
                          >
                            <option value="fixed">Số tiền cố định</option>
                            <option value="percent">Phần trăm (%)</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            {bulkAction.increase_type === 'fixed' ? 'Số tiền tăng' : 'Phần trăm tăng'}
                          </label>
                          <input
                            type="number"
                            value={bulkAction.increase_value}
                            onChange={(e) => setBulkAction({...bulkAction, increase_value: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder={bulkAction.increase_type === 'fixed' ? '100000' : '10'}
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {bulkAction.type === 'delete' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Loại phụ cấp cần xóa</label>
                      <select
                        value={bulkAction.allowance_type}
                        onChange={(e) => setBulkAction({...bulkAction, allowance_type: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">-- Chọn loại phụ cấp --</option>
                        {getUniqueAllowanceTypes().map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              {getFilteredEmployeesForBulk().length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Xem trước:</h4>
                  <p className="text-sm">
                    {bulkAction.type === 'add' && `Thêm phụ cấp "${bulkAction.allowance_type}" (${parseFloat(bulkAction.amount || 0).toLocaleString('vi-VN')} đ)`}
                    {bulkAction.type === 'increase' && `Tăng phụ cấp "${bulkAction.allowance_type}" thêm ${bulkAction.increase_type === 'fixed' ? parseFloat(bulkAction.increase_value || 0).toLocaleString('vi-VN') + ' đ' : bulkAction.increase_value + '%'}`}
                    {bulkAction.type === 'delete' && `Xóa phụ cấp "${bulkAction.allowance_type}"`}
                    {' '}cho <strong>{getFilteredEmployeesForBulk().length} nhân viên</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button 
                onClick={handleApplyBulkUpdate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                disabled={getFilteredEmployeesForBulk().length === 0}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
