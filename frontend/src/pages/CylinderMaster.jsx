import React, { useState, useEffect } from "react";
import api from "../api/axios";

const CylinderMaster = () => {
  const initialFormState = {
    cylinderOriginalNo: "", cylinderOwnership: "VADILAL CHEMICALS LTD - POR",
    mode: "Cylinder", customerPrefix: "", cylRotationNo: "",
    make: "", itemGrade: "HYDROGEN", cylinderType: "4.5 LTR W.C ALU CYLINDER",
    bodyType: "", wcType: "", capacity: "1.000", useIn: "Trd.",
    importedCylinder: false, hydroTestDays: "1095", lastHdDate: "",
    hdReminderDays: "30", cylinderStatus: "U-In Used", tareWeight: "0.000",
    
    // Purchase Details
    pBillNo: "", pBillDate: "",
    pSupplierName: "", pEcrNo: "", pRate: "0.00",
    
    // Sales Details
    sBillNo: "", sBillDate: "", sCustomerName: "", sGdaNo: "", sRate: "0.00",
    
    // SKID Details
    skidCylinderNoUse: "",
    skidReCheck: false, skidCheckDate: "", lastHeatDate: "", lastPaintDate: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [allCylinders, setAllCylinders] = useState([]);
  const [showList, setShowList] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await api.put(`/cylinders/${formData.id}`, formData);
        alert("Cylinder Master updated successfully!");
      } else {
        await api.post("/cylinders", formData);
        alert("Cylinder Master saved successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving cylinder", error);
      alert("Error saving data. Please check if backend is running.");
    }
  };

  const fetchCylinders = async () => {
    try {
      const response = await api.get("/cylinders");
      setAllCylinders(response.data);
      setShowList(true);
    } catch (error) {
      console.error("Error fetching cylinders", error);
      alert("Error fetching data.");
    }
  };

  const handleEditSelect = (cylinder) => {
    setFormData(cylinder);
    setIsEditing(true);
    setShowList(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this cylinder?")) {
      try {
        await api.delete(`/cylinders/${id}`);
        fetchCylinders();
      } catch (error) {
        console.error("Error deleting cylinder", error);
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit?")) {
      window.location.href = "/";
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans text-xs">
      
      {/* Modal List View */}
      {showList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
              <h2 className="text-sm font-bold">Select Cylinder</h2>
              <button onClick={() => setShowList(false)} className="text-white hover:text-gray-200">✖</button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left border">Original No</th>
                    <th className="p-2 text-left border">Ownership</th>
                    <th className="p-2 text-left border">Grade</th>
                    <th className="p-2 text-right border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCylinders.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50">
                      <td className="p-2 border">{c.cylinderOriginalNo}</td>
                      <td className="p-2 border">{c.cylinderOwnership}</td>
                      <td className="p-2 border">{c.itemGrade}</td>
                      <td className="p-2 border text-right space-x-2">
                        <button onClick={() => handleEditSelect(c)} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-300">Select</button>
                        <button onClick={() => handleDelete(c.id)} className="bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow-md border border-gray-300 max-w-6xl mx-auto overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center gap-2">
            <span className="text-blue-800 font-bold">📋 Cylinder Master {isEditing ? "(Editing)" : ""}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-12 gap-6">
          
          {/* Left Column - Main Details (8 cols) */}
          <div className="col-span-8 space-y-2">
            
            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Original No :</label>
              <div className="col-span-4">
                <input required name="cylinderOriginalNo" value={formData.cylinderOriginalNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 outline-none focus:border-blue-500" />
              </div>
              <div className="col-span-5 flex items-center justify-center gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="mode" value="Cylinder" checked={formData.mode === "Cylinder"} onChange={handleChange} />
                  <span>Cylinder</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="mode" value="SKID" checked={formData.mode === "SKID"} onChange={handleChange} />
                  <span>SKID</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Ownership :</label>
              <div className="col-span-9">
                <select name="cylinderOwnership" value={formData.cylinderOwnership} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 outline-none bg-white">
                  <option>VADILAL CHEMICALS LTD - POR</option>
                  <option>VADILAL GASES LTD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Customer Prefix :</label>
              <div className="col-span-3">
                <input name="customerPrefix" value={formData.customerPrefix} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
              <label className="col-span-3 text-right font-semibold">Cyl. Rotation No :</label>
              <div className="col-span-3">
                <input name="cylRotationNo" value={formData.cylRotationNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Make :</label>
              <div className="col-span-9">
                <select name="make" value={formData.make} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                  <option value="">-- Select Make --</option>
                  <option value="ISI">ISI</option>
                  <option value="IMPORTED">IMPORTED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Item Grade :</label>
              <div className="col-span-9">
                <select name="itemGrade" value={formData.itemGrade} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                  <option>HYDROGEN</option>
                  <option>OXYGEN</option>
                  <option>NITROGEN</option>
                  <option>ARGON</option>
                  <option>CO2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Type :</label>
              <div className="col-span-9">
                <select name="cylinderType" value={formData.cylinderType} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                  <option>4.5 LTR W.C ALU CYLINDER</option>
                  <option>7.0 LTR W.C STEEL CYLINDER</option>
                  <option>10.0 LTR W.C STEEL CYLINDER</option>
                  <option>47.0 LTR W.C STEEL CYLINDER</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Body Type :</label>
              <div className="col-span-9">
                <select name="bodyType" value={formData.bodyType} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                  <option value=""></option>
                  <option value="STEEL">STEEL</option>
                  <option value="ALUMINIUM">ALUMINIUM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder W.C Type :</label>
              <div className="col-span-9">
                <select name="wcType" value={formData.wcType} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                  <option value=""></option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Capacity :</label>
              <div className="col-span-2">
                <input name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 text-right" />
              </div>
              <label className="col-span-2 text-right font-semibold">Cylinder Use In :</label>
              <div className="col-span-2">
                <select name="useIn" value={formData.useIn} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                  <option>Trd.</option>
                  <option>Mfg.</option>
                </select>
              </div>
              <div className="col-span-3 flex items-center gap-1 justify-end">
                <input type="checkbox" name="importedCylinder" checked={formData.importedCylinder} onChange={handleChange} />
                <span>Imported Cylinder</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1 items-center">
              <label className="col-span-2 text-right font-semibold whitespace-nowrap">Hydro Test Days :</label>
              <div className="col-span-2">
                <input name="hydroTestDays" value={formData.hydroTestDays} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
              <label className="col-span-2 text-right font-semibold whitespace-nowrap">Last HD Date :</label>
              <div className="col-span-3">
                <input type="date" name="lastHdDate" value={formData.lastHdDate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-0.5" />
              </div>
              <label className="col-span-2 text-right font-semibold whitespace-nowrap">H.D Reminder Days :</label>
              <div className="col-span-1">
                <input name="hdReminderDays" value={formData.hdReminderDays} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Status :</label>
              <div className="col-span-4">
                <select name="cylinderStatus" value={formData.cylinderStatus} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white text-blue-800">
                  <option>U-In Used</option>
                  <option>Broken</option>
                  <option>Scrap</option>
                </select>
              </div>
              <label className="col-span-2 text-right font-semibold">Tare Weight :</label>
              <div className="col-span-3">
                <input name="tareWeight" value={formData.tareWeight} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 text-right" />
              </div>
            </div>

            {/* Purchase Detail Section */}
            <div className="border border-blue-400 rounded p-2 mt-4 relative bg-blue-50/10">
              <span className="absolute -top-3 left-3 bg-white px-2 font-bold text-blue-800">Cylinder Purchase Detail</span>
              <div className="grid grid-cols-12 gap-2 items-center mt-2">
                <label className="col-span-2 text-right">Bill No :</label>
                <div className="col-span-4">
                  <input name="pBillNo" value={formData.pBillNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
                </div>
                <label className="col-span-2 text-right">Bill Date :</label>
                <div className="col-span-4">
                  <input type="date" name="pBillDate" value={formData.pBillDate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-0.5" />
                </div>
                
                <label className="col-span-2 text-right">Supplier Name :</label>
                <div className="col-span-10">
                  <select name="pSupplierName" value={formData.pSupplierName} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                    <option value=""></option>
                  </select>
                </div>

                <label className="col-span-3 text-right">ECR No / FTM No :</label>
                <div className="col-span-5">
                  <select name="pEcrNo" value={formData.pEcrNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                    <option value=""></option>
                  </select>
                </div>
                <label className="col-span-1 text-right">Rate :</label>
                <div className="col-span-3">
                  <input name="pRate" value={formData.pRate} onChange={handleChange} className="w-full border border-blue-400 px-2 py-1 text-right font-semibold" />
                </div>
              </div>
            </div>

            {/* Sales Detail Section */}
            <div className="border border-green-500 rounded p-2 mt-4 relative bg-green-50/10">
              <span className="absolute -top-3 left-3 bg-white px-2 font-bold text-green-800">Cylinder Sales Detail</span>
              <div className="grid grid-cols-12 gap-2 items-center mt-2">
                <label className="col-span-2 text-right">Bill No :</label>
                <div className="col-span-4">
                  <input name="sBillNo" value={formData.sBillNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
                </div>
                <label className="col-span-2 text-right">Bill Date :</label>
                <div className="col-span-4">
                  <input type="date" name="sBillDate" value={formData.sBillDate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-0.5" />
                </div>
                
                <label className="col-span-2 text-right">Customer Name :</label>
                <div className="col-span-10">
                  <select name="sCustomerName" value={formData.sCustomerName} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                    <option value=""></option>
                  </select>
                </div>

                <label className="col-span-2 text-right">GDA No :</label>
                <div className="col-span-6">
                  <select name="sGdaNo" value={formData.sGdaNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                    <option value=""></option>
                  </select>
                </div>
                <label className="col-span-1 text-right">Rate :</label>
                <div className="col-span-3">
                  <input name="sRate" value={formData.sRate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 text-right" />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - SKID and other info (4 cols) */}
          <div className="col-span-4 flex flex-col gap-4">
            
            <div className="border border-gray-300 h-64 relative bg-gray-50 flex flex-col">
              <div className="bg-gray-200 border-b border-gray-300 p-1 font-semibold flex justify-between">
                <span>Cylinder No Use In SKID</span>
                <span className="text-gray-400">✖</span>
              </div>
              <textarea name="skidCylinderNoUse" value={formData.skidCylinderNoUse} onChange={handleChange} className="flex-1 w-full p-2 outline-none resize-none bg-white font-mono text-sm" />
            </div>

            <div className="border border-gray-300 p-3 space-y-3 bg-white rounded shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">SKID Cylinder Re-Check :</span>
                    <input type="checkbox" name="skidReCheck" checked={formData.skidReCheck} onChange={handleChange} className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                    <label className="block text-gray-600">SKID Cylinder Check Date :</label>
                    <input type="date" name="skidCheckDate" value={formData.skidCheckDate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-0.5 outline-none bg-white" />
                </div>
                <div className="space-y-1">
                    <label className="block text-gray-600">Last Date Of Heat :</label>
                    <input type="date" name="lastHeatDate" value={formData.lastHeatDate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-0.5 outline-none bg-white" />
                </div>
                <div className="space-y-1">
                    <label className="block text-gray-600">Last Date Of Paint :</label>
                    <input type="date" name="lastPaintDate" value={formData.lastPaintDate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-0.5 outline-none bg-white" />
                </div>
            </div>

          </div>

          {/* Buttons Footer */}
          <div className="col-span-12 mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
             <div className="flex gap-2">
                <button type="submit" className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-1 flex items-center gap-1 font-semibold rounded shadow-sm">
                    <span className="text-green-600 text-lg">➕</span> {isEditing ? "SAVE CHANGE" : "ADD"}
                </button>
                <button type="button" onClick={fetchCylinders} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-1 flex items-center gap-1 font-semibold rounded shadow-sm">
                    <span className="text-yellow-600 text-lg">✏️</span> EDIT / LIST
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-1 flex items-center gap-1 font-semibold rounded shadow-sm">
                    <span className="text-blue-600 text-lg">👁️</span> CLEAR
                </button>
                <button type="button" onClick={handleExit} className="bg-red-50 hover:bg-red-100 border border-red-300 px-4 py-1 flex items-center gap-1 font-semibold text-red-700 rounded shadow-sm">
                    <span className="text-red-500 text-lg">🏃</span> EXIT
                </button>
             </div>
             
             <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded font-bold shadow-md transition-all">
                Attachement
             </button>
          </div>
        
        </form>

        {/* Status Bar */}
        <div className="bg-[#1e293b] text-white p-1 text-[10px] flex justify-between items-center px-4">
            <div className="flex gap-4">
                <span>User : HEMANT</span>
                <span>Date : {new Date().toLocaleDateString()}</span>
                <span>Time : {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex gap-4">
                <span>CAPS</span>
                <span>NUM</span>
                <span>INS</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CylinderMaster;
