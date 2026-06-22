import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const SalesOrder = () => {
  const [formData, setFormData] = useState({
    orderNo: '',
    orderDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerLocation: 'DEFAULT ADDRESS',
    customerAddress: '',
    supplierOrderNo: '',
    supplierOrderDate: new Date().toISOString().split('T')[0],
    consigneeName: '',
    consigneeLocation: 'DEFAULT ADDRESS',
    consigneeAddress: '',
    orderType1: 'Regular',
    orderType2: 'C',
    orderType3: 'OP',
    depositAmount: 0.00,
    taxType: 'GST (LOCAL)',
    closeOrder: false,
    freight: 0,
  });

  const [items, setItems] = useState(
    [...Array(10)].map(() => ({
      itemDescription: '',
      unit: 'CUM',
      capacity: '',
      noOfCyl: '',
      gasQty: '',
      ratePer: '',
      rate: '',
      amount: 0,
      partyItemCode: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      outright: false,
    }))
  );

  const [partyOptions, setPartyOptions] = useState([]);
  const [allLedgers, setAllLedgers] = useState([]);
  const [itemGroupOptions, setItemGroupOptions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [custRes, suppRes, itemGroupsRes] = await Promise.all([
        api.get('/customer-ledgers'),
        api.get('/supplier-ledgers'),
        api.get('/item-groups'),
      ]);
      setItemGroupOptions(itemGroupsRes.data);
      const ledgers = [
        ...custRes.data.map(c => ({ name: c.customerName, address: [c.address1, c.address2, c.address3].filter(Boolean).join(', '), location: c.city || 'DEFAULT ADDRESS' })),
        ...suppRes.data.map(s => ({ name: s.supplierName, address: [s.address1, s.address2, s.address3].filter(Boolean).join(', '), location: s.city || 'DEFAULT ADDRESS' }))
      ];
      setAllLedgers(ledgers);
      setPartyOptions(ledgers.map(l => l.name));
      setFormData(prev => ({ ...prev, orderNo: 'SO26/00142' }));
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePartyChange = (fieldName, partyName) => {
    const ledger = allLedgers.find(l => l.name === partyName);
    if (fieldName === 'customerName') {
      setFormData(prev => ({ ...prev, customerName: partyName, customerLocation: ledger ? ledger.location : 'DEFAULT ADDRESS', customerAddress: ledger ? ledger.address : '' }));
    } else if (fieldName === 'consigneeName') {
      setFormData(prev => ({ ...prev, consigneeName: partyName, consigneeLocation: ledger ? ledger.location : 'DEFAULT ADDRESS', consigneeAddress: ledger ? ledger.address : '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    // Auto-calculate GAS Qty = Capacity × No. of Cyl
    if (field === 'capacity' || field === 'noOfCyl') {
      item.gasQty = ((parseFloat(item.capacity) || 0) * (parseFloat(item.noOfCyl) || 0)).toFixed(3);
    }
    // Amount = No. of Cylinders × Rate
    if (field === 'noOfCyl' || field === 'rate' || field === 'capacity') {
      item.amount = ((parseFloat(item.noOfCyl) || 0) * (parseFloat(item.rate) || 0));
    }
    newItems[index] = item;
    setItems(newItems);
  };

  // --- Core Calculations ---
  const grossTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const freight = parseFloat(formData.freight) || 0;
  const taxableAmount = grossTotal + freight;
  const isGSTLocal = formData.taxType === 'GST (LOCAL)' || formData.taxType === 'GST LOCAL';
  const sgstAuto = isGSTLocal  ? parseFloat((taxableAmount * 0.09).toFixed(2)) : 0;
  const cgstAuto = isGSTLocal  ? parseFloat((taxableAmount * 0.09).toFixed(2)) : 0;
  const igstAuto = !isGSTLocal ? parseFloat((taxableAmount * 0.18).toFixed(2)) : 0;
  const totalTax = sgstAuto + cgstAuto + igstAuto;
  const netTotal = (taxableAmount + totalTax).toFixed(2);

  const handleSave = async () => {
    if (!formData.customerName) { alert("Please select a customer."); return; }
    const filteredItems = items.filter(item => item.itemDescription);
    if (filteredItems.length === 0) { alert("Please add at least one item."); return; }
    try {
      await api.post('/sales-orders', {
        ...formData,
        orderType: formData.orderType1,
        items: filteredItems,
        grossTotal,
        sgst: sgstAuto,
        cgst: cgstAuto,
        igst: igstAuto,
        netTotal: parseFloat(netTotal),
      });
      alert("Sales Order saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving Sales Order:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 bg-white";
  const readOnlyCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 focus:outline-none";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-sm">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">

        <div className="bg-gradient-to-r from-green-700 to-teal-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Sales Order Book (Master)
          </h2>
          <button onClick={handleSave} className="bg-white text-green-700 hover:bg-gray-100 px-4 py-2 rounded font-semibold text-sm transition-colors shadow flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Order
          </button>
        </div>

        <div className="p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-2">General Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Entry No</label><input type="text" name="orderNo" value={formData.orderNo} readOnly className={readOnlyCls} /></div>
                <div><label className={labelCls}>Date</label><input type="date" name="orderDate" value={formData.orderDate} onChange={handleInputChange} className={inputCls} /></div>
              </div>

              <div>
                <label className={labelCls}>Customer</label>
                <select name="customerName" value={formData.customerName} onChange={(e) => handlePartyChange('customerName', e.target.value)} className={inputCls}>
                  <option value="">-- Select Customer --</option>
                  {partyOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Location</label>
                <input type="text" value={formData.customerLocation} readOnly className={readOnlyCls} />
              </div>

              <div><label className={labelCls}>Address</label><textarea name="customerAddress" value={formData.customerAddress} readOnly className={`${readOnlyCls} resize-none h-16`}></textarea></div>

              <div>
                <label className={labelCls}>Order Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <select name="orderType1" value={formData.orderType1} onChange={handleInputChange} className={inputCls}>
                    <option>Regular</option><option>Emergency</option>
                  </select>
                  <select name="orderType2" value={formData.orderType2} onChange={handleInputChange} className={inputCls}>
                    <option>C</option><option>R</option>
                  </select>
                  <select name="orderType3" value={formData.orderType3} onChange={handleInputChange} className={inputCls}>
                    <option>OP</option>
                    <option>shivshakti</option>
                    <option>vcl</option>
                    <option>CL</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-2">Supplier & Consignee</h3>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Supp.Ord.No</label><input type="text" name="supplierOrderNo" value={formData.supplierOrderNo} onChange={handleInputChange} className={inputCls} /></div>
                <div><label className={labelCls}>Date</label><input type="date" name="supplierOrderDate" value={formData.supplierOrderDate} onChange={handleInputChange} className={inputCls} /></div>
              </div>

              <div>
                <label className={labelCls}>Consignee</label>
                <select name="consigneeName" value={formData.consigneeName} onChange={(e) => handlePartyChange('consigneeName', e.target.value)} className={inputCls}>
                  <option value="">-- Select Consignee --</option>
                  {partyOptions.map((name, i) => <option key={i} value={name}>{name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Location</label>
                <input type="text" value={formData.consigneeLocation} readOnly className={readOnlyCls} />
              </div>

              <div><label className={labelCls}>Address</label><textarea name="consigneeAddress" value={formData.consigneeAddress} readOnly className={`${readOnlyCls} resize-none h-16`}></textarea></div>

              <div><label className={labelCls}>Deposite Amt</label><input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleInputChange} className={`${inputCls} text-right`} /></div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className={labelCls}>Tax Type</label>
                  <select name="taxType" value={formData.taxType} onChange={handleInputChange} className={inputCls}>
                    <option value="GST (LOCAL)">GST (LOCAL)</option>
                    <option value="GST (INTERSTATE)">GST (INTERSTATE)</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="closeOrder" checked={formData.closeOrder} onChange={handleInputChange} className="w-4 h-4 text-green-600 rounded border-gray-300" />
                    <span className="ml-2 text-sm font-medium text-gray-700">Close Order</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ── Items Table ── */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    {["", "", "Item Description", "Party Item Code", "Capacity", "No.Of.Cyl", "Rate Per number", "Rate", "Amount"].map((col, i) => (
                      <th key={i} className="px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-300 last:border-r-0">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-2 w-8 border-r border-gray-200"></td>
                      <td className="p-2 w-8 border-r border-gray-200"></td>
                      <td className="p-2 min-w-[160px] border-r border-gray-200">
                        <select value={row.itemDescription} onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-green-500 focus:border-green-500">
                          <option value=""></option>
                          {itemGroupOptions.map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                        </select>
                      </td>
                      <td className="p-2 w-32 border-r border-gray-200"><input className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" value={row.partyItemCode} onChange={(e) => handleItemChange(idx, 'partyItemCode', e.target.value)} /></td>
                      <td className="p-2 w-24 border-r border-gray-200"><input className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" type="number" value={row.capacity} onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)} /></td>
                      <td className="p-2 w-24 border-r border-gray-200"><input className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" type="number" value={row.noOfCyl} onChange={(e) => handleItemChange(idx, 'noOfCyl', e.target.value)} /></td>
                      <td className="p-2 w-28 border-r border-gray-200">
                        <input type="text" className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" value={row.ratePer} onChange={(e) => handleItemChange(idx, 'ratePer', e.target.value)} />
                      </td>
                      <td className="p-2 w-28 border-r border-gray-200"><input className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" type="number" value={row.rate} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} /></td>
                      <td className="p-2 w-32 text-right text-sm font-semibold text-gray-800 bg-green-50 rounded">{(parseFloat(row.amount) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="flex justify-end pt-4">
            <div className="w-full md:w-[420px] bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2 mb-4">Order Summary</h3>
              <div className="space-y-3">

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Gross Total (No. of Cyl × Rate) :</span>
                  <span className="font-semibold text-gray-800 w-28 text-right">₹ {grossTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Freight :</span>
                  <input type="number" name="freight" value={formData.freight} onChange={handleInputChange} className="w-28 text-right border border-gray-300 rounded px-2 py-1 focus:ring-green-500 focus:border-green-500 text-sm bg-white" />
                </div>

                <div className="flex justify-between items-center text-sm bg-green-50 rounded px-2 py-1.5">
                  <span className="text-green-700 font-medium">Taxable Amount :</span>
                  <span className="font-semibold text-green-700 w-28 text-right">₹ {taxableAmount.toFixed(2)}</span>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-2">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tax</span>
                    <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                      {isGSTLocal ? 'GST LOCAL — SGST 9% + CGST 9%' : 'GST INTERSTATE — IGST 18%'}
                    </span>
                  </div>
                  {isGSTLocal ? (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">SGST @ 9% :</span>
                        <span className="font-medium text-gray-800 w-28 text-right bg-yellow-50 border border-yellow-200 rounded px-2 py-1">₹ {sgstAuto.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-600">CGST @ 9% :</span>
                        <span className="font-medium text-gray-800 w-28 text-right bg-yellow-50 border border-yellow-200 rounded px-2 py-1">₹ {cgstAuto.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">IGST @ 18% :</span>
                      <span className="font-medium text-gray-800 w-28 text-right bg-yellow-50 border border-yellow-200 rounded px-2 py-1">₹ {igstAuto.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-500">Total Tax :</span>
                    <span className="font-semibold text-gray-700 w-28 text-right">₹ {totalTax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t-2 border-green-300 pt-3 mt-1 flex justify-between items-center bg-gradient-to-r from-green-50 to-teal-50 rounded px-3 py-2">
                  <div>
                    <span className="text-base font-bold text-gray-800">Net Total :</span>
                    <div className="text-xs text-gray-500 mt-0.5">Gross + Freight + Tax</div>
                  </div>
                  <span className="text-xl font-bold text-green-700">₹ {netTotal}</span>
                </div>

                <div className="text-xs text-gray-400 text-right pt-1">
                  Total Records: {items.filter(i => i.itemDescription).length}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SalesOrder;
