import React, { useState } from "react";
import api from "../api/axios";

const SupplierLedger = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    supplierName: "", printName: "", accountType: "Purchase Party",
    underGroup: "SUNDRY CREDITOR EXPENSE", alternateUnderGroup: "",
    vehicleQa: false, inactiveAc: false, legalCase: false,
    terms: "", termsDays: 0, creditLimit: 0.00, holdingQty: 0,
    creditDays: 0, debitInterest: 0, creditInterest: 0,
    operatingType: "Bill To Bill Payment",
    address: "", city: "", state: "", zipCode: "", phone: "",
    gstin: "", pan: "", registrationType: "",
    taxPercentage: "", sector: "", itemCategory: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dbData = {
        ...formData,
        financialYearId: localStorage.getItem("financialYear") || "2025-2026"
      };
      // For now, let's keep the endpoint similar or just alert as requested for frontend changes only
      console.log("Saving Supplier Ledger:", dbData);
      alert("Supplier Ledger saved successfully! (Frontend Only Change)");
    } catch (error) {
      console.error("Error saving ledger", error);
      alert("Error saving ledger.");
    }
  };

  const tabs = [
    { id: 1, name: "Accounting Detail" },
    { id: 2, name: "Address Detail" },
    { id: 3, name: "Registration Detail" },
    { id: 4, name: "Item / Tax Detail" }
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-6xl mx-auto">

        {/* Header Title */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Supplier Ledger A/c
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-0">
          {/* Top Panel - Basic Info */}
          <div className="p-6 bg-blue-50/30 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 gap-x-6 items-center">

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Supplier Name :</label>
              <div className="md:col-span-8">
                <input name="supplierName" value={formData.supplierName} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-100 bg-white font-medium" />
              </div>
              <div className="md:col-span-2"></div>

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Print Name :</label>
              <div className="md:col-span-8 flex items-center gap-4">
                <input name="printName" value={formData.printName} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-100 bg-white" />
                <label className="flex items-center space-x-2 whitespace-nowrap text-sm text-gray-600 font-medium">
                  <input type="checkbox" name="vehicleQa" checked={formData.vehicleQa} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span>Vehicle QA</span>
                </label>
              </div>
              <div className="md:col-span-2"></div>

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Account Type :</label>
              <div className="md:col-span-4 flex items-center gap-4">
                <select name="accountType" value={formData.accountType} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none bg-white">
                  <option value="Purchase Party">Purchase Party</option>
                  <option value="Sales Party">Sales Party</option>
                </select>
              </div>
              <div className="md:col-span-6"></div>

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Under Group :</label>
              <div className="md:col-span-8">
                <select name="underGroup" value={formData.underGroup} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none bg-white">
                  <option value="SUNDRY CREDITOR EXPENSE">SUNDRY CREDITOR EXPENSE</option>
                  <option value="SUNDRY CREDITORS FOR GOODS">SUNDRY CREDITORS FOR GOODS</option>
                </select>
              </div>
              <div className="md:col-span-2"></div>

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Alternate Under Group :</label>
              <div className="md:col-span-8 flex items-center gap-4">
                <select name="alternateUnderGroup" value={formData.alternateUnderGroup} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none bg-white">
                  <option value="">-- Select --</option>
                </select>
                <label className="flex items-center space-x-2 whitespace-nowrap text-sm text-red-600 font-medium ml-2">
                  <input type="checkbox" name="inactiveAc" checked={formData.inactiveAc} onChange={handleChange} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                  <span>Inactive A/c</span>
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end pr-4">
                <label className="flex items-center space-x-2 whitespace-nowrap text-sm text-orange-600 font-medium">
                  <input type="checkbox" name="legalCase" checked={formData.legalCase} onChange={handleChange} className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4" />
                  <span>Legal Case</span>
                </label>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 pt-2 flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-sm font-bold rounded-t-lg border-t border-l border-r transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? "bg-white border-gray-300 text-blue-700 -mb-px z-10"
                    : "bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-50 border-b-0"
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-white min-h-[300px]">
            {activeTab === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">

                {/* Credit Limit & Prefix Box */}
                <div className="border border-blue-200 rounded-lg p-4 relative">
                  <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-800">Credit Limit & Prefix</span>

                  <div className="grid grid-cols-12 gap-3 items-center mt-2">
                    <label className="col-span-4 text-right text-sm text-gray-700">Terms :</label>
                    <input name="terms" value={formData.terms} onChange={handleChange} className="col-span-8 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500" />

                    <label className="col-span-4 text-right text-sm text-gray-700">Credit Limit :</label>
                    <div className="col-span-8 flex gap-2 items-center">
                      <input name="creditLimit" type="number" step="0.01" value={formData.creditLimit} onChange={handleChange} className="w-1/2 border border-blue-400 bg-blue-50 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right font-medium" />
                      <label className="text-sm text-gray-700 whitespace-nowrap ml-2">Holding Qty :</label>
                      <input name="holdingQty" type="number" value={formData.holdingQty} onChange={handleChange} className="w-1/3 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right" />
                    </div>

                    <label className="col-span-4 text-right text-sm text-gray-700">Credit Days :</label>
                    <input name="creditDays" type="number" value={formData.creditDays} onChange={handleChange} className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right" />
                    <div className="col-span-5 flex items-center justify-end">
                      <label className="text-sm text-gray-700 mr-2">Terms Days :</label>
                      <input name="termsDays" type="number" value={formData.termsDays} onChange={handleChange} className="w-16 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right" />
                    </div>

                    <label className="col-span-4 text-right text-sm text-gray-700">Debit Interest % :</label>
                    <input name="debitInterest" type="number" step="0.01" value={formData.debitInterest} onChange={handleChange} className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right" />
                    <div className="col-span-5"></div>

                    <label className="col-span-4 text-right text-sm text-gray-700">Credit Interest % :</label>
                    <input name="creditInterest" type="number" step="0.01" value={formData.creditInterest} onChange={handleChange} className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right" />
                    <div className="col-span-5"></div>
                  </div>
                </div>

                {/* Operating Type Box */}
                <div className="border border-blue-200 rounded-lg p-4 relative h-max">
                  <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-800">Operating Type</span>

                  <div className="flex flex-col gap-3 mt-4 ml-4">
                    <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" name="operatingType" value="Bill To Bill Payment" checked={formData.operatingType === "Bill To Bill Payment"} onChange={handleChange} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span>Bill To Bill Payment</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                        <input type="radio" name="operatingType" value="Balance Only" checked={formData.operatingType === "Balance Only"} onChange={handleChange} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span>Balance Only</span>
                      </label>
                      <select className="border border-gray-300 rounded px-2 py-0.5 text-xs outline-none bg-white w-24 ml-4">
                        <option>Out</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <label className="text-sm font-semibold text-gray-700">Exp.Type:</label>
                      <select className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none bg-white">
                        <option></option>
                      </select>
                    </div>
                  </div>
                </div>


                {/* Ledger Show In Company/Branch */}
                <div className="border border-blue-200 rounded-lg pt-4 pb-1 px-1 relative mt-2 h-[220px] flex flex-col">
                  <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-800 z-10">Ledger Show In Company/Branch</span>
                  <div className="overflow-y-auto flex-1 border border-gray-300 mx-1 mb-1">
                    <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
                      <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
                        <tr>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-b border-gray-300">Company Name</th>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-b border-gray-300">Branch Name</th>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-b border-gray-300 text-center">K.M</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-blue-50">
                          <td className="py-1 px-2 border-r border-b border-gray-200 flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3 text-blue-600 rounded" defaultChecked />VADILAL CHEMICALS LIMITED</td>
                          <td className="py-1 px-2 border-r border-b border-gray-200">BOMBAY</td>
                          <td className="py-1 px-2 border-b border-gray-200 text-right"></td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="py-1 px-2 border-r border-b border-gray-200 flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3 text-blue-600 rounded" defaultChecked />VADILAL CHEMICALS LIMITED</td>
                          <td className="py-1 px-2 border-r border-b border-gray-200">HO</td>
                          <td className="py-1 px-2 border-b border-gray-200 text-right"></td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="py-1 px-2 border-r border-b border-gray-200 flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3 text-blue-600 rounded" defaultChecked />VADILAL GASES LIMITED</td>
                          <td className="py-1 px-2 border-r border-b border-gray-200">HO</td>
                          <td className="py-1 px-2 border-b border-gray-200 text-right"></td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="py-1 px-2 border-r border-b border-gray-200 flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3 text-blue-600 rounded" defaultChecked />VADILAL CHEMICALS LIMITED</td>
                          <td className="py-1 px-2 border-r border-b border-gray-200">HYDERABAD</td>
                          <td className="py-1 px-2 border-b border-gray-200 text-right"></td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="py-1 px-2 border-r border-b border-gray-200 flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3 text-blue-600 rounded" defaultChecked />VADILAL CHEMICALS LIMITED</td>
                          <td className="py-1 px-2 border-r border-b border-gray-200">INDORE</td>
                          <td className="py-1 px-2 border-b border-gray-200 text-right font-medium">6.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ledger Summary Posting */}
                <div className="border border-blue-200 rounded-lg pt-4 pb-1 px-1 relative mt-2 h-[220px] flex flex-col">
                  <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-800 z-10">Ledger Summary Posting</span>
                  <div className="overflow-y-auto flex-1 border border-gray-300 mx-1 mb-1 bg-gray-50/50">
                    <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
                      <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
                        <tr>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-b border-gray-300 w-1/2">Voucher Type</th>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-b border-gray-300 w-1/2">Posting Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i} className="hover:bg-blue-50/50">
                            <td className="py-3 px-2 border-r border-b border-gray-200"></td>
                            <td className="py-3 px-2 border-b border-gray-200"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 2 && (
              <div className="border border-blue-300 rounded p-1 relative animate-fadeIn mb-2 bg-blue-50/10">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-gray-700 z-10">Address(s)</span>

                <div className="border border-blue-200 p-3 pt-4 mt-1 bg-white">
                  <div className="grid grid-cols-12 gap-x-2 gap-y-2 items-center">
                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Location :</label>
                    <div className="col-span-4">
                      <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                        <option>DEFAULT ADDRESS</option>
                      </select>
                    </div>
                    <div className="col-span-3 flex items-center justify-center">
                      <label className="flex items-center space-x-1 whitespace-nowrap text-xs text-gray-600">
                        <input type="checkbox" className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-3 h-3" />
                        <span>Inactive Location</span>
                      </label>
                    </div>
                    <label className="col-span-1 text-right text-xs font-semibold text-gray-700">Mobile :</label>
                    <input className="col-span-2 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" defaultValue="9993789079" />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Phone No(s) :</label>
                    <input className="col-span-6 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" />
                    <label className="col-span-1 text-right text-xs font-semibold text-gray-700">Fax :</label>
                    <input className="col-span-3 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">E-Mail :</label>
                    <input className="col-span-10 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" defaultValue="chromxanalyticals@gmail.com" />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Website :</label>
                    <input className="col-span-10 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700 self-start mt-1.5">Address :</label>
                    <div className="col-span-10 flex flex-col gap-0.5">
                      <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" defaultValue="109-a" />
                      <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" defaultValue="Akhand Nagar , Bijasan Road" />
                      <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" />
                    </div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700 mt-1">Area Name :</label>
                    <div className="col-span-10 mt-1">
                      <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                        <option></option>
                      </select>
                    </div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">City :</label>
                    <div className="col-span-6 flex gap-1">
                      <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                        <option>INDORE</option>
                      </select>
                    </div>
                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Pincode :</label>
                    <input className="col-span-2 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" defaultValue="452006" />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">State Name :</label>
                    <div className="col-span-6">
                      <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                        <option>MADHYA PRADESH</option>
                      </select>
                    </div>
                    <div className="col-span-4 flex items-center justify-end gap-2 pr-2">
                      <button type="button" className="p-0.5 border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded text-xs px-2 shadow-sm"><span className="text-[10px]">◀</span></button>
                      <span className="text-xs font-semibold text-gray-700">1 of 1</span>
                      <button type="button" className="p-0.5 border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded text-xs px-2 shadow-sm"><span className="text-[10px]">▶</span></button>
                    </div>
                  </div>

                  {/* Sub-table for persons */}
                  <div className="mt-4 border border-blue-200 bg-white overflow-hidden">
                    <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
                      <thead className="bg-gray-100 border-b border-blue-200">
                        <tr>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-200 w-1/5">Person Name</th>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-200 w-1/5">Designation</th>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-200 w-1/6">Mobile</th>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-200 w-1/4">EMail</th>
                          <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-200">EMail T...</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-blue-50">
                          <td className="py-1.5 px-2 border-r border-b border-blue-100">Rupesh Kushwaha</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100 uppercase">PURCHASE HEAD</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100">9993789079</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100 text-blue-700">Chromxanalyticals@gmail.com</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100"></td>
                        </tr>
                        {/* Empty row to match height */}
                        <tr className="">
                          <td className="py-3 px-2 border-r border-b border-blue-50"></td>
                          <td className="py-3 px-2 border-r border-b border-blue-50"></td>
                          <td className="py-3 px-2 border-r border-b border-blue-50"></td>
                          <td className="py-3 px-2 border-r border-b border-blue-50"></td>
                          <td className="py-3 px-2 border-r border-b border-blue-50"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="animate-fadeIn p-2 bg-blue-50/10 mb-2">
                <div className="flex gap-2">
                  {/* Left Column: GST Detail */}
                  <div className="flex-1 border border-blue-300 rounded p-1 relative mt-2 bg-white">
                    <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-gray-700">GST Detail</span>

                    <div className="grid grid-cols-12 gap-x-2 gap-y-2.5 items-center mt-3 p-2">
                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">PAN :</label>
                      <input className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500 uppercase" defaultValue="DLLPG6715D" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">GST Reg.Type :</label>
                      <select className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500">
                        <option>Registered</option>
                      </select>

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">GST No :</label>
                      <input className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500 uppercase" defaultValue="23DLLPG6715D1ZC" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">LUT No :</label>
                      <input className="col-span-4 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                      <label className="col-span-2 text-right text-[11px] font-semibold text-gray-700">Effect Date :</label>
                      <select className="col-span-3 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500">
                        <option>01-01-1900</option>
                      </select>

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Aadhar No :</label>
                      <input className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">CIN No :</label>
                      <input className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Customer Code :</label>
                      <input className="col-span-4 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                      <label className="col-span-2 text-right text-[11px] font-semibold text-gray-700">MSME/Udyam :</label>
                      <input className="col-span-3 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" defaultValue="UDYAM-MP-23-0191803" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Category :</label>
                      <input className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" defaultValue="OTHER" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Sales Men :</label>
                      <select className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500">
                        <option>MR. SANJAY DEVDHAR</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Other Detail, Cylinder, TDS */}
                  <div className="w-[320px] flex flex-col gap-3 mt-2">
                    {/* Other Detail */}
                    <div className="border border-blue-300 rounded p-1 relative bg-white">
                      <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-gray-700">Other Detail</span>
                      <div className="mt-3 p-2 flex flex-col gap-1">
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center space-x-1 text-[11px] text-gray-600">
                            <input type="checkbox" className="rounded border-gray-400 w-3 h-3" /> <span>ARC Party</span>
                          </label>
                          <label className="flex items-center space-x-1 text-[11px] text-gray-600">
                            <input type="checkbox" className="rounded border-gray-400 w-3 h-3" /> <span>Government Party</span>
                          </label>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-gray-600 mb-1">
                          <input type="checkbox" className="rounded border-gray-400 w-3 h-3" /> <span>MSME Party</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-gray-700">Exemption Certi.No :</span>
                          <input className="w-1/2 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-gray-600">
                          <input type="checkbox" className="rounded border-gray-400 w-3 h-3" /> <span>Show In Loading / Unloading Report</span>
                        </div>
                      </div>
                    </div>

                    {/* Cylinder Related Detail */}
                    <div className="border border-blue-300 rounded p-1 relative bg-white">
                      <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-gray-700">Cylinder Related Detail</span>
                      <div className="mt-3 p-2 flex flex-col gap-1.5">
                        <label className="flex items-center space-x-1 text-[11px] text-gray-600">
                          <input type="checkbox" className="rounded border-gray-400 w-3 h-3" /> <span>Not Check Prefix For ECR</span>
                        </label>
                        <div className="flex gap-2 items-center">
                          <label className="w-[120px] text-right text-[11px] font-semibold text-gray-700">Customer Cylinder Prefix :</label>
                          <input className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="w-[120px] text-right text-[11px] font-semibold text-gray-700">Holding Days :</label>
                          <input className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* TDS Detail */}
                    <div className="border border-blue-300 rounded p-1 relative bg-white">
                      <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-gray-700">TDS Detail</span>
                      <div className="mt-3 p-2 flex flex-col gap-1">
                        <div className="flex items-center justify-center mb-1">
                          <label className="flex items-center space-x-1 text-[11px] text-gray-600">
                            <input type="checkbox" className="rounded border-gray-400 w-3 h-3" /> <span>TDS</span>
                          </label>
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="w-10 text-right text-[11px] font-semibold text-gray-700">Type :</label>
                          <select className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500"><option></option></select>
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="w-10 text-right text-[11px] font-semibold text-gray-700">Source :</label>
                          <select className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500"><option></option></select>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Sub-table at bottom */}
                <div className="mt-2 border border-blue-300 bg-white overflow-hidden rounded">
                  <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
                    <thead className="bg-[#e2e8f0] border-b border-blue-300">
                      <tr>
                        <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-300">Bank Name</th>
                        <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-300">Branch</th>
                        <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-300">A/c No</th>
                        <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-300 w-1/6">IFSC Code</th>
                        <th className="py-1 px-2 font-semibold text-gray-700 border-r border-blue-300 w-1/6">A/c Type</th>
                        <th className="py-1 px-2 font-semibold text-gray-700">Bank D...</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Empty row to match height */}
                      <tr className="bg-gray-50/50">
                        <td className="py-3 px-2 border-r border-b border-gray-200"></td>
                        <td className="py-3 px-2 border-r border-b border-gray-200"></td>
                        <td className="py-3 px-2 border-r border-b border-gray-200"></td>
                        <td className="py-3 px-2 border-r border-b border-gray-200"></td>
                        <td className="py-3 px-2 border-r border-b border-gray-200"></td>
                        <td className="py-3 px-2 border-r border-b border-gray-200"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {activeTab === 4 && (
              <div className="animate-fadeIn p-2 bg-blue-50/10 mb-2">
                <div className="border border-blue-300 rounded p-4 bg-white">
                  <div className="grid grid-cols-12 gap-x-4 gap-y-3 items-center">
                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Tax Code :</label>
                    <select className="col-span-8 border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                      <option></option>
                    </select>
                    <div className="col-span-2"></div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Party Group :</label>
                    <select className="col-span-8 border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                      <option></option>
                    </select>
                    <div className="col-span-2"></div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Sector :</label>
                    <select className="col-span-8 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 bg-blue-600 text-white font-medium">
                      <option>DEWAS/NANDAKHEDA</option>
                    </select>
                    <div className="col-span-2"></div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Customer Type :</label>
                    <select className="col-span-8 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 bg-blue-600 text-white font-medium">
                      <option>BADDI</option>
                    </select>
                    <div className="col-span-2"></div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Customer Grade :</label>
                    <select className="col-span-3 border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                      <option></option>
                    </select>
                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Local / Export :</label>
                    <select className="col-span-3 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 bg-blue-600 text-white">
                      <option></option>
                    </select>
                    <div className="col-span-2"></div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700 whitespace-nowrap -ml-6">Test Certificate Remarks :</label>
                    <input className="col-span-10 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" />
                  </div>

                  <div className="mt-4 border border-blue-300 rounded relative">
                    <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-blue-800">Party Deal in Below Selected Item Group</span>
                    <div className="p-3 pt-4 h-[160px] overflow-y-auto">
                      <table className="w-full text-left text-[11px] border-collapse bg-gray-50/50">
                        <thead className="bg-[#e2e8f0] sticky top-0 z-10">
                          <tr>
                            <th className="py-1 px-2 font-semibold text-gray-700 border border-gray-300 w-1/2">Item Group</th>
                            <th className="py-1 px-2 font-semibold text-gray-700 border border-gray-300 w-1/2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-blue-50 border-b border-gray-200">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                              <span className="font-semibold uppercase text-gray-700">6 GRADE GAS</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                          <tr className="hover:bg-blue-50 border-b border-gray-200">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                              <span className="font-semibold uppercase text-gray-700">AIR COMPRESSOR</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                          <tr className="hover:bg-blue-50 border-b border-gray-200">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                              <span className="font-semibold uppercase text-gray-700">AIR CONDITION</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                          <tr className="hover:bg-blue-50 border-b border-gray-200">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                              <span className="font-semibold uppercase text-gray-700">AIR SAMPLING PUMP</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                          <tr className="hover:bg-blue-50 border-b border-gray-200">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                              <span className="font-semibold uppercase text-gray-700">AMMONIA</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                          <tr className="hover:bg-blue-50 border-b border-gray-200">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                              <span className="font-semibold uppercase text-gray-700">AMMONIA SHED</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                          <tr className="hover:bg-blue-50 border-b border-gray-200 bg-blue-50/50">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" defaultChecked />
                              <span className="font-semibold uppercase text-gray-700">ARGON</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                          <tr className="hover:bg-blue-50 border-b border-gray-200">
                            <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                              <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                              <span className="font-semibold uppercase text-gray-700">BALL VALVE</span>
                            </td>
                            <td className="py-1.5 px-2 border-r border-gray-300"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="bg-gray-100 p-4 border-t border-gray-300 flex flex-wrap justify-between items-center gap-2">
            <div className="flex space-x-2">
              <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded font-bold text-sm shadow hover:bg-green-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Add
              </button>
              <button type="button" className="px-5 py-2 bg-blue-600 text-white rounded font-bold text-sm shadow hover:bg-blue-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Edit
              </button>
              <button type="button" className="px-5 py-2 bg-gray-500 text-white rounded font-bold text-sm shadow hover:bg-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                View
              </button>
              <button type="button" className="px-5 py-2 bg-red-600 text-white rounded font-bold text-sm shadow hover:bg-red-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Exit
              </button>
            </div>

            <div className="flex space-x-2">
              <button type="button" className="px-4 py-2 bg-yellow-500 text-white rounded font-bold text-sm shadow hover:bg-yellow-600 flex items-center">
                Attachment
              </button>
              <button type="button" className="px-4 py-2 bg-purple-600 text-white rounded font-bold text-sm shadow hover:bg-purple-700 flex items-center">
                Authorization
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SupplierLedger;
