import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Employees from './pages/Employees';
import BonusPenalty from './pages/BonusPenalty';
import Attendance from './pages/Attendance';
import Advance from './pages/Advance';
import Payroll from './pages/Payroll';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/bonus-penalty" element={<BonusPenalty />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/advance" element={<Advance />} />
            <Route path="/payroll" element={<Payroll />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
