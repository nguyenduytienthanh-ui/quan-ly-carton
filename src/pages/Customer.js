import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import TextInput from '../components/TextInput';

function Customer() {
  const loadCustomers = () => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  };

  const [customers, setCustomers] = useState(loadCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  const handleSubmit = () => {
    if (!form.code.trim() || !form.name.trim()) {
      alert('Vui lòng điền mã và tên khách hàng!');
      return;
    }

    const existingCode = customers.find(c => 
      c.code.toUpperCase() === form.code.toUpperCase().trim() && 
      (!editingCustomer || c.id !== editingCustomer.id)
    );

    if (existingCode) {
      alert('Mã khách hàng đã tồn tại!');
      return;
    }

    const customerData = {
      code: form.code.toUpperCase().trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim()
    };

    if (editingCustomer) {
      setCustomers(customers.map(c =>
        c.id === editingCustomer.id ? { ...c, ...customerData } : c
      ));
      alert('Đã cập nhật khách hàng!');
    } else {
      const newCustomer = {
        id: Date.now(),
        ...customerData
      };
      setCustomers([...customers, newCustomer]);
      alert('Đã thêm khách hàng!');
    }

    setShowModal(false);
    setEditingCustomer(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({
      code: customer.code,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = (customer) => {
    if (window.confirm(`Xóa khách hàng "${customer.name}"?`)) {
      setCustomers(customers.filter(c => c.id !== customer.id));
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      c.code.toLowerCase().includes(searchLower) ||
      c.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Khách hàng</h1>
          <p className="text-gray-600">Quản lý danh sách khách hàng</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />Thêm khách hàng
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
              placeholder="Mã hoặc tên khách hàng..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã KH</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khách hàng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-blue-600">{customer.code}</td>
                <td className="px-4 py-4 text-sm font-medium">{customer.name}</td>
                <td className="px-4 py-4 text-sm">{customer.phone || '-'}</td>
                <td className="px-4 py-4 text-sm">{customer.email || '-'}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
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
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mã KH *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="VD: KH001"
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tên khách hàng *</label>
                  <TextInput
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    placeholder="Tên công ty/cá nhân"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Điện thoại</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0123456789"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@company.com"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                <TextInput
                  value={form.address}
                  onChange={(value) => setForm({ ...form, address: value })}
                  placeholder="Địa chỉ công ty"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCustomer ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customer;
