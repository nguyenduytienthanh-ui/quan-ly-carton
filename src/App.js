import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Material from './pages/Material';
import Employees from './pages/Employees';
import BonusPenalty from './pages/BonusPenalty';
import Attendance from './pages/Attendance';
import Advance from './pages/Advance';
import Payroll from './pages/Payroll';
import CashBook from './pages/CashBook';
import AdvanceTransaction from './pages/AdvanceTransaction';
import TransactionCategory from './pages/TransactionCategory';
import BankAccount from './pages/BankAccount';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/materials" element={<Material />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/bonus-penalty" element={<BonusPenalty />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/advance" element={<Advance />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/cashbook" element={<CashBook />} />
            <Route path="/advance-transaction" element={<AdvanceTransaction />} />
            <Route path="/transaction-category" element={<TransactionCategory />} />
            <Route path="/bank-account" element={<BankAccount />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
