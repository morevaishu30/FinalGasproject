import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import FinancialYearModal from "./components/FinancialYearModal";
import Home from "./pages/Home";
import CustomerLedger from "./pages/CustomerLedger";
import SupplierLedger from "./pages/SupplierLedger";
import CylinderMaster from "./pages/CylinderMaster";
import ItemGroupMaster from "./pages/ItemGroupMaster";
import LoginPage from "./pages/LoginPage";
import MaterialInwardFTM from "./pages/MaterialInwardFTM";
import MaterialInwardECR from "./pages/MaterialInwardECR";
import CylinderSupplierPO from "./pages/CylinderSupplierPO";
import MaterialOutward from "./pages/MaterialOutward";
import SalesOrder from "./pages/SalesOrder";
import MaterialPurchase from "./pages/MaterialPurchase";
import SalesInvoice from "./pages/SalesInvoice";
import PurchaseInvoice from "./pages/PurchaseInvoice";
import MaterialOutwardETM from "./pages/MaterialOutwardETM";
import ConsumableInward from "./pages/ConsumableInward";
import VoucherTransaction from "./pages/VoucherTransaction";
import StockReport from "./pages/StockReport";
import CylinderHoldingReport from "./pages/CylinderHoldingReport";

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
            <Route path="/supplier-ledger" element={<SupplierLedger />} />
            <Route path="/cylinder-master" element={<CylinderMaster />} />
            <Route path="/item-group" element={<ItemGroupMaster />} />
            <Route path="/item-master" element={<div className="p-8 bg-white shadow-sm rounded-xl m-4 text-gray-500">Item Master Page coming soon...</div>} />
            <Route path="/person-details" element={<div className="p-8 bg-white shadow-sm rounded-xl m-4 text-gray-500">Person Details Master coming soon...</div>} />
            <Route path="/rate-master" element={<div className="p-8 bg-white shadow-sm rounded-xl m-4 text-gray-500">Rate Master Page coming soon...</div>} />
            <Route path="/material-inward-supplier" element={<MaterialInwardFTM />} />
            <Route path="/material-inward-ecr" element={<MaterialInwardECR />} />
            <Route path="/consumable-inward" element={<ConsumableInward />} />
            <Route path="/material-outward" element={<MaterialOutward />} />
            <Route path="/empty-cylinder-etm" element={<MaterialOutwardETM />} />
            <Route path="/sales-order" element={<SalesOrder />} />
            <Route path="/sales-invoice" element={<SalesInvoice />} />
            <Route path="/purchase-invoice" element={<PurchaseInvoice />} />
            <Route path="/purchase" element={<MaterialPurchase />} />
            <Route path="/cylinder-po" element={<CylinderSupplierPO />} />
            <Route path="/bank-receipt" element={<VoucherTransaction />} />
            <Route path="/bank-payment" element={<VoucherTransaction />} />
            <Route path="/cash-receipt" element={<VoucherTransaction />} />
            <Route path="/cash-payment" element={<VoucherTransaction />} />
            <Route path="/stock-report" element={<StockReport />} />
            <Route path="/holding-report" element={<CylinderHoldingReport />} />
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
