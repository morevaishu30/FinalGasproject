import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const MaterialInwardFTM = () => {
  const [formData, setFormData] = useState({
    entryNo: '',
    entryDate: new Date().toISOString().split('T')[0],
    customerName: '',
    cylProperty: 'O',
    etmNo: '',
    bookName: '',
    vehicleType: 'Transporter',
    contractor: '',
    vehicleRegNo: '',
    replacement: false,
    calculateLoadingAmt: true,
    notBillable: false
  });

  const [items, setItems] = useState(
    [...Array(15)].map(() => ({
      cylinderNo: '',
      capacity: '',
      itemDescription: '',
      unit: '',
    }))
  );

  const [customerOptions, setCustomerOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [etmEntries, setEtmEntries] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [custRes, suppRes, etmRes] = await Promise.all([
        api.get('/customer-ledgers'),
        api.get('/supplier-ledgers'),
        api.get('/empty-cylinder-etm'),
      ]);
      setCustomerOptions(custRes.data.map(c => c.customerName));
      setContractorOptions(suppRes.data.map(s => s.supplierName));
      const sortedEtm = [...(etmRes.data || [])].sort((a, b) => (b.id || 0) - (a.id || 0));
      setEtmEntries(sortedEtm);
      setFormData(prev => ({ ...prev, entryNo: 'PO26FTM/00067' }));
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleEtmChange = (e) => {
    const serialNo = e.target.value;
    const etm = etmEntries.find((entry) => entry.serialNo === serialNo);
    if (!etm) {
      setFormData((prev) => ({ ...prev, etmNo: serialNo }));
      return;
    }
    const mapped = (etm.items || [])
      .filter((item) => item.cylinderNo || item.itemDescription)
      .map((item) => ({
        cylinderNo: item.cylinderNo || '',
        capacity: item.capacity || '',
        itemDescription: item.itemDescription || '',
        unit: item.unit || '',
      }));
    while (mapped.length < 15) {
      mapped.push({ cylinderNo: '', capacity: '', itemDescription: '', unit: '' });
    }
    setFormData((prev) => ({
      ...prev,
      etmNo: serialNo,
      customerName: etm.partyName || prev.customerName,
      vehicleType: etm.vehicleType || prev.vehicleType,
      contractor: etm.contractor || prev.contractor,
      vehicleRegNo: etm.vehicleRegNo || prev.vehicleRegNo,
    }));
    setItems(mapped);
  };

  const handleSave = async () => {
    if (!formData.customerName) {
      alert("Please select a customer.");
      return;
    }
    if (!formData.etmNo) {
      alert("Please select an ETM No from outward entry.");
      return;
    }

    const filteredItems = items.filter(item => item.cylinderNo && item.itemDescription);
    if (filteredItems.length === 0) {
      alert("Please add at least one cylinder entry.");
      return;
    }

    const payload = {
      ...formData,
      items: filteredItems
    };

    try {
      await api.post('/material-inward-ftm', payload);
      alert("Material Inward (FTM) saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving FTM:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  const filledRows = items.filter(i => i.cylinderNo || i.itemDescription).length;

  const fieldCls = "border border-gray-400 px-2 bg-white h-7 text-[11px] shadow-inner outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-300 rounded-sm";
  const labelCls = "w-28 text-right pr-2 text-gray-800 shrink-0";

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-3 flex flex-col" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
      {/* Header form */}
      <div className="bg-[#f0f0f0] border border-gray-400 rounded-sm shadow-sm p-3 mb-3">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300">
          <h2 className="text-[#000080] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="text-base">📁</span>
            Material Inward (Cylinder) (Supplier) (FTM)
          </h2>
          <span className="text-[10px] text-gray-600 bg-white border border-gray-300 px-2 py-0.5 rounded">
            Outward ETM available: <strong className="text-[#000080]">{etmEntries.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className={labelCls}>Entry No :</label>
              <input type="text" name="entryNo" value={formData.entryNo} onChange={handleInputChange} className={`${fieldCls} w-44 bg-[#e8f4fc]`} readOnly />
              <label className="w-12 text-right pr-1 text-gray-800">Date :</label>
              <input type="date" name="entryDate" value={formData.entryDate} onChange={handleInputChange} className={`${fieldCls} w-36`} />
            </div>
            <div className="flex items-center">
              <label className={labelCls}>Customer :</label>
              <select name="customerName" value={formData.customerName} onChange={handleInputChange} className={`${fieldCls} flex-1 max-w-md`}>
                <option value="">-- Select Customer --</option>
                {customerOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center">
                <label className={labelCls}>Cyl.Property :</label>
                <select name="cylProperty" value={formData.cylProperty} onChange={handleInputChange} className={`${fieldCls} w-16`}>
                  <option value="O">O</option>
                  <option value="C">C</option>
                  <option value="N">N</option>
                  <option value="S">S</option>
                </select>
              </div>
              <div className="flex items-center flex-1 min-w-[200px]">
                <label className="w-20 text-right pr-2 text-gray-800 shrink-0">ETM No :</label>
                <select name="etmNo" value={formData.etmNo} onChange={handleEtmChange} className={`${fieldCls} flex-1 max-w-xs bg-[#fffef0] font-semibold text-[#000080]`}>
                  <option value="">-- Select from Outward ETM --</option>
                  {etmEntries.map((entry) => (
                    <option key={entry.id} value={entry.serialNo}>
                      {entry.serialNo} {entry.partyName ? `— ${entry.partyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <label className={labelCls}>Book Name :</label>
              <input type="text" name="bookName" value={formData.bookName} onChange={handleInputChange} className={`${fieldCls} flex-1 max-w-md`} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className={labelCls}>Vehicle Type :</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className={`${fieldCls} w-48`}>
                <option value="Transporter">Transporter</option>
                <option value="Own">Own</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className={labelCls}>Contractor :</label>
              <select name="contractor" value={formData.contractor} onChange={handleInputChange} className={`${fieldCls} flex-1 max-w-xs`}>
                <option value="">-- Select Contractor --</option>
                {contractorOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <label className={labelCls}>Vehicle Reg No :</label>
              <input type="text" name="vehicleRegNo" value={formData.vehicleRegNo} onChange={handleInputChange} className={`${fieldCls} w-48`} />
            </div>
            <div className="flex flex-wrap items-center gap-4 pl-28 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-800">
                <input type="checkbox" name="replacement" checked={formData.replacement} onChange={handleInputChange} className="w-3.5 h-3.5 accent-blue-700" />
                <span>Replacement</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-800">
                <input type="checkbox" name="calculateLoadingAmt" checked={formData.calculateLoadingAmt} onChange={handleInputChange} className="w-3.5 h-3.5 accent-blue-700" />
                <span>Calculate Loading Amt</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-800">
                <input type="checkbox" name="notBillable" checked={formData.notBillable} onChange={handleInputChange} className="w-3.5 h-3.5 accent-blue-700" />
                <span>Not Billable</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 flex flex-col min-h-[320px] bg-white border border-gray-400 rounded-sm shadow-sm overflow-hidden mb-3">
        <div className="bg-[#e8eef5] border-b border-gray-400 px-3 py-1.5 flex justify-between items-center">
          <span className="font-bold text-[#000080] text-xs uppercase">Cylinder Details</span>
          <span className="text-[10px] text-gray-600">
            Rows filled: <strong className="text-green-700">{filledRows}</strong> / {items.length}
          </span>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-[#f0f0f0] sticky top-0 z-10">
              <tr>
                <th className="border-b border-r border-gray-400 px-2 py-2 w-36 text-center font-bold text-gray-800">Cylinder No</th>
                <th className="border-b border-r border-gray-400 px-2 py-2 w-28 text-center font-bold text-gray-800">Capacity</th>
                <th className="border-b border-r border-gray-400 px-2 py-2 text-left font-bold text-gray-800">Item Description</th>
                <th className="border-b border-gray-400 px-2 py-2 w-24 text-center font-bold text-gray-800">Unit</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-[#f4faf4]' : 'bg-white'} hover:bg-amber-50 border-b border-gray-200`}>
                  <td className="border-r border-gray-200 p-1">
                    <input
                      className="w-full h-7 px-2 border border-gray-300 rounded-sm bg-white outline-none focus:border-blue-500 text-[11px]"
                      value={row.cylinderNo}
                      onChange={(e) => handleItemChange(idx, 'cylinderNo', e.target.value)}
                      placeholder="Cylinder no."
                    />
                  </td>
                  <td className="border-r border-gray-200 p-1">
                    <input
                      className="w-full h-7 px-2 border border-gray-300 rounded-sm bg-white outline-none focus:border-blue-500 text-right text-[11px]"
                      value={row.capacity}
                      onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                  <td className="border-r border-gray-200 p-1">
                    <input
                      className="w-full h-7 px-2 border border-gray-300 rounded-sm bg-white outline-none focus:border-blue-500 text-[11px]"
                      value={row.itemDescription}
                      onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                      placeholder="Item description"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full h-7 px-2 border border-gray-300 rounded-sm bg-white outline-none focus:border-blue-500 text-center text-[11px]"
                      value={row.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      placeholder="Unit"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <div className="flex rounded border border-gray-400 bg-gradient-to-b from-[#f8f8f8] to-[#d4d4d4] shadow-sm overflow-hidden">
          <button type="button" className="px-3 py-1.5 border-r border-gray-400 text-blue-800 hover:bg-gray-200 text-xs font-bold">|◀</button>
          <button type="button" className="px-3 py-1.5 border-r border-gray-400 text-blue-800 hover:bg-gray-200 text-xs font-bold">◀</button>
          <button type="button" onClick={handleSave} className="px-5 py-1.5 border-r border-gray-400 hover:bg-green-100 flex items-center gap-1.5 text-xs font-bold text-green-900">
            <span>💾</span> SAVE
          </button>
          <button type="button" onClick={() => window.location.reload()} className="px-5 py-1.5 border-r border-gray-400 hover:bg-red-50 flex items-center gap-1.5 text-xs font-bold text-red-800">
            <span>×</span> CANCEL
          </button>
          <button type="button" className="px-5 py-1.5 border-r border-gray-400 hover:bg-gray-200 flex items-center gap-1.5 text-xs font-bold text-blue-800">
            <span>🔍</span> VIEW
          </button>
          <button type="button" className="px-3 py-1.5 border-r border-gray-400 text-blue-800 hover:bg-gray-200 text-xs font-bold">▶</button>
          <button type="button" className="px-3 py-1.5 text-blue-800 hover:bg-gray-200 text-xs font-bold">▶|</button>
        </div>
        <button type="button" onClick={() => window.location.href = '/'} className="px-4 py-1.5 rounded border border-gray-400 bg-gradient-to-b from-[#f8f8f8] to-[#d4d4d4] hover:bg-gray-200 shadow-sm flex items-center gap-1.5 text-xs font-bold">
          <span>🚪</span> EXIT
        </button>
      </div>
    </div>
  );
};

export default MaterialInwardFTM;
