import React, { useState, useEffect } from "react";
import api from "../api/axios";
import AttachmentModal from "../components/AttachmentModal";

const CylinderMaster = () => {
  const initialFormState = {
    cylinderOriginalNo: "", cylinderOwnership: "shivshakti",
    cylRotationNo: "",
    make: "", itemGrade: "", cylinderType: "4.5 LTR W.C ALU CYLINDER",
    bodyType: "", capacity: "1.000", useIn: "Trd.",
    importedCylinder: false, cylinderStatus: "U-In Used",

    // Purchase Details
    pBillNo: "", pBillDate: "",
    pSupplierName: "", pEcrNo: "", pRate: "0.00"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [allCylinders, setAllCylinders] = useState([]);
  const [showList, setShowList] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [itemGroupOptions, setItemGroupOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);

  useEffect(() => {
    fetchItemGroups();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/supplier-ledgers');
      setSupplierOptions(response.data.map(s => s.supplierName));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchItemGroups = async () => {
    try {
      const response = await api.get('/item-groups');
      setItemGroupOptions(response.data.map(g => g.name));
    } catch (error) {
      console.error("Error fetching item groups:", error);
    }
  };

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
      const isNetworkErr = !error.response || error.code === 'ERR_NETWORK';
      alert(isNetworkErr
        ? "Network Error: Could not connect to backend server. If using Render free tier, the server may take ~50s to wake up, or your Backend URL is not set. Please click 'Server API' in the top bar to verify or configure the URL."
        : "Error saving cylinder: " + (error.response?.data?.message || error.message));
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

  const fileInputRef = React.useRef(null);
  const handleAttachmentClick = () => {
    if (!formData.id) {
      alert("Please save this cylinder first before adding attachments.");
      return;
    }
    setShowAttachmentModal(true);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans text-xs">

      <AttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        referenceType="CYLINDER"
        referenceId={formData.id}
      />

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
                    <th className="p-2 text-left border">Cylinder Type</th>
                    <th className="p-2 text-right border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCylinders.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50">
                      <td className="p-2 border">{c.cylinderOriginalNo}</td>
                      <td className="p-2 border">{c.cylinderOwnership}</td>
                      <td className="p-2 border">{c.itemGrade}</td>
                      <td className="p-2 border">{c.cylinderType}</td>
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

          {/* Main Details */}
          <div className="col-span-12 max-w-4xl mx-auto w-full space-y-2">

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Original No :</label>
              <div className="col-span-4">
                <input required name="cylinderOriginalNo" value={formData.cylinderOriginalNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 outline-none focus:border-blue-500" />
              </div>
              <div className="col-span-5 flex items-center justify-center gap-4">
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Ownership :</label>
              <div className="col-span-9">
                <select name="cylinderOwnership" value={formData.cylinderOwnership} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 outline-none bg-white">
                  <option value="shivshakti">shivshakti</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cyl. Rotation No :</label>
              <div className="col-span-9">
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
                  <option value="">-- Select Item Grade --</option>
                  {itemGroupOptions.map((group, idx) => (
                    <option key={idx} value={group}>{group}</option>
                  ))}
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

            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Status :</label>
              <div className="col-span-9">
                <select name="cylinderStatus" value={formData.cylinderStatus} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white text-blue-800">
                  <option>U-In Used</option>
                  <option>Broken</option>
                  <option>Scrap</option>
                </select>
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
                    <option value="">-- Select Supplier --</option>
                    {supplierOptions.map((supp, idx) => (
                      <option key={idx} value={supp}>{supp}</option>
                    ))}
                  </select>
                </div>

                <label className="col-span-2 text-right">Rate :</label>
                <div className="col-span-10">
                  <input name="pRate" value={formData.pRate} onChange={handleChange} className="w-full border border-blue-400 px-2 py-1 text-right font-semibold" />
                </div>
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
              <button type="button" onClick={fetchCylinders} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-1 flex items-center gap-1 font-semibold rounded shadow-sm">
                <span className="text-purple-600 text-lg">👁️</span> VIEW
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-1 flex items-center gap-1 font-semibold rounded shadow-sm">
                <span className="text-blue-600 text-lg">🔄</span> CLEAR
              </button>
              <button type="button" onClick={handleExit} className="bg-red-50 hover:bg-red-100 border border-red-300 px-4 py-1 flex items-center gap-1 font-semibold text-red-700 rounded shadow-sm">
                <span className="text-red-500 text-lg">🏃</span> EXIT
              </button>
            </div>

            <div>
              <button type="button" onClick={handleAttachmentClick} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded font-bold shadow-md transition-all">
                Attachment
              </button>
            </div>
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
