import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const SalesInvoice = () => {
  const [formData, setFormData] = useState({
    salesAc: 'SALES ACCOUNT - MATERIAL',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceType: 'REGULAR',
    taxType: 'GST LOCAL',
    gstType: 'Sales Taxable',
    customerName: '',
    customerLocation: 'DEFAULT ADDRESS',
    customerAddress: '',
    salesExecutive: '',
    remarks: '',
    drChallanNo: '',
    crDays: 30,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    grossTotal: 0,
    discount: 0,
    pf: 0,
    freight: 0,
    other: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    roundOff: 0,
    netTotal: 0,
    totalQty: 0
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
      remark: '',
      hsn: ''
    }))
  );

  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/customer-ledgers');
      setCustomerOptions(res.data.map(c => ({
          name: c.customerName,
          address: c.billingAddress,
          gstNo: c.gstNo
      })));
      setFormData(prev => ({ ...prev, invoiceNo: 'POS23/TM/00062' }));
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === 'customerName') {
        const selected = customerOptions.find(c => c.name === value);
        if (selected) {
            updatedData.customerAddress = selected.address || '';
        }
    }

    if (name === 'crDays') {
        const days = parseInt(value) || 0;
        const newDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updatedData.dueDate = newDueDate;
    }

    setFormData(updatedData);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Recalculate Qty if Capacity or total cylinders change
    if (field === 'capacity' || field === 'partyCyl' || field === 'ourCyl') {
        const totalCyl = (parseInt(item.partyCyl) || 0) + (parseInt(item.ourCyl) || 0);
        item.qty = (parseFloat(item.capacity) || 0) * totalCyl;
    }

    // Recalculate Amount
    if (field === 'qty' || field === 'rate' || field === 'ratePer' || field === 'capacity' || field === 'partyCyl' || field === 'ourCyl') {
        const totalCyl = (parseInt(item.partyCyl) || 0) + (parseInt(item.ourCyl) || 0);
        const qtyToUse = item.ratePer === 'Qty' ? item.qty : totalCyl;
        item.amount = (qtyToUse || 0) * (parseFloat(item.rate) || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
    calculateTotals(newItems, formData);
  };

  const calculateTotals = (currentItems, currentFormData) => {
    const gross = currentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalQty = currentItems.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
    
    // Simple tax calculation (e.g., 18% if GST Local)
    let igst = 0, cgst = 0, sgst = 0;
    if (currentFormData.taxType === 'GST LOCAL') {
        cgst = gross * 0.09;
        sgst = gross * 0.09;
    } else if (currentFormData.taxType === 'GST INTERSTATE') {
        igst = gross * 0.18;
    }

    const net = gross + igst + cgst + sgst + (parseFloat(currentFormData.freight) || 0) + (parseFloat(currentFormData.pf) || 0) + (parseFloat(currentFormData.other) || 0) - (parseFloat(currentFormData.discount) || 0);
    
    setFormData(prev => ({
      ...prev,
      grossTotal: gross,
      totalQty: totalQty,
      igst: igst,
      cgst: cgst,
      sgst: sgst,
      netTotal: Math.round(net)
    }));
  };

  const handleSave = async () => {
    if (!formData.customerName) {
      alert("Please select a customer.");
      return;
    }

    const filteredItems = items.filter(item => item.itemDescription);
    if (filteredItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    try {
      await api.post('/api/sales-invoices', { ...formData, items: filteredItems });
      alert("Sales Invoice saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving Sales Invoice:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-2 flex flex-col font-semibold">
      <div className="bg-[#f0f0f0] border border-gray-400 p-2 mb-1">
        <h2 className="text-[#000080] font-bold mb-2 flex items-center space-x-2 text-sm uppercase">
          <span className="text-blue-600">📊</span>
          <span>Sales Book - MATERIAL</span>
        </h2>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-6 space-y-1">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Sales A/c :</label>
              <select name="salesAc" value={formData.salesAc} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner">
                <option value="SALES ACCOUNT - MATERIAL">SALES ACCOUNT - MATERIAL</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Invoice No :</label>
              <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner" />
              <label className="w-16 text-right pr-2">Date :</label>
              <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Customer :</label>
              <select name="customerName" value={formData.customerName} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner text-[10px]">
                <option value="">-- Select Customer --</option>
                {customerOptions.map((opt, i) => <option key={i} value={opt.name}>{opt.name}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Location :</label>
              <input type="text" name="customerLocation" value={formData.customerLocation} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-start">
              <label className="w-24 text-right pr-2 pt-1">Address :</label>
              <textarea name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} className="border border-gray-400 px-1 w-96 bg-white h-12 shadow-inner resize-none"></textarea>
            </div>
            <div className="flex items-center">
                <label className="w-24 text-right pr-2">Consignee :</label>
                <input type="text" className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner" placeholder="Same as customer" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-6 space-y-1">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Type Of Invoice:</label>
              <select name="invoiceType" value={formData.invoiceType} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner">
                <option value="REGULAR">REGULAR</option>
                <option value="EXPORT">EXPORT</option>
              </select>
              <label className="w-24 text-right pr-2">D.R Challan No:</label>
              <input type="text" name="drChallanNo" value={formData.drChallanNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">Tax Type :</label>
              <select name="taxType" value={formData.taxType} onChange={handleInputChange} className="border border-gray-400 px-1 w-48 bg-white h-5 shadow-inner">
                <option value="GST LOCAL">GST LOCAL</option>
                <option value="GST INTERSTATE">GST INTERSTATE</option>
              </select>
              <label className="w-16 text-right pr-2">Cr.Days:</label>
              <input type="number" name="crDays" value={formData.crDays} onChange={handleInputChange} className="border border-gray-400 px-1 w-12 bg-white h-5 shadow-inner" />
              <label className="w-16 text-right pr-2">Due.Date:</label>
              <input type="date" name="dueDate" value={formData.dueDate} readOnly className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2">GST Type :</label>
              <select name="gstType" value={formData.gstType} onChange={handleInputChange} className="border border-gray-400 px-1 w-64 bg-white h-5 shadow-inner">
                <option value="Sales Taxable">Sales Taxable</option>
                <option value="Exempted Sales">Exempted Sales</option>
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
                <span className="text-red-600 font-bold ml-24">Total Records : {items.filter(i => i.itemDescription).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white border border-gray-400 overflow-auto">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead className="bg-[#f0f0f0] border-b border-gray-400 sticky top-0 shadow-sm">
            <tr>
              <th className="border-r border-gray-400 px-1 py-0.5">Item Description</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-12 text-center">Unit</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-12 text-center">Party Cyl</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-12 text-center">Our Cyl</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Capacity</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Qty</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Rate Per</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-16 text-center">Rate</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-20 text-center">Amount</th>
              <th className="border-r border-gray-400 px-1 py-0.5 w-20 text-center">Remark</th>
              <th className="px-1 py-0.5 text-center w-12">HSN</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? "bg-[#e1f5fe]" : "bg-white"} hover:bg-yellow-100 h-5 border-b border-gray-200`}>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.itemDescription} onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-center" value={row.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.partyCyl} onChange={(e) => handleItemChange(idx, 'partyCyl', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.ourCyl} onChange={(e) => handleItemChange(idx, 'ourCyl', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" step="0.001" value={row.capacity} onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right font-bold" value={row.qty.toFixed(3)} readOnly /></td>
                <td className="border-r border-gray-300 px-0.5">
                    <select className="w-full h-full bg-transparent outline-none" value={row.ratePer} onChange={(e) => handleItemChange(idx, 'ratePer', e.target.value)}>
                        <option value="Qty">Qty</option>
                        <option value="Nos">Nos</option>
                    </select>
                </td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.rate} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none text-right font-bold" value={row.amount.toFixed(2)} readOnly /></td>
                <td className="border-r border-gray-300 px-0.5"><input className="w-full h-full bg-transparent outline-none" value={row.remark} onChange={(e) => handleItemChange(idx, 'remark', e.target.value)} /></td>
                <td className="px-0.5"><input className="w-full h-full bg-transparent outline-none text-center" value={row.hsn} onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-12 gap-2 mt-1">
          <div className="col-span-8 space-y-1">
            <div className="flex items-center space-x-2 bg-yellow-100 border border-yellow-400 px-2 py-1 font-bold text-[10px]">
                <span className="text-yellow-800">💡 Tip: Press 'INS' for New Entry, 'DEL' for Delete Entry 'ENTER' to Edit</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] bg-white border border-gray-400 p-2 shadow-sm">
                <div className="space-y-1 border-r border-gray-200 pr-2">
                    <div className="flex justify-between"><span>Total Qty:</span><span className="font-bold text-blue-900">{formData.totalQty.toFixed(3)}</span></div>
                    <div className="flex justify-between text-blue-800"><span>Our Cyl:</span><span className="font-bold">{items.reduce((s,i) => s + (parseInt(i.ourCyl)||0), 0)}</span></div>
                </div>
                <div className="space-y-1 border-r border-gray-200 px-2">
                    <div className="flex justify-between text-red-800"><span>Party Cyl:</span><span className="font-bold">{items.reduce((s,i) => s + (parseInt(i.partyCyl)||0), 0)}</span></div>
                    <div className="flex justify-between font-bold text-gray-700"><span>Total Cyl:</span><span>{items.reduce((s,i) => s + (parseInt(i.ourCyl)||0) + (parseInt(i.partyCyl)||0), 0)}</span></div>
                </div>
                <div className="pl-2 space-y-1">
                   <div className="text-red-700 font-bold uppercase">GST No: 27BIZPM6147D1ZK</div>
                   <div className="text-gray-600">Type : <span className="font-bold">Registered</span></div>
                   <div className="text-green-700 font-bold">E-Invoice Generated !!</div>
                </div>
            </div>
            <div className="flex items-center space-x-4 mt-1">
                <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" className="w-3 h-3" /> <span>Extra Details</span></label>
            </div>
          </div>
          <div className="col-span-4 bg-white border border-gray-400 p-2 space-y-0.5 shadow-sm">
            <div className="flex justify-between"><span>Gross Total :</span><span className="font-bold">{formData.grossTotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
                <span>Dis/Sur :</span>
                <div className="flex space-x-1">
                    <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} className="border border-gray-400 w-16 text-right h-4" />
                    <span className="font-bold">0.00</span>
                </div>
            </div>
            <div className="flex justify-between"><span>P.F. :</span><input type="number" name="pf" value={formData.pf} onChange={handleInputChange} className="border border-gray-400 w-16 text-right h-4" /></div>
            <div className="flex justify-between"><span>Freight :</span><input type="number" name="freight" value={formData.freight} onChange={handleInputChange} className="border border-gray-400 w-16 text-right h-4" /></div>
            <div className="flex justify-between"><span>Other :</span><input type="number" name="other" value={formData.other} onChange={handleInputChange} className="border border-gray-400 w-16 text-right h-4" /></div>
            <div className="flex justify-between text-gray-600"><span>IGST :</span><span className="font-bold">{formData.igst.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>CGST :</span><span className="font-bold">{formData.cgst.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>SGST :</span><span className="font-bold">{formData.sgst.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-400 italic"><span>Round Off :</span><span className="font-bold">0.00</span></div>
            <div className="border-t border-gray-400 pt-1 flex justify-between text-blue-900 font-bold text-sm bg-blue-50 px-1 mt-1">
                <span>Net Total :</span>
                <span>{formData.netTotal.toFixed(2)}</span>
            </div>
          </div>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex rounded border border-gray-400 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] overflow-hidden">
            <button onClick={handleSave} className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">💾</span>
              <span className="font-bold">ADD</span>
            </button>
            <button className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-red-700 font-bold text-sm">⟲</span>
              <span className="font-bold">REVERSE</span>
            </button>
            <button className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">🔍</span>
              <span className="font-bold">VIEW</span>
            </button>
            <button className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">🖨️</span>
              <span className="font-bold">PRINT</span>
            </button>
            <button className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-green-800 font-bold text-sm">📄</span>
              <span className="font-bold">E-INVOICE</span>
            </button>
          </div>
          <button onClick={() => window.location.href = '/'} className="px-4 py-1 rounded border border-gray-400 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] hover:bg-gray-300 flex items-center space-x-1 shadow-sm">
            <span className="text-red-600 font-bold">🚪</span>
            <span className="font-bold uppercase">Exit</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SalesInvoice;
