import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const MaterialOutwardETM = () => {
  const [formData, setFormData] = useState({
    serialNo: '',
    entryDate: new Date().toISOString().split('T')[0],
    partyName: '',
    location: 'DEFAULT ADDRESS',
    cgd: 'C',
    vodr: 'VCL',
    etmType: 'Return',
    calcLoadingAmt: false,
    qrCodeDetail: false,
    vehicleType: '',
    contractor: '',
    vehicleRegNo: '',
  });

  const [items, setItems] = useState(
    [...Array(10)].map(() => ({
      cylProp: '',
      cylinderNo: '',
      capacity: '',
      itemDescription: '',
      propotion: '',
      unit: '',
      pressure: '',
      weight: ''
    }))
  );

  const [partyOptions, setPartyOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (formData.etmType === 'Filling' && formData.partyName) {
      fetchPendingOrders();
    } else {
      setPendingOrders([]);
    }
  }, [formData.etmType, formData.partyName]);

  const fetchPendingOrders = async () => {
    try {
      const response = await api.get(`/cylinder-purchase-orders/pending/${formData.partyName}`);
      setPendingOrders(response.data);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrderId(order.id);
    // Map order items to ETM items
    const newItems = order.items.map(item => ({
      cylProp: 'C',
      cylinderNo: '', // User will enter cylinder no
      capacity: item.capacity || '',
      itemDescription: item.itemDescription || '',
      propotion: '',
      unit: item.unit || 'CUM',
      pressure: '',
      weight: ''
    }));
    
    // Fill up to 10 rows
    const filledItems = [...newItems];
    while (filledItems.length < 10) {
      filledItems.push({
        cylProp: '', cylinderNo: '', capacity: '', itemDescription: '', propotion: '', unit: '', pressure: '', weight: ''
      });
    }
    setItems(filledItems);
  };

  const fetchInitialData = async () => {
    try {
      const [custRes, suppRes, itemsRes, seqRes] = await Promise.all([
        api.get('/customer-ledgers'),
        api.get('/supplier-ledgers'),
        api.get('/item-groups'),
        api.get('/empty-cylinder-etm/next-serial-no')
      ]);
      setPartyOptions(custRes.data.map(c => c.customerName));
      setContractorOptions(suppRes.data.map(s => s.supplierName));
      setItemOptions(itemsRes.data.map(i => i.name));
      setFormData(prev => ({ ...prev, serialNo: seqRes.data.serialNo }));
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
    try {
      const filteredItems = items.filter(i => i.cylinderNo && i.itemDescription);
      await api.post('/empty-cylinder-etm', { ...formData, items: filteredItems });
      alert("ETM Entry saved successfully!");
      fetchInitialData(); // Refresh sequence and clear/reload data
      setItems([...Array(10)].map(() => ({
        cylProp: '', cylinderNo: '', capacity: '', itemDescription: '', propotion: '', unit: '', pressure: '', weight: ''
      })));
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error saving ETM:", error);
      alert("Failed to save entry.");
    }
  };

  const InputField = ({ label, name, value, type = "text", width = "w-48", readOnly = false }) => (
    <div className="flex items-center">
      <label className="w-24 text-right pr-2 whitespace-nowrap">{label} :</label>
      <input 
        type={type} name={name} value={value} onChange={handleInputChange} 
        className={`border border-gray-400 px-1 ${width} bg-white h-5 shadow-inner outline-none ${readOnly ? 'bg-gray-100' : ''}`}
        readOnly={readOnly}
      />
    </div>
  );

  return (
    <div className="bg-[#d4d0c8] min-h-screen font-sans text-[11px] p-2 flex flex-col font-bold text-black select-none" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
      
      <div className="bg-[#d4d0c8] border-[1.5px] border-white border-b-gray-500 border-r-gray-500 p-2 mb-1">
        <div className="flex items-center mb-4">
          <span className="text-[#000080] font-bold text-[12px] flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            EMPTY CYLINDER TRANS. (ETM)
          </span>
        </div>

        <div className="grid grid-cols-12 gap-x-8 gap-y-1.5">
          {/* Left Column */}
          <div className="col-span-7 space-y-1.5">
            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Serial No :</label>
              <input type="text" name="serialNo" value={formData.serialNo} className="border border-gray-400 bg-[#e0ffff] h-5 w-40 px-1 shadow-inner" readOnly />
              <label className="w-16 text-right pr-2 ml-2">Date :</label>
              <input type="date" name="entryDate" value={formData.entryDate} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-32 px-1 shadow-inner" />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Party Name :</label>
              <select name="partyName" value={formData.partyName} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 flex-grow px-1 shadow-inner">
                <option value="">-- Select Party --</option>
                {partyOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <label className="w-32 text-right pr-2">C/G/D :</label>
              <select name="cgd" value={formData.cgd} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-20 px-1 shadow-inner">
                <option value="C">C</option><option value="G">G</option><option value="D">D</option>
              </select>
              <label className="w-16 text-right pr-2">VCL/OP :</label>
              <select name="vodr" value={formData.vodr} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-20 px-1 shadow-inner">
                <option value="VCL">VCL</option><option value="OP">OP</option>
              </select>
              <label className="flex items-center ml-4 cursor-pointer">
                <input type="checkbox" name="calcLoadingAmt" checked={formData.calcLoadingAmt} onChange={handleInputChange} className="mr-1" />
                Calculate Loading Amt.
              </label>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-2">ETM Type :</label>
              <select name="etmType" value={formData.etmType} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-64 px-1 shadow-inner">
                <option>Return</option>
                <option>Filling</option>
              </select>
              <label className="flex items-center ml-4 cursor-pointer">
                <input type="checkbox" name="cylinderTranOut" checked={formData.cylinderTranOut} onChange={handleInputChange} className="mr-1" />
                Cylinder Tran. Outward
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-5 space-y-1.5">
            <div className="flex justify-end mb-1">
              <label className="flex items-center cursor-pointer text-red-700">
                <input type="checkbox" name="qrCodeDetail" checked={formData.qrCodeDetail} onChange={handleInputChange} className="mr-1" />
                Cylinder Detail From QR Code
              </label>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Vehicle Type :</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-48 px-1 shadow-inner">
                <option value="">-- Select --</option>
                <option value="Transporter">Transporter</option>
                <option value="Own">Own</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Contractor :</label>
              <select name="contractor" value={formData.contractor} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 flex-grow px-1 shadow-inner">
                <option value="">-- Select Contractor --</option>
                {contractorOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-2">Vehicle Reg No :</label>
              <select name="vehicleRegNo" value={formData.vehicleRegNo} onChange={handleInputChange} className="border border-gray-400 bg-white h-5 w-48 px-1 shadow-inner">
                <option value=""></option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-grow bg-white border border-gray-500 overflow-auto mb-1 shadow-inner" style={{ minHeight: '200px' }}>
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-[#d4d0c8] sticky top-0 z-10">
            <tr>
              {["Cyl.Prop", "Cylinder No", "Capacity", "Item Description", "Propotion", "Unit", "Pressure", "Weight"].map((col, i) => (
                <th key={i} className="border-r border-b border-gray-500 px-2 py-1 text-center bg-[#d4d0c8] shadow-[inset_1px_1px_0px_white,inset_-1px_-1px_0px_gray] font-normal">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-200 h-6">
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-20">
                  <select value={row.cylProp} onChange={(e) => handleItemChange(idx, 'cylProp', e.target.value)} className="w-full h-full bg-transparent outline-none">
                    <option value=""></option><option value="O">O</option><option value="C">C</option>
                  </select>
                </td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-32"><input className="w-full h-full bg-transparent outline-none px-1" value={row.cylinderNo} onChange={(e) => handleItemChange(idx, 'cylinderNo', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-20"><input className="w-full h-full bg-transparent outline-none px-1 text-right" value={row.capacity} onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] min-w-[200px]">
                  <select value={row.itemDescription} onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} className="w-full h-full bg-transparent outline-none">
                    <option value=""></option>
                    {itemOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
                  </select>
                </td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-32"><input className="w-full h-full bg-transparent outline-none px-1" value={row.propotion} onChange={(e) => handleItemChange(idx, 'propotion', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-20 text-center">{row.unit}</td>
                <td className="border-r border-gray-300 px-0.5 bg-[#e0ffff] w-24"><input className="w-full h-full bg-transparent outline-none px-1 text-right" value={row.pressure} onChange={(e) => handleItemChange(idx, 'pressure', e.target.value)} /></td>
                <td className="px-0.5 bg-[#e0ffff] w-24"><input className="w-full h-full bg-transparent outline-none px-1 text-right" value={row.weight} onChange={(e) => handleItemChange(idx, 'weight', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Order Selection Table - Only visible when ETM Type is Filling */}
      {formData.etmType === 'Filling' && (
        <div className="flex flex-col border border-gray-500 bg-[#ffffcc] mb-1 overflow-hidden" style={{ height: '180px' }}>
          <div className="bg-[#808000] text-white px-2 py-0.5 text-[10px] font-bold flex justify-between items-center">
            <span>Pending Order Selection</span>
            <span>Total Record : {pendingOrders.length}</span>
          </div>
          <div className="overflow-auto flex-grow">
            <table className="w-full text-left border-collapse text-[10px] whitespace-nowrap">
              <thead className="bg-[#d4d0c8] sticky top-0 shadow-sm border-b border-gray-400">
                <tr className="bg-gray-100">
                  {["Order No", "Date", "Item Description", "Unit", "Total Qty", "Pend Qty"].map((h, i) => (
                    <th key={i} className="border-r border-gray-400 px-1 py-0.5 font-normal text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {pendingOrders.map((order) => 
                  order.items.map((item, i) => (
                    <tr 
                      key={`${order.id}-${i}`} 
                      onClick={() => handleOrderSelect(order)}
                      className={`hover:bg-blue-100 cursor-pointer ${selectedOrderId === order.id ? 'bg-blue-200' : ''}`}
                    >
                      <td className="border-r border-gray-300 px-1">{order.entryNo}</td>
                      <td className="border-r border-gray-300 px-1">{order.entryDate}</td>
                      <td className="border-r border-gray-300 px-1">{item.itemDescription}</td>
                      <td className="border-r border-gray-300 px-1 text-center">{item.unit}</td>
                      <td className="border-r border-gray-300 px-1 text-right">{item.noOfCyl}</td>
                      <td className="border-r border-gray-300 px-1 text-right">{item.noOfCyl}</td>
                    </tr>
                  ))
                )}
                {pendingOrders.length === 0 && (
                  <tr className="text-gray-400 italic">
                    <td colSpan="6" className="text-center py-4">No pending orders found for this party.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Area */}
      <div className="bg-[#d4d0c8] p-1 flex flex-col space-y-1">
        <div className="bg-[#ffffcc] border border-yellow-400 p-1 flex justify-between items-center text-[10px]">
          <div className="flex items-center space-x-2 text-yellow-800 font-bold">
            <span className="text-sm">💡</span>
            <span className="uppercase">Press 'INS' for New Entry, 'DEL' for Delete Entry 'ENTER' to Edit</span>
          </div>
          <div className="text-red-600 font-bold pr-4">Total Record : {items.filter(i => i.cylinderNo).length}</div>
        </div>

        <div className="flex items-center justify-center space-x-2 py-1">
          <div className="flex space-x-1">
            <button onClick={handleSave} className="bg-[#d4d0c8] border border-gray-400 px-4 py-1 shadow-[inset_1px_1px_0px_white,inset_-1px_-1px_0px_gray] active:shadow-[inset_1px_1px_0px_gray,inset_-1px_-1px_0px_white] font-bold flex items-center hover:bg-[#e8e6e1]">
              <span className="text-blue-800 mr-2 text-sm">💾</span> SAVE
            </button>
            <button onClick={() => window.location.reload()} className="bg-[#d4d0c8] border border-gray-400 px-4 py-1 shadow-[inset_1px_1px_0px_white,inset_-1px_-1px_0px_gray] active:shadow-[inset_1px_1px_0px_gray,inset_-1px_-1px_0px_white] font-bold flex items-center hover:bg-[#e8e6e1]">
              <span className="text-red-600 mr-2 text-sm">❌</span> CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialOutwardETM;
