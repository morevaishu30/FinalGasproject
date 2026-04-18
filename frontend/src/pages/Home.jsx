import React from "react";

const Home = () => (
  <div className="p-12 text-center">
    <h1 className="text-4xl font-extrabold text-erp-primary mb-4">Welcome to ERP System</h1>
    <p className="text-gray-500 max-w-2xl mx-auto">Select a module from the Master menu to get started. Manage your accounts, items, and financial records with ease.</p>
    <div className="mt-10 grid grid-cols-3 gap-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="text-erp-accent text-3xl mb-3">📊</div>
        <h3 className="font-bold text-lg">Real-time Analytics</h3>
        <p className="text-sm text-gray-500">Track your financial health instantly.</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="text-blue-500 text-3xl mb-3">💼</div>
        <h3 className="font-bold text-lg">Ledger Management</h3>
        <p className="text-sm text-gray-500">Comprehensive customer & supplier logs.</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="text-indigo-500 text-3xl mb-3">📦</div>
        <h3 className="font-bold text-lg">Inventory Control</h3>
        <p className="text-sm text-gray-500">Smart item and rate management.</p>
      </div>
    </div>
  </div>
);

export default Home;
