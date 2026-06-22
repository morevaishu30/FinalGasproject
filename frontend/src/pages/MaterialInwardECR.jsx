import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const MaterialInwardECR = () => {
  const [formData, setFormData] = useState({
    ecrNo: '',
    entryDate: new Date().toISOString().split('T')[0],
    partyName: '',
    location: 'DEFAULT ADDRESS',
    cylProperty: '',
    ckd: 'C',
    noOfCaps: 0,
    remark: '',
    challanNo: '',
    challanDate: new Date().toISOString().split('T')[0],
    vehicleType: '',
    contractor: '',
    vehicleRegNo: '',
  });

  const [items, setItems] = useState(
    [...Array(15)].map(() => ({
      cylinderNo: '',
      capacity: '',
      itemDescription: '',
      supplyDt: '',
      gdaNo: '',
    }))
  );

  const [partyOptions, setPartyOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [itemGroupOptions, setItemGroupOptions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [custRes, suppRes, itemGroupRes] = await Promise.all([
        api.get('/customer-ledgers'),
        api.get('/supplier-ledgers'),
        api.get('/item-groups')
      ]);
      setPartyOptions(custRes.data.map(c => c.customerName));
      setContractorOptions(suppRes.data.map(s => s.supplierName));
      setItemGroupOptions(itemGroupRes.data);
      
      // Mocking next ECR No
      setFormData(prev => ({ ...prev, ecrNo: 'PO26ECR/00071' }));
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

  const handleSave = async () => {
    if (!formData.partyName) {
      alert("Please select a party.");
      return;
    }

    const filteredItems = items.filter(item => item.cylinderNo && item.itemDescription);
    if (filteredItems.length === 0) {
      alert("Please add at least one cylinder entry.");
      return;
    }

    try {
      await api.post('/material-inward-ecr', { ...formData, items: filteredItems });
      alert("Material Inward (ECR) saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving ECR:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-2 flex flex-col font-semibold">
      <div className="bg-[#f0f0f0] border border-gray-400 p-2 mb-2">
        <h2 className="text-[#000080] font-bold mb-4 flex items-center space-x-2 text-sm uppercase">
          <span>📁</span>
          <span>Empty Cylinder Inward (ECR)</span>
        </h2>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-6 space-y-2">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">ECR No :</label>
              <input type="text" name="ecrNo" value={formData.ecrNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Party Name :</label>
              <select name="partyName" value={formData.partyName} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner text-[10px]">
                <option value="">-- Select Party --</option>
                {partyOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Location :</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="w-24 text-right pr-2">Cyl.Property :</label>
                <select name="cylProperty" value={formData.cylProperty} onChange={handleInputChange} className="border border-gray-400 px-1 w-20 bg-white h-5 shadow-inner">
                  <option value="">--</option>
                  <option value="O">O</option>
                  <option value="C">C</option>
                  <option value="N">N</option>
                  <option value="S">S</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-8 text-right pr-2">C :</label>
                <input type="text" name="ckd" value="C" readOnly className="border border-gray-400 px-1 w-12 bg-gray-100 h-5 shadow-inner text-center" />
              </div>
              <div className="flex items-center">
                <label className="w-20 text-right pr-2">No. Of Caps :</label>
                <input type="number" name="noOfCaps" value={formData.noOfCaps} onChange={handleInputChange} className="border border-gray-400 px-1 w-16 bg-white h-5 shadow-inner" />
              </div>
            </div>
            <div className="flex items-start">
              <label className="w-24 text-right pr-2 pt-1">Remark :</label>
              <textarea name="remark" value={formData.remark} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-16 shadow-inner resize-none"></textarea>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-6 space-y-2">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Date :</label>
              <input type="date" name="entryDate" value={formData.entryDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="w-24 text-right pr-2">Challan No :</label>
                <input type="text" name="challanNo" value={formData.challanNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
              </div>
              <div className="flex items-center">
                <label className="w-16 text-right pr-2">Date :</label>
                <input type="date" name="challanDate" value={formData.challanDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Vehicle Type :</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner">
                <option value="">-- Select --</option>
                <option value="Transporter">Transporter</option>
                <option value="Own">Own</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Contractor :</label>
              <select name="contractor" value={formData.contractor} onChange={handleInputChange} className="border border-gray-400 px-1 w-64 bg-white h-5 shadow-inner">
                <option value="">-- Select Contractor --</option>
                {contractorOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Vehicle Reg No :</label>
              <input type="text" name="vehicleRegNo" value={formData.vehicleRegNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white border border-gray-400 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#f0f0f0] border-b border-gray-400 sticky top-0 shadow-sm">
            <tr>
              <th className="border-r border-gray-400 px-2 py-1 w-32 text-center">Cylinder No</th>
              <th className="border-r border-gray-400 px-2 py-1 w-24 text-center">Cap...</th>
              <th className="border-r border-gray-400 px-2 py-1">Item Description</th>
              <th className="border-r border-gray-400 px-2 py-1 w-24 text-center">Supply Dt</th>
              <th className="px-2 py-1 w-24 text-center">GDA No</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? "bg-[#e8f5e9]" : "bg-white"} hover:bg-yellow-100 h-6`}>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.cylinderNo} onChange={(e) => handleItemChange(idx, 'cylinderNo', e.target.value)} /></td>
                 <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" value={row.capacity} onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)} /></td>
                 <td className="border-r border-gray-300 px-0.5">
                   <select 
                     value={row.itemDescription} 
                     onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} 
                     className="w-full h-full bg-transparent outline-none bg-white font-semibold text-[11px]"
                   >
                     <option value=""></option>
                     {itemGroupOptions.map((opt, i) => (
                       <option key={i} value={opt.name}>{opt.name}</option>
                     ))}
                   </select>
                 </td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-center" value={row.supplyDt} onChange={(e) => handleItemChange(idx, 'supplyDt', e.target.value)} /></td>
                <td className="px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" value={row.gdaNo} onChange={(e) => handleItemChange(idx, 'gdaNo', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex rounded border border-gray-400 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4]">
            <button className="px-3 py-1 border-r border-gray-400 font-bold text-blue-800 hover:bg-gray-300">|◀</button>
            <button className="px-3 py-1 border-r border-gray-400 font-bold text-blue-800 hover:bg-gray-300">◀</button>
            <button onClick={handleSave} className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">💾</span>
              <span className="font-bold">SAVE</span>
            </button>
            <button onClick={() => window.location.reload()} className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-red-600 font-bold text-lg leading-none">×</span>
              <span className="font-bold">CANCEL</span>
            </button>
            <button className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">🔍</span>
              <span className="font-bold">VIEW</span>
            </button>
            <button className="px-3 py-1 border-r border-gray-400 font-bold text-blue-800 hover:bg-gray-300">▶</button>
            <button className="px-3 py-1 font-bold text-blue-800 hover:bg-gray-300">▶|</button>
          </div>
          <button onClick={() => window.location.href = '/'} className="px-4 py-1 rounded border border-gray-400 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] hover:bg-gray-300 flex items-center space-x-1">
            <span className="text-red-600 font-bold">🚪</span>
            <span className="font-bold">EXIT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialInwardECR;
