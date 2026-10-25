import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const MaterialPurchase = () => {
  const [formData, setFormData] = useState({
    purchaseAc: 'PURCHASE ACCOUNT - MATERIAL',
    entryNo: '',
    entryDate: new Date().toISOString().split('T')[0],
    supplierName: '',
    supplierLocation: 'DEFAULT ADDRESS',
    supplierAddress: '',
    consigneeName: '',
    invoiceType: 'REGULAR',
    taxType: 'GST INTERSTATE',
    gstType: 'Interstate Purchase Taxable',
    crDays: 120,
    dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    salesExecutive: '',
    remarks: '',
    billNo: '',
    billDate: new Date().toISOString().split('T')[0],
    grossTotal: 0,
    discount: 0,
    pf: 0,
    freight: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    tcs: 0,
    netTotal: 0
  });

  const [items, setItems] = useState(
    [...Array(10)].map(() => ({
      itemDescription: '',
      unit: 'CUM',
      partyCyl: 0,
      ourCyl: 0,
      capacity: 7.000,
      qty: 0,
      ratePer: 'Qty',
      rate: 0,
      amount: 0,
      remark: ''
    }))
  );

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [ftmEntries, setFtmEntries] = useState([]);
  const [availableFtm, setAvailableFtm] = useState([]);
  const [selectedFtmNo, setSelectedFtmNo] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/supplier-ledgers');
      setSupplierOptions(res.data.map(s => s.supplierName));
      setFormData(prev => ({ ...prev, entryNo: 'PUR/26/00156' }));

      const ftmRes = await api.get('/material-inward-ftm');
      setFtmEntries(ftmRes.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'supplierName') {
        // Filter available FTMs matching selected supplierName
        const filteredFtm = ftmEntries.filter(f => f.customerName === value);
        setAvailableFtm(filteredFtm);
        setSelectedFtmNo('');
      }
      return updated;
    });
  };

  const handleFtmSelect = (entryNo) => {
    setSelectedFtmNo(entryNo);
    if (!entryNo) return;
    const ftm = availableFtm.find(f => f.entryNo === entryNo);
    if (ftm) {
        // Auto-populate purchase items from FTM items
        const mappedItems = (ftm.items || []).map((item) => {
            const cap = parseFloat(item.capacity) || 7.000;
            const cylCount = 1; // Each row in FTM is 1 cylinder
            const qty = cap * cylCount;
            return {
                itemDescription: item.itemDescription || '',
                unit: item.unit || 'CUM',
                partyCyl: ftm.cylProperty !== 'O' ? 1 : 0,
                ourCyl: ftm.cylProperty === 'O' ? 1 : 0,
                capacity: cap,
                qty: qty,
                ratePer: 'Qty',
                rate: 0,
                amount: 0,
                remark: item.cylinderNo ? `Cyl: ${item.cylinderNo}` : ''
            };
        });
        while (mappedItems.length < 10) {
            mappedItems.push({
                itemDescription: '',
                unit: 'CUM',
                partyCyl: 0,
                ourCyl: 0,
                capacity: 7.000,
                qty: 0,
                ratePer: 'Qty',
                rate: 0,
                amount: 0,
                remark: ''
            });
        }
        setItems(mappedItems);
        setFormData(prev => {
            const updated = {
                ...prev,
                billNo: ftm.entryNo,
                remarks: `Ref FTM: ${ftm.entryNo}`
            };
            // Recalculate totals
            const gross = mappedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            updated.grossTotal = gross;
            updated.netTotal = gross;
            return updated;
        });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Recalculate Qty if Capacity or total cylinders change
    if (field === 'capacity' || field === 'partyCyl' || field === 'ourCyl') {
        const totalCyl = (parseInt(item.partyCyl) || 0) + (parseInt(item.ourCyl) || 0);
        item.qty = (item.capacity || 0) * totalCyl;
    }

    // Recalculate Amount
    if (field === 'qty' || field === 'rate' || field === 'ratePer') {
        const qtyToUse = item.ratePer === 'Qty' ? item.qty : ((parseInt(item.partyCyl) || 0) + (parseInt(item.ourCyl) || 0));
        item.amount = (qtyToUse || 0) * (item.rate || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
    calculateTotals(newItems);
  };

  const calculateTotals = (currentItems) => {
    const gross = currentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    setFormData(prev => ({
      ...prev,
      grossTotal: gross,
      netTotal: gross // Simplified for now, add tax logic if needed
    }));
  };

  const handleSave = async () => {
    if (!formData.supplierName) {
      alert("Please select a supplier.");
      return;
    }

    const filteredItems = items.filter(item => item.itemDescription);
    if (filteredItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    try {
      await api.post('/material-purchases', { ...formData, items: filteredItems });
      alert("Purchase Entry saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving Purchase:", error);
      const isNetworkErr = !error.response || error.code === 'ERR_NETWORK';
      alert(isNetworkErr
        ? "Network Error: Could not connect to backend server. If using Render free tier, the server may take ~50s to wake up, or your Backend URL is not set. Please click 'Server API' in the top bar to verify or configure the URL."
        : "Error saving data. " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-2 flex flex-col font-semibold">
      <div className="bg-[#f0f0f0] border border-gray-400 p-2 mb-1">
        <h2 className="text-[#000080] font-bold mb-2 flex items-center space-x-2 text-sm uppercase">
          <span>📦</span>
          <span>Purchase Book (Material)</span>
        </h2>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-6 space-y-1">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Purchase A/c :</label>
              <select name="purchaseAc" value={formData.purchaseAc} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner">
                <option value="PURCHASE ACCOUNT - MATERIAL">PURCHASE ACCOUNT - MATERIAL</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Entry No :</label>
              <input type="text" name="entryNo" value={formData.entryNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner" />
              <label className="w-16 text-right pr-2">Date :</label>
              <input type="date" name="entryDate" value={formData.entryDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Supplier :</label>
              <select name="supplierName" value={formData.supplierName} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner text-[10px]">
                <option value="">-- Select Supplier --</option>
                {supplierOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2 text-blue-800">Link FTM No :</label>
              <select value={selectedFtmNo} onChange={(e) => handleFtmSelect(e.target.value)} disabled={!formData.supplierName} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner text-[10px] disabled:bg-gray-200">
                <option value="">-- Select FTM to load items --</option>
                {availableFtm.map((f, i) => (
                    <option key={i} value={f.entryNo}>
                        {f.entryNo} ({f.entryDate}) - {f.items?.length || 0} items
                    </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Location :</label>
              <input type="text" name="supplierLocation" value={formData.supplierLocation} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-start">
              <label className="w-24 text-right pr-2 pt-1">Address :</label>
              <textarea name="supplierAddress" value={formData.supplierAddress} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-12 shadow-inner resize-none"></textarea>
            </div>
            <div className="flex items-center">
                <label className="w-24 text-right pr-2">Consignee :</label>
                <input type="text" name="consigneeName" value={formData.consigneeName} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-6 space-y-1">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Type Of Invoice:</label>
              <select name="invoiceType" value={formData.invoiceType} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner">
                <option value="REGULAR">REGULAR</option>
                <option value="TAX INVOICE">TAX INVOICE</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Tax Type :</label>
              <select name="taxType" value={formData.taxType} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner">
                <option value="GST INTERSTATE">GST INTERSTATE</option>
                <option value="GST LOCAL">GST LOCAL</option>
              </select>
              <label className="w-16 text-right pr-2">Cr.Days:</label>
              <input type="number" name="crDays" value={formData.crDays} onChange={handleInputChange} className="border border-gray-400 px-1 w-12 bg-white h-5 shadow-inner" />
              <label className="w-16 text-right pr-2">Due.Date:</label>
              <input type="date" name="dueDate" value={formData.dueDate} readOnly className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">GST Type :</label>
              <select name="gstType" value={formData.gstType} onChange={handleInputChange} className="border border-gray-400 px-1 w-64 bg-white h-5 shadow-inner">
                <option value="Interstate Purchase Taxable">Interstate Purchase Taxable</option>
                <option value="Local Purchase Taxable">Local Purchase Taxable</option>
              </select>
            </div>
            <div className="flex items-center">
                <label className="w-24 text-right pr-2">Sales Executive:</label>
                <input type="text" name="salesExecutive" value={formData.salesExecutive} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
                <label className="w-24 text-right pr-2">Remarks :</label>
                <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
                <label className="w-24 text-right pr-2">Bill No & Date :</label>
                <input type="text" name="billNo" value={formData.billNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
                <input type="date" name="billDate" value={formData.billDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
                <span className="text-red-600 font-bold ml-4">Total Records : {items.filter(i => i.itemDescription).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white border border-gray-400 overflow-auto">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead className="bg-[#f0f0f0] border-b border-gray-400 sticky top-0 shadow-sm">
            <tr>
              <th className="border-r border-gray-400 px-1 py-0.5">Item Description</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16">Unit</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Party Cyl</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Our Cyl</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Capacity</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-20 text-center">Qty</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Rate Per</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-20 text-center">Rate</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-24 text-center">Amount</th>
              <th className="px-1 py-0.5 text-center">Remark</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? "bg-[#e8f5e9]" : "bg-white"} hover:bg-yellow-100 h-5`}>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.itemDescription} onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.partyCyl} onChange={(e) => handleItemChange(idx, 'partyCyl', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.ourCyl} onChange={(e) => handleItemChange(idx, 'ourCyl', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.capacity} onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right font-bold" value={row.qty.toFixed(3)} readOnly /></td>
                <td className="border-r border-gray-300 px-0.5">
                    <select className="w-full h-full bg-transparent outline-none" value={row.ratePer} onChange={(e) => handleItemChange(idx, 'ratePer', e.target.value)}>
                        <option value="Qty">Qty</option>
                        <option value="Cyl">Cyl</option>
                    </select>
                </td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.rate} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right font-bold" value={row.amount.toFixed(2)} readOnly /></td>
                <td className="px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.remark} onChange={(e) => handleItemChange(idx, 'remark', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-1">
          <div className="w-full sm:w-80 md:w-96 bg-white border border-gray-400 p-2 space-y-0.5 shadow-sm">
            <div className="flex justify-between"><span>Gross total :</span><span className="font-bold">{formData.grossTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount :</span><input type="number" className="border border-gray-400 w-16 text-right h-4" /></div>
            <div className="flex justify-between"><span>P.F. :</span><span className="font-bold">0.00</span></div>
            <div className="flex justify-between"><span>Freight :</span><span className="font-bold">0.00</span></div>
            <div className="flex justify-between"><span>IGST :</span><span className="font-bold">0.00</span></div>
            <div className="flex justify-between"><span>CGST :</span><span className="font-bold">0.00</span></div>
            <div className="flex justify-between"><span>SGST :</span><span className="font-bold">0.00</span></div>
            <div className="border-t border-gray-400 pt-1 flex justify-between text-blue-800 font-bold text-sm bg-blue-50 px-1 mt-1">
                <span>Net Total :</span>
                <span>{formData.netTotal.toFixed(2)}</span>
            </div>
          </div>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex rounded border border-gray-400 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4]">
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
            <button className="px-4 py-1 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">🖨️</span>
              <span className="font-bold">PRINT</span>
            </button>
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

export default MaterialPurchase;
