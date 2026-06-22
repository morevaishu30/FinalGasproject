import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const MaterialOutward = () => {
  const [formData, setFormData] = useState({
    gdaNo: '',
    entryDate: new Date().toISOString().split('T')[0],
    partyName: '',
    location: 'DEFAULT ADDRESS',
    orderNo: '',
    orderDate: new Date().toISOString().split('T')[0],
    vehicleType: '',
    contractor: '',
    vehicleRegNo: '',
    remark: '',
    book: '',
    salesAc: 'SALES ACCOUNT - GAS',
    packType: '0-Rental',
    cylProperty: 'O',
    billNo: '',
    gdaType: 'C',
    noOfCaps: 0,
    modeOfTransport: 'Road',
    primaryVehicleRegNo: '',
    lrNo: '',
    reason: '',
    cylinderDetailFromQrCode: false
  });

  const [items, setItems] = useState(
    [...Array(15)].map(() => ({
      cylinderNo: '',
      itemDescription: '',
      capacity: '',
      qty: 1,
      rate: 0,
      amount: 0,
      remark: '',
      propotion: '',
      itemGrade: '',
      unit: 'CUM'
    }))
  );

  const [partyOptions, setPartyOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [custRes, suppRes, soRes] = await Promise.all([
        api.get('/customer-ledgers'),
        api.get('/supplier-ledgers'),
        api.get('/sales-orders')
      ]);
      setPartyOptions(custRes.data.map(c => c.customerName));
      setContractorOptions(suppRes.data.map(s => s.supplierName));
      setSalesOrders(soRes.data || []);
      
      // Mocking next GDA No
      setFormData(prev => ({ ...prev, gdaNo: 'GDA26/00124' }));
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const filterPendingOrders = (partyName, orders = salesOrders) => {
    if (!partyName) {
      setPendingItems([]);
      return;
    }
    const filteredOrders = orders.filter(o => o.customerName === partyName);
    const itemsList = [];
    filteredOrders.forEach(order => {
      (order.items || []).forEach((item, index) => {
        itemsList.push({
          id: `${order.id}-${index}`,
          orderId: order.id,
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          itemDescription: item.itemDescription,
          capacity: item.capacity,
          noOfCyl: item.noOfCyl || 0,
          qty: item.gasQty || 0,
          rate: item.rate || 0,
          amount: item.amount || 0,
          unit: item.unit || 'CUM',
          outright: item.outright || false,
          propotion: '',
          itemGrade: '',
          gdaQty: item.noOfCyl || 0,
          selected: false
        });
      });
    });
    setPendingItems(itemsList);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      if (name === 'partyName') {
        filterPendingOrders(value);
      }
      return updated;
    });
  };

  const handleTogglePendingItem = (itemId) => {
    const updatedPending = pendingItems.map(item => {
      if (item.id === itemId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    setPendingItems(updatedPending);

    const selectedItems = updatedPending.filter(item => item.selected);
    const mappedGdaItems = selectedItems.map((item) => ({
      cylinderNo: '',
      itemDescription: item.itemDescription || '',
      capacity: item.capacity || '',
      qty: item.gdaQty || 1,
      rate: item.rate || 0,
      amount: (item.gdaQty || 1) * (item.rate || 0),
      remark: item.orderNo ? `Ref SO: ${item.orderNo}` : '',
      propotion: item.propotion || '',
      itemGrade: item.itemGrade || '',
      unit: item.unit || 'CUM'
    }));

    while (mappedGdaItems.length < 15) {
      mappedGdaItems.push({
        cylinderNo: '',
        itemDescription: '',
        capacity: '',
        qty: 1,
        rate: 0,
        amount: 0,
        remark: '',
        propotion: '',
        itemGrade: '',
        unit: 'CUM'
      });
    }
    setItems(mappedGdaItems);

    if (selectedItems.length > 0) {
      setFormData(prev => ({
        ...prev,
        orderNo: selectedItems[0].orderNo,
        orderDate: selectedItems[0].orderDate
      }));
    }
  };

  const handlePendingItemQtyChange = (itemId, newQty) => {
    const updatedPending = pendingItems.map(item => {
      if (item.id === itemId) {
        return { ...item, gdaQty: parseFloat(newQty) || 0 };
      }
      return item;
    });
    setPendingItems(updatedPending);

    const selectedItems = updatedPending.filter(item => item.selected);
    if (selectedItems.length > 0) {
      const mappedGdaItems = selectedItems.map((item) => ({
        cylinderNo: '',
        itemDescription: item.itemDescription || '',
        capacity: item.capacity || '',
        qty: item.gdaQty || 1,
        rate: item.rate || 0,
        amount: (item.gdaQty || 1) * (item.rate || 0),
        remark: item.orderNo ? `Ref SO: ${item.orderNo}` : '',
        propotion: item.propotion || '',
        itemGrade: item.itemGrade || '',
        unit: item.unit || 'CUM'
      }));
      while (mappedGdaItems.length < 15) {
        mappedGdaItems.push({
          cylinderNo: '',
          itemDescription: '',
          capacity: '',
          qty: 1,
          rate: 0,
          amount: 0,
          remark: '',
          propotion: '',
          itemGrade: '',
          unit: 'CUM'
        });
      }
      setItems(mappedGdaItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Calculate amount if qty or rate changes
    if (field === 'qty' || field === 'rate') {
      item.amount = (item.qty || 0) * (item.rate || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!formData.partyName) {
      alert("Please select a party.");
      return;
    }

    const filteredItems = items.filter(item => item.itemDescription || item.cylinderNo);
    if (filteredItems.length === 0) {
      alert("Please add at least one cylinder entry.");
      return;
    }

    try {
      await api.post('/material-outward-gda', { ...formData, items: filteredItems });
      alert("Gas Delivery Advice (GDA) saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving GDA:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
  };

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-2 flex flex-col font-semibold">
      <div className="bg-[#f0f0f0] border border-gray-400 p-2 mb-2">
        <h2 className="text-[#000080] font-bold mb-4 flex items-center space-x-2 text-sm uppercase">
          <span>🚚</span>
          <span>Gas Delivery Advice (GDA) / Material Outward</span>
        </h2>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-6 space-y-1.5">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">GDA No :</label>
              <input type="text" name="gdaNo" value={formData.gdaNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner" />
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
            
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Pack Type :</label>
              <select name="packType" value={formData.packType} onChange={handleInputChange} className="border border-gray-400 px-1 w-44 bg-white h-5 shadow-inner text-[10px]">
                <option value="0-Rental">0-Rental</option>
                <option value="1-Out Right">1-Out Right</option>
                <option value="2-Replacement">2-Replacement</option>
                <option value="3-Return">3-Return</option>
                <option value="4-Branch Transfer">4-Branch Transfer</option>
                <option value="5-Branch Transfer O/S">5-Branch Transfer O/S</option>
                <option value="6-Branch Fitting/Serv.in">6-Branch Fitting/Serv.in</option>
                <option value="7-Outright Return">7-Outright Return</option>
              </select>
              <label className="w-16 text-right pr-2">GDA Type :</label>
              <select name="gdaType" value={formData.gdaType} onChange={handleInputChange} className="border border-gray-400 px-1 w-20 bg-white h-5 shadow-inner text-[10px]">
                <option value="C">C</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Cyl.Property :</label>
              <select name="cylProperty" value={formData.cylProperty} onChange={handleInputChange} className="border border-gray-400 px-1 w-20 bg-white h-5 shadow-inner text-[10px]">
                <option value="O">O</option>
                <option value="C">C</option>
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
              <label className="w-40 text-right pr-2">No. Of Caps :</label>
              <input type="number" name="noOfCaps" value={formData.noOfCaps} onChange={handleInputChange} className="border border-gray-400 px-1 w-20 bg-white h-5 shadow-inner" />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Bill No :</label>
              <input type="text" name="billNo" value={formData.billNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner" />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="w-24 text-right pr-2">Order No :</label>
                <input type="text" name="orderNo" value={formData.orderNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
              </div>
              <div className="flex items-center">
                <label className="w-16 text-right pr-2">Date :</label>
                <input type="date" name="orderDate" value={formData.orderDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
              </div>
            </div>
            <div className="flex items-start">
              <label className="w-24 text-right pr-2 pt-1">Remark :</label>
              <textarea name="remark" value={formData.remark} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-12 shadow-inner resize-none"></textarea>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-6 space-y-1.5">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Date :</label>
              <input type="date" name="entryDate" value={formData.entryDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Mode Transport :</label>
              <select name="modeOfTransport" value={formData.modeOfTransport} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner text-[10px]">
                <option value="Road">Road</option>
                <option value="Rail">Rail</option>
                <option value="Air">Air</option>
              </select>
              <label className="w-20 text-right pr-2">Primary Veh :</label>
              <input type="text" name="primaryVehicleRegNo" value={formData.primaryVehicleRegNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-28 bg-white h-5 shadow-inner" />
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
            
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">L.R. No :</label>
              <input type="text" name="lrNo" value={formData.lrNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner" />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Reason :</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>

            <div className="flex items-center pl-24">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input type="checkbox" name="cylinderDetailFromQrCode" checked={formData.cylinderDetailFromQrCode} onChange={handleInputChange} className="w-3.5 h-3.5 accent-blue-700" />
                <span>Cylinder Detail From QR Code</span>
              </label>
            </div>

            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Book :</label>
              <input type="text" name="book" value={formData.book} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Sales A/c :</label>
              <select name="salesAc" value={formData.salesAc} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner">
                <option value="SALES ACCOUNT - GAS">SALES ACCOUNT - GAS</option>
                <option value="SALES ACCOUNT - RENT">SALES ACCOUNT - RENT</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white border border-gray-400 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#f0f0f0] border-b border-gray-400 sticky top-0 shadow-sm">
            <tr>
              <th className="border-r border-gray-400 px-1 py-1 w-24 text-center">Cylinder No</th>
              <th className="border-r border-gray-400 px-1 py-1">Item Description</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Capacity</th>
              <th className="border-r border-gray-400 px-1 py-1 w-12 text-center">Gas Qty</th>
              <th className="border-r border-gray-400 px-1 py-1 w-12 text-center">Unit</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Propotion</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Item Grade</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Rate</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Amount</th>
              <th className="px-1 py-1 text-center">Remark</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? "bg-[#e8f5e9]" : "bg-white"} hover:bg-yellow-100 h-6`}>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.cylinderNo} onChange={(e) => handleItemChange(idx, 'cylinderNo', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.itemDescription} onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" value={row.capacity} onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.qty} onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-center" value={row.unit || 'CUM'} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.propotion} onChange={(e) => handleItemChange(idx, 'propotion', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.itemGrade} onChange={(e) => handleItemChange(idx, 'itemGrade', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.rate} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" value={row.amount} readOnly /></td>
                <td className="px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.remark} onChange={(e) => handleItemChange(idx, 'remark', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-bold border-t border-gray-400">
            <tr>
              <td colSpan="8" className="text-right px-4 py-1">Total Amount:</td>
              <td className="text-right px-2 py-1">{calculateTotalAmount()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pending Sales Orders Section (from Screenshot 2) */}
      {formData.partyName && pendingItems.length > 0 && (
        <div className="bg-white border border-gray-400 p-2 mt-2 max-h-48 overflow-auto shadow-inner rounded-sm">
          <h3 className="text-[#000080] font-bold mb-1 border-b border-gray-300 pb-0.5 text-[10.5px] uppercase">Pending Sales Orders Selection</h3>
          <table className="w-full text-left border-collapse text-[10px]">
            <thead className="bg-[#e8f4fc] border-b border-gray-400 sticky top-0 z-10 font-bold text-gray-700">
              <tr>
                <th className="border-r border-gray-300 px-2 py-1 text-center w-8">Select</th>
                <th className="border-r border-gray-300 px-2 py-1 w-24">Order No</th>
                <th className="border-r border-gray-300 px-2 py-1 w-20">Date</th>
                <th className="border-r border-gray-300 px-2 py-1">Item Description</th>
                <th className="border-r border-gray-300 px-2 py-1 w-16 text-center">Cap</th>
                <th className="border-r border-gray-300 px-2 py-1 w-16 text-center">Ord.Qty</th>
                <th className="border-r border-gray-300 px-2 py-1 w-16 text-center">GDA Qty</th>
                <th className="border-r border-gray-300 px-2 py-1 w-20">Unit</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50 h-5 border-b border-gray-200">
                  <td className="border-r border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleTogglePendingItem(item.id)}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>
                  <td className="border-r border-gray-200 px-2 font-bold text-[#000080]">{item.orderNo}</td>
                  <td className="border-r border-gray-200 px-2">{item.orderDate}</td>
                  <td className="border-r border-gray-200 px-2">{item.itemDescription}</td>
                  <td className="border-r border-gray-200 px-2 text-right">{item.capacity}</td>
                  <td className="border-r border-gray-200 px-2 text-right font-bold">{item.noOfCyl}</td>
                  <td className="border-r border-gray-200 px-1 text-center">
                    <input
                      type="number"
                      value={item.gdaQty}
                      onChange={(e) => handlePendingItemQtyChange(item.id, e.target.value)}
                      className="w-12 border border-gray-300 rounded px-1 h-4 text-right font-bold text-blue-900 bg-yellow-50"
                      disabled={!item.selected}
                    />
                  </td>
                  <td className="border-r border-gray-200 px-2">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-2">
        <div className="flex justify-between items-center bg-[#ffffcc] border border-yellow-400 p-1 mb-2">
          <div className="flex items-center space-x-2 text-yellow-800 font-bold">
            <span className="text-lg">💡</span>
            <span className="uppercase text-[10px]">Tip : Press 'INS' for New Entry, 'DEL' for Delete Entry 'ENTER' to Edit</span>
          </div>
          <div className="text-red-600 font-bold pr-4">Total Record : {items.filter(i => i.cylinderNo).length}</div>
        </div>

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

export default MaterialOutward;
