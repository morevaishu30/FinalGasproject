import React, { useState, useEffect } from "react";
import api from "../api/axios";

const CustomerLedger = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    customerName: "", printName: "", accountType: "Sales Party",
    underGroup: "SUNDRY DEBTORS FOR GOODS",
    vehicleQa: false, qrCodePrint: false, inactiveAc: false, legalCase: false,
    creditDays: 0, holdingQty: 0,
    operatingType: "Bill To Bill Payment",
    
    // Address
    location: "DEFAULT ADDRESS", inactiveLocation: false, mobile: "",
    phone: "", email: "", website: "",
    address1: "", address2: "", address3: "", areaName: "",
    city: "INDORE", pincode: "", state: "MADHYA PRADESH",

    // Secondary Address
    secLocation: "SECONDARY ADDRESS", secInactiveLocation: false, secMobile: "",
    secPhone: "", secEmail: "", secWebsite: "",
    secAddress1: "", secAddress2: "", secAddress3: "", secAreaName: "",
    secCity: "INDORE", secPincode: "", secState: "MADHYA PRADESH",

    // Registration
    pan: "", registrationType: "Registered", gstin: "", lutNo: "",
    lutEffectDate: "", aadharNo: "", cinNo: "",
    customerCode: "", msmeNumber: "", category: "OTHER",
    salesMen: "MR. SANJAY DEVDHAR",
    
    arcParty: false, govtParty: false, msmeParty: false,
    exemptionCertNo: "", showInLoadingReport: false,
    notCheckPrefixForEcr: false, customerCylinderPrefix: "", holdingDays: 0,
    tds: false, tdsType: "", tdsSource: "",

    // Bank
    bankName: "", bankBranch: "", accountNo: "", ifscCode: "", bankAccountType: "",

    // Item/Tax
    taxCode: "", partyGroup: "", sector: "DEWAS/NANDAKHEDA",
    customerType: "BADDI", customerGrade: "", tradeType: "Local",
    testCertRemarks: "",
    
    // Collections for tables
    bankDetails: [],
    contacts: [],
    itemGroupDealings: [],

    // Financial Year
    financialYearId: localStorage.getItem("financialYear") || "2025-2026"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [allLedgers, setAllLedgers] = useState([]);
  const [showList, setShowList] = useState(false);
  const [addressIndex, setAddressIndex] = useState(1); // 1 for Default, 2 for Secondary

  const [newContact, setNewContact] = useState({ personName: "", designation: "", mobile: "", email: "", emailType: "" });

  const [newBankDetail, setNewBankDetail] = useState({ bankName: "", bankBranch: "", accountNo: "", ifscCode: "", bankAccountType: "", bankDetailsExtra: "" });

  const addBankDetail = () => {
    setFormData({ ...formData, bankDetails: [...formData.bankDetails, newBankDetail] });
    setNewBankDetail({ bankName: "", bankBranch: "", accountNo: "", ifscCode: "", bankAccountType: "", bankDetailsExtra: "" });
  };

  const removeBankDetail = (index) => {
    const updated = formData.bankDetails.filter((_, i) => i !== index);
    setFormData({ ...formData, bankDetails: updated });
  };

  const addContact = () => {
    setFormData({ ...formData, contacts: [...formData.contacts, newContact] });
    setNewContact({ personName: "", designation: "", mobile: "", email: "", emailType: "" });
  };

  const removeContact = (index) => {
    const updated = formData.contacts.filter((_, i) => i !== index);
    setFormData({ ...formData, contacts: updated });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Auto-update Under Group based on Account Type
    if (name === "accountType") {
      if (value === "Sales Party") {
        newFormData.underGroup = "SUNDRY DEBTORS FOR GOODS";
      } else if (value === "Purchase Party") {
        newFormData.underGroup = "SUNDRY CREDITORS FOR GOODS";
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await api.put(`/customer-ledgers/${formData.id}`, formData);
        alert("Customer Ledger updated successfully!");
      } else {
        await api.post("/customer-ledgers", formData);
        alert("Customer Ledger saved successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving ledger", error);
      alert("Error saving ledger. Please check backend.");
    }
  };

  const fetchLedgers = async () => {
    try {
      const response = await api.get("/customer-ledgers");
      setAllLedgers(response.data);
      setShowList(true);
    } catch (error) {
      console.error("Error fetching ledgers", error);
    }
  };

  const handleEditSelect = (ledger) => {
    setFormData(ledger);
    setIsEditing(true);
    setShowList(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ledger?")) {
      try {
        await api.delete(`/customer-ledgers/${id}`);
        fetchLedgers();
      } catch (error) {
        console.error("Error deleting ledger", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "", printName: "", accountType: "Sales Party",
      underGroup: "SUNDRY DEBTORS FOR GOODS",
      vehicleQa: false, qrCodePrint: false, inactiveAc: false, legalCase: false,
      creditDays: 0, holdingQty: 0,
      operatingType: "Bill To Bill Payment",
      location: "DEFAULT ADDRESS", inactiveLocation: false, mobile: "",
      phone: "", email: "", website: "",
      address1: "", address2: "", address3: "", areaName: "",
      city: "INDORE", pincode: "", state: "MADHYA PRADESH",
      secLocation: "SECONDARY ADDRESS", secInactiveLocation: false, secMobile: "",
      secPhone: "", secEmail: "", secWebsite: "",
      secAddress1: "", secAddress2: "", secAddress3: "", secAreaName: "",
      secCity: "INDORE", secPincode: "", secState: "MADHYA PRADESH",
      pan: "", registrationType: "Registered", gstin: "", lutNo: "",
      lutEffectDate: "", aadharNo: "", cinNo: "",
      customerCode: "", msmeNumber: "", category: "OTHER",
      salesMen: "MR. SANJAY DEVDHAR",
      arcParty: false, govtParty: false, msmeParty: false,
      exemptionCertNo: "", showInLoadingReport: false,
      notCheckPrefixForEcr: false, customerCylinderPrefix: "", holdingDays: 0,
      tds: false, tdsType: "", tdsSource: "",
      taxCode: "", partyGroup: "", sector: "DEWAS/NANDAKHEDA",
      customerType: "BADDI", customerGrade: "", tradeType: "Local",
      testCertRemarks: "",
      bankDetails: [],
      contacts: [],
      itemGroupDealings: [],
      financialYearId: localStorage.getItem("financialYear") || "2025-2026"
    });
    setIsEditing(false);
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit?")) {
      window.location.href = "/";
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
      {/* Modal List View */}
      {showList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col font-sans">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Select Customer Ledger</h2>
              <button onClick={() => setShowList(false)} className="text-white hover:text-gray-200">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-left border-b font-bold text-gray-700">Customer Name</th>
                    <th className="p-3 text-left border-b font-bold text-gray-700">City</th>
                    <th className="p-3 text-left border-b font-bold text-gray-700">Phone</th>
                    <th className="p-3 text-right border-b font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allLedgers.map((l) => (
                    <tr key={l.id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-3 border-b text-sm">{l.customerName}</td>
                      <td className="p-3 border-b text-sm">{l.city}</td>
                      <td className="p-3 border-b text-sm">{l.phone || l.mobile}</td>
                      <td className="p-3 border-b text-right space-x-2">
                        <button onClick={() => handleEditSelect(l)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 transition-colors">Select</button>
                        <button onClick={() => handleDelete(l.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-6xl mx-auto">

        {/* Header Title */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Customer Ledger A/c {isEditing ? "(Editing)" : ""}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-0">
          {/* Top Panel - Basic Info */}
          <div className="p-6 bg-blue-50/30 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 gap-x-6 items-center">

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Customer Name :</label>
              <div className="md:col-span-7">
                <input name="customerName" value={formData.customerName} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-100 bg-white font-medium" />
              </div>
              <div className="md:col-span-3"></div>

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Print Name :</label>
              <div className="md:col-span-7 flex items-center gap-4">
                <input name="printName" value={formData.printName} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-100 bg-white" />
                <label className="flex items-center space-x-2 whitespace-nowrap text-sm text-gray-600 font-medium">
                  <input type="checkbox" name="vehicleQa" checked={formData.vehicleQa} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span>Vehicle QA</span>
                </label>
                <label className="flex items-center space-x-2 whitespace-nowrap text-sm text-gray-600 font-medium">
                  <input type="checkbox" name="qrCodePrint" checked={formData.qrCodePrint} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span>QR Code Print</span>
                </label>
              </div>
              <div className="md:col-span-3"></div>

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Account Type :</label>
              <div className="md:col-span-4 flex items-center gap-4">
                <select name="accountType" value={formData.accountType} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none bg-white">
                  <option value="Sales Party">Sales Party</option>
                  <option value="Purchase Party">Purchase Party</option>
                </select>
              </div>
              <div className="md:col-span-6"></div>

              <label className="md:col-span-2 text-sm font-semibold text-gray-700 text-right">Under Group :</label>
              <div className="md:col-span-7 flex items-center gap-4">
                <select name="underGroup" value={formData.underGroup} onChange={handleChange} className="w-full border border-blue-200 focus:border-blue-500 rounded px-3 py-1.5 text-sm outline-none bg-white">
                  <option value="SUNDRY DEBTORS FOR GOODS">SUNDRY DEBTORS FOR GOODS</option>
                  <option value="SUNDRY CREDITORS FOR GOODS">SUNDRY CREDITORS FOR GOODS</option>
                </select>
                <label className="flex items-center space-x-2 whitespace-nowrap text-sm text-red-600 font-medium">
                  <input type="checkbox" name="inactiveAc" checked={formData.inactiveAc} onChange={handleChange} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                  <span>Inactive A/c</span>
                </label>
                <label className="flex items-center space-x-2 whitespace-nowrap text-sm text-orange-600 font-medium">
                  <input type="checkbox" name="legalCase" checked={formData.legalCase} onChange={handleChange} className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4" />
                  <span>Legal Case</span>
                </label>
              </div>
              <div className="md:col-span-3"></div>

              <div className="md:col-span-3"></div>
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
                    <label className="col-span-4 text-right text-sm text-gray-700">Credit Days :</label>
                    <input name="creditDays" type="number" value={formData.creditDays} onChange={handleChange} className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right" />
                    
                    <label className="col-span-2 text-right text-sm text-gray-700 ml-4">Holding Qty :</label>
                    <input name="holdingQty" type="number" value={formData.holdingQty} onChange={handleChange} className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-right" />
                  </div>
                </div>

                {/* Operating Type Box */}
                <div className="border border-blue-200 rounded-lg p-4 relative h-max">
                  <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-800">Operating Type</span>

                  <div className="flex flex-col gap-3 mt-4 ml-4">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input type="radio" name="operatingType" value="Bill To Bill Payment" checked={true} readOnly className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span>Bill To Bill Payment</span>
                    </label>
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
                      <select 
                        name={addressIndex === 1 ? "location" : "secLocation"} 
                        value={addressIndex === 1 ? formData.location : formData.secLocation} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500"
                      >
                        <option value={addressIndex === 1 ? "DEFAULT ADDRESS" : "SECONDARY ADDRESS"}>
                          {addressIndex === 1 ? "DEFAULT ADDRESS" : "SECONDARY ADDRESS"}
                        </option>
                      </select>
                    </div>
                    <div className="col-span-3 flex items-center justify-center">
                      <label className="flex items-center space-x-1 whitespace-nowrap text-xs text-gray-600">
                        <input 
                          type="checkbox" 
                          name={addressIndex === 1 ? "inactiveLocation" : "secInactiveLocation"} 
                          checked={addressIndex === 1 ? formData.inactiveLocation : formData.secInactiveLocation} 
                          onChange={handleChange} 
                          className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-3 h-3" 
                        />
                        <span>Inactive Location</span>
                      </label>
                    </div>
                    <label className="col-span-1 text-right text-xs font-semibold text-gray-700">Mobile :</label>
                    <input 
                      name={addressIndex === 1 ? "mobile" : "secMobile"} 
                      value={addressIndex === 1 ? formData.mobile : formData.secMobile} 
                      onChange={handleChange} 
                      className="col-span-2 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                    />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Phone No(s) :</label>
                    <input 
                      name={addressIndex === 1 ? "phone" : "secPhone"} 
                      value={addressIndex === 1 ? formData.phone : formData.secPhone} 
                      onChange={handleChange} 
                      className="col-span-6 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                    />
                    <div className="col-span-4"></div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">E-Mail :</label>
                    <input 
                      name={addressIndex === 1 ? "email" : "secEmail"} 
                      value={addressIndex === 1 ? formData.email : formData.secEmail} 
                      onChange={handleChange} 
                      className="col-span-10 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                    />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Website :</label>
                    <input 
                      name={addressIndex === 1 ? "website" : "secWebsite"} 
                      value={addressIndex === 1 ? formData.website : formData.secWebsite} 
                      onChange={handleChange} 
                      className="col-span-10 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                    />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700 self-start mt-1.5">Address :</label>
                    <div className="col-span-10 flex flex-col gap-0.5">
                      <input 
                        name={addressIndex === 1 ? "address1" : "secAddress1"} 
                        value={addressIndex === 1 ? formData.address1 : formData.secAddress1} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                      />
                      <input 
                        name={addressIndex === 1 ? "address2" : "secAddress2"} 
                        value={addressIndex === 1 ? formData.address2 : formData.secAddress2} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                      />
                      <input 
                        name={addressIndex === 1 ? "address3" : "secAddress3"} 
                        value={addressIndex === 1 ? formData.address3 : formData.secAddress3} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                      />
                    </div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700 mt-1">Area Name :</label>
                    <div className="col-span-10 mt-1">
                      <input 
                        name={addressIndex === 1 ? "areaName" : "secAreaName"} 
                        value={addressIndex === 1 ? formData.areaName : formData.secAreaName} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                      />
                    </div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">City :</label>
                    <div className="col-span-6 flex gap-1">
                      <input 
                        name={addressIndex === 1 ? "city" : "secCity"} 
                        value={addressIndex === 1 ? formData.city : formData.secCity} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Pincode :</label>
                    <input 
                      name={addressIndex === 1 ? "pincode" : "secPincode"} 
                      value={addressIndex === 1 ? formData.pincode : formData.secPincode} 
                      onChange={handleChange} 
                      className="col-span-2 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
                    />

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">State Name :</label>
                    <div className="col-span-6">
                      <select 
                        name={addressIndex === 1 ? "state" : "secState"} 
                        value={addressIndex === 1 ? formData.state : formData.secState} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500"
                      >
                        <option value="">-- Select State --</option>
                        {[
                          "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR", "CHHATTISGARH", 
                          "GOA", "GUJARAT", "HARYANA", "HIMACHAL PRADESH", "JHARKHAND", 
                          "KARNATAKA", "KERALA", "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR", 
                          "MEGHALAYA", "MIZORAM", "NAGALAND", "ODISHA", "PUNJAB", 
                          "RAJASTHAN", "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA", 
                          "UTTAR PRADESH", "UTTARAKHAND", "WEST BENGAL", "ANDAMAN AND NICOBAR ISLANDS",
                          "CHANDIGARH", "DADRA AND NAGAR HAVELI AND DAMAN AND DIU", "DELHI",
                          "JAMMU AND KASHMIR", "LADAKH", "LAKSHADWEEP", "PUDUCHERRY"
                        ].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-4 flex items-center justify-end gap-2 pr-2">
                      <button 
                        type="button" 
                        onClick={() => setAddressIndex(1)}
                        className={`p-0.5 border border-gray-300 rounded text-xs px-2 shadow-sm ${addressIndex === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <span className="text-[10px]">◀</span>
                      </button>
                      <span className="text-xs font-semibold text-gray-700">{addressIndex} of 2</span>
                      <button 
                        type="button" 
                        onClick={() => setAddressIndex(2)}
                        className={`p-0.5 border border-gray-300 rounded text-xs px-2 shadow-sm ${addressIndex === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <span className="text-[10px]">▶</span>
                      </button>
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
                        {formData.contacts.map((contact, idx) => (
                          <tr key={idx} className="hover:bg-blue-50">
                            <td className="py-1.5 px-2 border-r border-b border-blue-100 flex justify-between items-center">
                              <span>{contact.personName}</span>
                              <button type="button" onClick={() => removeContact(idx)} className="text-red-600 font-bold ml-2">x</button>
                            </td>
                            <td className="py-1.5 px-2 border-r border-b border-blue-100 uppercase">{contact.designation}</td>
                            <td className="py-1.5 px-2 border-r border-b border-blue-100">{contact.mobile}</td>
                            <td className="py-1.5 px-2 border-r border-b border-blue-100 text-blue-700">{contact.email}</td>
                            <td className="py-1.5 px-2 border-r border-b border-blue-100">{contact.emailType}</td>
                          </tr>
                        ))}
                        {/* Input row for new contact */}
                        <tr className="bg-white">
                          <td className="p-0.5 border-r border-b border-gray-200">
                            <input
                              value={newContact.personName}
                              onChange={(e) => setNewContact({ ...newContact, personName: e.target.value })}
                              placeholder="Name"
                              className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded"
                            />
                          </td>
                          <td className="p-0.5 border-r border-b border-gray-200">
                            <input
                              value={newContact.designation}
                              onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                              placeholder="Designation"
                              className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded"
                            />
                          </td>
                          <td className="p-0.5 border-r border-b border-gray-200">
                            <input
                              value={newContact.mobile}
                              onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                              placeholder="Mobile"
                              className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded"
                            />
                          </td>
                          <td className="p-0.5 border-r border-b border-gray-200">
                            <input
                              value={newContact.email}
                              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                              placeholder="Email"
                              className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded"
                            />
                          </td>
                          <td className="p-0.5 border-r border-b border-gray-200 flex gap-1">
                            <input
                              value={newContact.emailType}
                              onChange={(e) => setNewContact({ ...newContact, emailType: e.target.value })}
                              placeholder="Type"
                              className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded"
                            />
                            <button type="button" onClick={addContact} className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">Add</button>
                          </td>
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
                      <input name="pan" value={formData.pan} onChange={handleChange} className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500 uppercase" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">GST Reg.Type :</label>
                      <select name="registrationType" value={formData.registrationType} onChange={handleChange} className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500">
                        <option value="Registered">Registered</option>
                        <option value="Unregistered">Unregistered</option>
                      </select>

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">GST No :</label>
                      <input name="gstin" value={formData.gstin} onChange={handleChange} className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500 uppercase" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">LUT No :</label>
                      <input name="lutNo" value={formData.lutNo} onChange={handleChange} className="col-span-4 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                      <label className="col-span-2 text-right text-[11px] font-semibold text-gray-700">Effect Date :</label>
                      <input type="date" name="lutEffectDate" value={formData.lutEffectDate} onChange={handleChange} className="col-span-3 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Aadhar No :</label>
                      <input name="aadharNo" value={formData.aadharNo} onChange={handleChange} className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">CIN No :</label>
                      <input name="cinNo" value={formData.cinNo} onChange={handleChange} className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Customer Code :</label>
                      <input name="customerCode" value={formData.customerCode} onChange={handleChange} className="col-span-4 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                      <label className="col-span-2 text-right text-[11px] font-semibold text-gray-700">MSME/Udyam :</label>
                      <input name="msmeNumber" value={formData.msmeNumber} onChange={handleChange} className="col-span-3 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Category :</label>
                      <input name="category" value={formData.category} onChange={handleChange} className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />

                      <label className="col-span-3 text-right text-[11px] font-semibold text-gray-700">Sales Men :</label>
                      <input name="salesMen" value={formData.salesMen} onChange={handleChange} className="col-span-9 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500 uppercase" />
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
                            <input type="checkbox" name="arcParty" checked={formData.arcParty} onChange={handleChange} className="rounded border-gray-400 w-3 h-3" /> <span>ARC Party</span>
                          </label>
                          <label className="flex items-center space-x-1 text-[11px] text-gray-600">
                            <input type="checkbox" name="govtParty" checked={formData.govtParty} onChange={handleChange} className="rounded border-gray-400 w-3 h-3" /> <span>Government Party</span>
                          </label>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-gray-600 mb-1">
                          <input type="checkbox" name="msmeParty" checked={formData.msmeParty} onChange={handleChange} className="rounded border-gray-400 w-3 h-3" /> <span>MSME Party</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-gray-700">Exemption Certi.No :</span>
                          <input name="exemptionCertNo" value={formData.exemptionCertNo} onChange={handleChange} className="w-1/2 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-gray-600">
                          <input type="checkbox" name="showInLoadingReport" checked={formData.showInLoadingReport} onChange={handleChange} className="rounded border-gray-400 w-3 h-3" /> <span>Show In Loading / Unloading Report</span>
                        </div>
                      </div>
                    </div>

                    {/* Cylinder Related Detail */}
                    <div className="border border-blue-300 rounded p-1 relative bg-white">
                      <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-gray-700">Cylinder Related Detail</span>
                      <div className="mt-3 p-2 flex flex-col gap-1.5">
                        <label className="flex items-center space-x-1 text-[11px] text-gray-600">
                          <input type="checkbox" name="notCheckPrefixForEcr" checked={formData.notCheckPrefixForEcr} onChange={handleChange} className="rounded border-gray-400 w-3 h-3" /> <span>Not Check Prefix For ECR</span>
                        </label>
                        <div className="flex gap-2 items-center">
                          <label className="w-[120px] text-right text-[11px] font-semibold text-gray-700">Customer Cylinder Prefix :</label>
                          <input name="customerCylinderPrefix" value={formData.customerCylinderPrefix} onChange={handleChange} className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="w-[120px] text-right text-[11px] font-semibold text-gray-700">Holding Days :</label>
                          <input name="holdingDays" type="number" value={formData.holdingDays} onChange={handleChange} className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* TDS Detail */}
                    <div className="border border-blue-300 rounded p-1 relative bg-white">
                      <span className="absolute -top-3 left-4 bg-white px-2 text-[11px] font-bold text-gray-700">TDS Detail</span>
                      <div className="mt-3 p-2 flex flex-col gap-1">
                        <div className="flex items-center justify-center mb-1">
                          <label className="flex items-center space-x-1 text-[11px] text-gray-600">
                            <input type="checkbox" name="tds" checked={formData.tds} onChange={handleChange} className="rounded border-gray-400 w-3 h-3" /> <span>TDS</span>
                          </label>
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="w-10 text-right text-[11px] font-semibold text-gray-700">Type :</label>
                          <select name="tdsType" value={formData.tdsType} onChange={handleChange} className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500"><option></option></select>
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="w-10 text-right text-[11px] font-semibold text-gray-700">Source :</label>
                          <select name="tdsSource" value={formData.tdsSource} onChange={handleChange} className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-[11px] outline-none bg-white focus:border-blue-500"><option></option></select>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bank Sub-table - binding first row for simplicity */}
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
                      {formData.bankDetails?.map((bank, idx) => (
                        <tr key={idx} className="hover:bg-blue-50">
                          <td className="py-1.5 px-2 border-r border-b border-blue-100 flex justify-between items-center">
                            <span>{bank.bankName}</span>
                            <button type="button" onClick={() => removeBankDetail(idx)} className="text-red-600 font-bold ml-2">x</button>
                          </td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100">{bank.bankBranch}</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100">{bank.accountNo}</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100 uppercase">{bank.ifscCode}</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100">{bank.bankAccountType}</td>
                          <td className="py-1.5 px-2 border-r border-b border-blue-100">{bank.bankDetailsExtra}</td>
                        </tr>
                      ))}
                      <tr className="bg-white">
                        <td className="p-0.5 border-r border-b border-gray-200"><input value={newBankDetail.bankName} onChange={(e) => setNewBankDetail({ ...newBankDetail, bankName: e.target.value })} className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded" placeholder="Bank Name" /></td>
                        <td className="p-0.5 border-r border-b border-gray-200"><input value={newBankDetail.bankBranch} onChange={(e) => setNewBankDetail({ ...newBankDetail, bankBranch: e.target.value })} className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded" placeholder="Branch" /></td>
                        <td className="p-0.5 border-r border-b border-gray-200"><input value={newBankDetail.accountNo} onChange={(e) => setNewBankDetail({ ...newBankDetail, accountNo: e.target.value })} className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded" placeholder="A/c No" /></td>
                        <td className="p-0.5 border-r border-b border-gray-200"><input value={newBankDetail.ifscCode} onChange={(e) => setNewBankDetail({ ...newBankDetail, ifscCode: e.target.value })} className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded" placeholder="IFSC Code" /></td>
                        <td className="p-0.5 border-r border-b border-gray-200"><input value={newBankDetail.bankAccountType} onChange={(e) => setNewBankDetail({ ...newBankDetail, bankAccountType: e.target.value })} className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded" placeholder="A/c Type" /></td>
                        <td className="p-0.5 border-b border-gray-200 flex gap-1">
                          <input value={newBankDetail.bankDetailsExtra} onChange={(e) => setNewBankDetail({ ...newBankDetail, bankDetailsExtra: e.target.value })} className="w-full text-[11px] px-1 py-1 outline-none border border-gray-300 rounded" placeholder="Extra" />
                          <button type="button" onClick={addBankDetail} className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">Add</button>
                        </td>
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
                    <select name="taxCode" value={formData.taxCode} onChange={handleChange} className="col-span-8 border border-gray-300 rounded px-2 py-1 text-xs outline-none bg-white focus:border-blue-500">
                      <option></option>
                      <option value="GST Local">GST Local</option>
                      <option value="GST Interested">GST Interested</option>
                    </select>
                    <div className="col-span-2"></div>

                    <label className="col-span-2 text-right text-xs font-semibold text-gray-700">Local / Export :</label>
                    <select name="tradeType" value={formData.tradeType} onChange={handleChange} className="col-span-8 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 bg-blue-600 text-white">
                      <option value="Local">Local</option>
                      <option value="Export">Export</option>
                    </select>
                    <div className="col-span-2"></div>
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
                          {[
                            "6 GRADE GAS", "ARGON", "AIR COMPRESSOR", "AIR CONDITION", 
                            "AIR SAMPLING PUMP", "AMMONIA", "AMMONIA SHED", "BALL VALVE"
                          ].map((item, idx) => (
                            <tr key={idx} className={`hover:bg-blue-50 border-b border-gray-200 ${idx % 2 === 1 ? 'bg-blue-50/50' : ''}`}>
                              <td className="py-1.5 px-2 border-l border-r border-gray-300 flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  className="w-3 h-3 text-blue-600 rounded" 
                                  checked={formData.itemGroupDealings.includes(item)}
                                  onChange={(e) => {
                                    const newList = e.target.checked
                                      ? [...formData.itemGroupDealings, item]
                                      : formData.itemGroupDealings.filter(i => i !== item);
                                    setFormData({...formData, itemGroupDealings: newList});
                                  }}
                                />
                                <span className="font-semibold uppercase text-gray-700">{item}</span>
                              </td>
                              <td className="py-1.5 px-2 border-r border-gray-300"></td>
                            </tr>
                          ))}
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
                {isEditing ? "Update" : "Add"}
              </button>
              <button type="button" onClick={fetchLedgers} className="px-5 py-2 bg-blue-600 text-white rounded font-bold text-sm shadow hover:bg-blue-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Edit / List
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-500 text-white rounded font-bold text-sm shadow hover:bg-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                New / Clear
              </button>
              <button type="button" onClick={handleExit} className="px-5 py-2 bg-red-600 text-white rounded font-bold text-sm shadow hover:bg-red-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Exit
              </button>
            </div>

            <div className="flex space-x-2">
              <button type="button" className="px-4 py-2 bg-yellow-500 text-white rounded font-bold text-sm shadow hover:bg-yellow-600 flex items-center">
                Attachment
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CustomerLedger;
