import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import FinancialYearModal from "./components/FinancialYearModal";
import Home from "./pages/Home";
import CustomerLedger from "./pages/CustomerLedger";
import LoginPage from "./pages/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");
  const [financialYear, setFinancialYear] = useState(localStorage.getItem("financialYear") || "2025-2026");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("financialYear")) {
      localStorage.setItem("financialYear", "2025-2026");
    }
  }, []);

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  const handleFYChange = (newYear) => {
    setFinancialYear(newYear);
    localStorage.setItem("financialYear", newYear);
  };

  const handleAction = (action) => {
    if (action === "changeFY") {
      setIsModalOpen(true);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar 
          currentFY={financialYear} 
          onChangeFY={handleAction} 
          onLogout={handleLogout}
        />
        
        <main className="flex-grow container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/customer-ledger" element={<CustomerLedger />} />
            <Route path="/supplier-ledger" element={<div className="p-8 bg-white shadow-sm rounded-xl m-4 text-gray-500">Supplier Ledger Page coming soon...</div>} />
            <Route path="/item-master" element={<div className="p-8 bg-white shadow-sm rounded-xl m-4 text-gray-500">Item Master Page coming soon...</div>} />
            <Route path="/person-details" element={<div className="p-8 bg-white shadow-sm rounded-xl m-4 text-gray-500">Person Details Master coming soon...</div>} />
            <Route path="/rate-master" element={<div className="p-8 bg-white shadow-sm rounded-xl m-4 text-gray-500">Rate Master Page coming soon...</div>} />
            {/* Catch-all route to redirect back to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <FinancialYearModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleFYChange} 
        />
        
        <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} ERP Solutions. All rights reserved. Professional Desktop ERP
        </footer>
      </div>
    </Router>
  );
}

export default App;
