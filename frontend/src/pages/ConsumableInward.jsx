import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ConsumableInward = () => {
  const [formData, setFormData] = useState({
    inwardNo: '',
    entryDate: new Date().toISOString().split('T')[0],
    partyName: '',
    location: 'DEFAULT ADDRESS',
    challanNo: '',
    challanDate: new Date().toISOString().split('T')[0],
    vehicleNo: '',
    remark: ''
  });

  const [items, setItems] = useState(
    [...Array(10)].map(() => ({
      itemDescription: '',
      unit: '',
      quantity: '',
      rate: '',
      amount: ''
    }))
  );

  const [partyOptions, setPartyOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [custRes, suppRes, itemsRes, seqRes] = await Promise.all([
        api.get('/customer-ledgers'),
        api.get('/supplier-ledgers'),
        api.get('/item-groups'),
        api.get('/consumable-inwards/next-inward-no')
      ]);
      
      const combinedParties = [
        ...custRes.data.map(c => c.customerName),
        ...suppRes.data.map(s => s.supplierName)
      ];
      
      setPartyOptions([...new Set(combinedParties)]);
      setItemOptions(itemsRes.data.map(i => i.name));
      setFormData(prev => ({ ...prev, inwardNo: seqRes.data.inwardNo }));
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const updatedItem = { ...newItems[index], [field]: value };
    
    // Calculate amount if qty or rate changes
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(field === 'quantity' ? value : updatedItem.quantity) || 0;
      const rate = parseFloat(field === 'rate' ? value : updatedItem.rate) || 0;
      updatedItem.amount = (qty * rate).toFixed(2);
    }
    
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      const filteredItems = items.filter(i => i.itemDescription && i.quantity);
      if (!formData.partyName) return alert("Please select a party.");
      if (filteredItems.length === 0) return alert("Please add at least one item.");

      await api.post('/consumable-inwards', { ...formData, items: filteredItems });
      alert("Consumable Inward saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving Consumable Inward:", error);
      alert("Failed to save entry.");
    }
  };

  return (
    <div className="bg-[#d4d0c8] min-h-screen font-sans text-[11px] p-2 flex flex-col font-bold text-black" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
      
      <div className="bg-[#d4d0c8] border-[1.5px] border-white border-b-gray-500 border-r-gray-500 p-2 mb-1">
        <div className="flex items-center mb-4">
          <span className="text-[#000080] font-bold text-[12px] flex items-center uppercase">
            📦 Consumable Inward Book
          </span>
        </div>

        <div className="grid grid-cols-12 gap-x-8 gap-y-1.5">
          <div className="col-span-7 space-y-1.5">
            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Inward No :</label>
              <input type="text" name="inwardNo" value={formData.inwardNo} className="border border-gray-400 bg-[#e0ffff] h-5 w-40 px-1 shadow-inner" readOnly />
              <label className="w-16 text-right pr-2 ml-2">Date :</label>
              <input type="date" name="entryDate" value={formData.entryDate} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-32 px-1 shadow-inner" />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Party Name :</label>
              <select name="partyName" value={formData.partyName} onChange={handleInputChange} className="border border-gray-400 bg-[#e0ffff] h-5 flex-grow px-1 shadow-inner">
                <option value="">-- Select Party --</option>
                {partyOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Location :</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 flex-grow px-1 shadow-inner" />
            </div>
          </div>

          <div className="col-span-5 space-y-1.5">
            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Challan No :</label>
              <input type="text" name="challanNo" value={formData.challanNo} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-40 px-1 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Challan Date :</label>
              <input type="date" name="challanDate" value={formData.challanDate} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-32 px-1 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Vehicle No :</label>
              <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-40 px-1 shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white border border-gray-500 overflow-auto mb-1 shadow-inner">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-[#d4d0c8] sticky top-0 z-10">
            <tr>
              {["Item Description", "Unit", "Quantity", "Rate", "Amount"].map((col, i) => (
                <th key={i} className="border-r border-b border-gray-500 px-2 py-1 text-center bg-[#d4d0c8] shadow-[inset_1px_1px_0px_white,inset_-1px_-1px_0px_gray] font-normal">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-200 h-6">
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] min-w-[300px]">
                  <select value={row.itemDescription} onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} className="w-full h-full bg-transparent outline-none">
                    <option value=""></option>
                    {itemOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
                  </select>
                </td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-24"><input className="w-full h-full bg-transparent outline-none px-1 text-center" value={row.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-24"><input className="w-full h-full bg-transparent outline-none px-1 text-right" type="number" value={row.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-24"><input className="w-full h-full bg-transparent outline-none px-1 text-right" type="number" value={row.rate} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} /></td>
                <td className="px-0.5 bg-[#e0ffff] w-32 text-right pr-2">{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#d4d0c8] p-1 flex flex-col space-y-1">
        <div className="flex items-center p-1">
          <label className="w-20 text-right pr-2">Remark :</label>
          <input type="text" name="remark" value={formData.remark} onChange={handleInputChange} className="flex-grow border border-gray-400 bg-white h-5 px-1 shadow-inner outline-none" />
        </div>

        <div className="flex items-center justify-center space-x-2 py-1">
          <button onClick={handleSave} className="bg-[#d4d0c8] border border-gray-400 px-6 py-1 shadow-[inset_1px_1px_0px_white,inset_-1px_-1px_0px_gray] active:shadow-[inset_1px_1px_0px_gray,inset_-1px_-1px_0px_white] font-bold flex items-center hover:bg-[#e8e6e1]">
            💾 SAVE
          </button>
          <button onClick={() => window.location.reload()} className="bg-[#d4d0c8] border border-gray-400 px-6 py-1 shadow-[inset_1px_1px_0px_white,inset_-1px_-1px_0px_gray] active:shadow-[inset_1px_1px_0px_gray,inset_-1px_-1px_0px_white] font-bold flex items-center hover:bg-[#e8e6e1]">
            ❌ CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumableInward;
