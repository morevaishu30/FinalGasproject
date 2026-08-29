import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const PurchaseInvoice = () => {
  const [formData, setFormData] = useState({
    purchaseAc: 'PURCHASE ACCOUNT - MATERIAL',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceType: 'REGULAR',
    taxType: 'GST LOCAL',
    gstType: 'Purchase Taxable',
    supplierName: '',
    supplierLocation: 'DEFAULT ADDRESS',
    supplierAddress: '',
    supplierGstNo: '',
    purchaseExecutive: '',
    remarks: '',
    ftmNo: '',
    vehicleNo: '',
    vendorCode: '',
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

  const [items, setItems] = useState([
    {
      itemDescription: '',
      unit: 'Nos',
      partyCyl: 0,
      ourCyl: 0,
      capacity: 1.0,
      qty: 0,
      ratePer: 'Nos',
      rate: 0,
      amount: 0,
      remark: '',
      hsn: ''
    }
  ]);

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [invoicesList, setInvoicesList] = useState([]);
  const [ftmEntries, setFtmEntries] = useState([]);
  const [availableFtm, setAvailableFtm] = useState([]);
  const [selectedFtmNo, setSelectedFtmNo] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/supplier-ledgers');
      setSupplierOptions(res.data.map(s => ({
          name: s.supplierName,
          address: [s.address1, s.address2, s.address3].filter(Boolean).join(', '),
          gstNo: s.gstin
      })));
      setFormData(prev => ({ ...prev, invoiceNo: 'PUR/26/00001' }));
      
      const ftmRes = await api.get('/material-inward-ftm');
      setFtmEntries(ftmRes.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === 'supplierName') {
        const selected = supplierOptions.find(s => s.name === value);
        if (selected) {
            updatedData.supplierAddress = selected.address || '';
            updatedData.supplierGstNo = selected.gstNo || '';
        } else {
            updatedData.supplierAddress = '';
            updatedData.supplierGstNo = '';
        }
        // Filter available FTMs matching selected supplierName
        const filteredFtm = ftmEntries.filter(f => f.customerName === value);
        setAvailableFtm(filteredFtm);
        setSelectedFtmNo('');
    }

    if (name === 'crDays') {
        const days = parseInt(value) || 0;
        const newDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updatedData.dueDate = newDueDate;
    }

    setFormData(updatedData);
    
    if (['freight', 'discount', 'pf', 'other'].includes(name)) {
        calculateTotals(items, updatedData);
    }
  };

  const handleFtmSelect = (entryNo) => {
    setSelectedFtmNo(entryNo);
    if (!entryNo) return;
    const ftm = availableFtm.find(f => f.entryNo === entryNo);
    if (ftm) {
      const mappedItems = (ftm.items || []).map((item) => {
        const cap = parseFloat(item.capacity) || 7.000;
        const cylCount = 1;
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
          remark: item.cylinderNo ? `Cyl: ${item.cylinderNo}` : '',
          hsn: ''
        };
      });
      const finalItems = mappedItems.length > 0 ? mappedItems : [{
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
      }];
      setItems(finalItems);
      setFormData(prev => {
        const updated = {
          ...prev,
          ftmNo: ftm.entryNo,
          remarks: `Ref FTM: ${ftm.entryNo}`
        };
        calculateTotals(finalItems, updated);
        return updated;
      });
    }
  };

  const handleAddRow = () => {
    setItems(prev => [
      ...prev,
      {
        itemDescription: '',
        unit: 'Nos',
        partyCyl: 0,
        ourCyl: 0,
        capacity: 1.0,
        qty: 0,
        ratePer: 'Nos',
        rate: 0,
        amount: 0,
        remark: '',
        hsn: ''
      }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (items.length <= 1) {
      const emptyRow = [{
        itemDescription: '',
        unit: 'Nos',
        partyCyl: 0,
        ourCyl: 0,
        capacity: 1.0,
        qty: 0,
        ratePer: 'Nos',
        rate: 0,
        amount: 0,
        remark: '',
        hsn: ''
      }];
      setItems(emptyRow);
      calculateTotals(emptyRow, formData);
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotals(newItems, formData);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'qty' || field === 'capacity' || field === 'partyCyl' || field === 'ourCyl') {
      if (item.ratePer === 'Nos' || item.ratePer === 'Item') {
        const totalCyl = (parseInt(item.partyCyl) || 0) + (parseInt(item.ourCyl) || 0);
        if (totalCyl > 0 && field !== 'qty') {
          item.qty = totalCyl;
        }
      } else {
        const totalCyl = (parseInt(item.partyCyl) || 0) + (parseInt(item.ourCyl) || 0);
        if (totalCyl > 0) {
          item.qty = (parseFloat(item.capacity) || 0) * totalCyl;
        }
      }
    }

    if (field === 'qty' || field === 'rate' || field === 'ratePer' || field === 'capacity' || field === 'partyCyl' || field === 'ourCyl') {
      const qtyToUse = parseFloat(item.qty) || 0;
      item.amount = qtyToUse * (parseFloat(item.rate) || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
    calculateTotals(newItems, formData);
  };

  const calculateTotals = (currentItems, currentFormData) => {
    const gross = currentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalQty = currentItems.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
    
    const taxableAmount = gross + (parseFloat(currentFormData.freight) || 0);
    
    let igst = 0, cgst = 0, sgst = 0;
    if (currentFormData.taxType === 'GST LOCAL') {
      cgst = taxableAmount * 0.09;
      sgst = taxableAmount * 0.09;
    } else if (currentFormData.taxType === 'GST INTERSTATE') {
      igst = taxableAmount * 0.18;
    }

    const net = taxableAmount + igst + cgst + sgst + (parseFloat(currentFormData.pf) || 0) + (parseFloat(currentFormData.other) || 0) - (parseFloat(currentFormData.discount) || 0);
    
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
      await api.post('/purchase-invoices', { ...formData, items: filteredItems });
      alert("Purchase Invoice saved successfully!");
    } catch (error) {
      console.error("Error saving Purchase Invoice:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  const handleOpenViewModal = async () => {
    try {
      const res = await api.get('/purchase-invoices');
      setInvoicesList(res.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoices list:", error);
      alert("Error fetching invoices list from backend.");
    }
  };

  const handleSelectInvoice = (invoice) => {
    const selectedCustomer = supplierOptions.find(c => c.name === invoice.supplierName);
    const gstNo = selectedCustomer ? selectedCustomer.gstNo : '';

    setFormData({
      purchaseAc: invoice.purchaseAc || 'PURCHASE ACCOUNT - MATERIAL',
      invoiceNo: invoice.invoiceNo || '',
      invoiceDate: invoice.invoiceDate || '',
      invoiceType: invoice.invoiceType || 'REGULAR',
      taxType: invoice.taxType || 'GST LOCAL',
      gstType: invoice.gstType || 'Purchase Taxable',
      supplierName: invoice.supplierName || '',
      supplierLocation: invoice.supplierLocation || 'DEFAULT ADDRESS',
      supplierAddress: invoice.supplierAddress || '',
      supplierGstNo: gstNo,
      purchaseExecutive: invoice.purchaseExecutive || '',
      remarks: invoice.remarks || '',
      ftmNo: invoice.ftmNo || '',
      vehicleNo: invoice.vehicleNo || '',
      vendorCode: invoice.vendorCode || '',
      crDays: invoice.crDays || 30,
      dueDate: invoice.dueDate || '',
      grossTotal: invoice.grossTotal || 0,
      discount: invoice.discount || 0,
      pf: invoice.pf || 0,
      freight: invoice.freight || 0,
      other: invoice.other || 0,
      igst: invoice.igst || 0,
      cgst: invoice.cgst || 0,
      sgst: invoice.sgst || 0,
      roundOff: invoice.roundOff || 0,
      netTotal: invoice.netTotal || 0,
      totalQty: invoice.totalQty || 0
    });

    const loadedItems = (invoice.items || []).map(item => ({
      itemDescription: item.itemDescription || '',
      unit: item.unit || 'Nos',
      partyCyl: item.partyCyl || 0,
      ourCyl: item.ourCyl || 0,
      capacity: item.capacity || 1.0,
      qty: item.qty || 0,
      ratePer: item.ratePer || 'Nos',
      rate: item.rate || 0,
      amount: item.amount || 0,
      remark: item.remark || '',
      hsn: item.hsn || ''
    }));

    setItems(loadedItems.length > 0 ? loadedItems : [{
      itemDescription: '',
      unit: 'Nos',
      partyCyl: 0,
      ourCyl: 0,
      capacity: 1.0,
      qty: 0,
      ratePer: 'Nos',
      rate: 0,
      amount: 0,
      remark: '',
      hsn: ''
    }]);
    setIsViewModalOpen(false);
  };

  const handleClear = () => {
    setFormData({
      purchaseAc: 'PURCHASE ACCOUNT - MATERIAL',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceType: 'REGULAR',
      taxType: 'GST LOCAL',
      gstType: 'Purchase Taxable',
      supplierName: '',
      supplierLocation: 'DEFAULT ADDRESS',
      supplierAddress: '',
      supplierGstNo: '',
      purchaseExecutive: '',
      remarks: '',
      ftmNo: '',
      vehicleNo: '',
      vendorCode: '',
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
    setItems([
      {
        itemDescription: '',
        unit: 'Nos',
        partyCyl: 0,
        ourCyl: 0,
        capacity: 1.0,
        qty: 0,
        ratePer: 'Nos',
        rate: 0,
        amount: 0,
        remark: '',
        hsn: ''
      }
    ]);
    setSelectedFtmNo('');
    setAvailableFtm([]);
  };

  const numberToWords = (amount) => {
    const words = {
      0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
      10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
      20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
    };

    const convertLessThanOneThousand = (num) => {
      let tempStr = '';
      if (num >= 100) {
        tempStr += words[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num > 0) {
        if (tempStr !== '') tempStr += 'and ';
        if (num < 20) {
          tempStr += words[num] + ' ';
        } else {
          tempStr += words[Math.floor(num / 10) * 10] + ' ';
          if (num % 10 > 0) {
            tempStr += words[num % 10] + ' ';
          }
        }
      }
      return tempStr;
    };

    if (amount === 0) return 'Zero Rupees Only';

    let value = Math.floor(amount);
    let paise = Math.round((amount - value) * 100);

    let result = '';

    if (Math.floor(value / 10000000) > 0) {
      result += convertLessThanOneThousand(Math.floor(value / 10000000)) + 'Crore ';
      value %= 10000000;
    }

    if (Math.floor(value / 100000) > 0) {
      result += convertLessThanOneThousand(Math.floor(value / 100000)) + 'Lakh ';
      value %= 100000;
    }

    if (Math.floor(value / 1000) > 0) {
      result += convertLessThanOneThousand(Math.floor(value / 1000)) + 'Thousand ';
      value %= 1000;
    }

    if (value > 0) {
      result += convertLessThanOneThousand(value);
    }

    result += 'Rupees ';

    if (paise > 0) {
      result += 'and ' + convertLessThanOneThousand(paise) + 'Paise ';
    }

    return result.trim() + ' Only';
  };

  const handlePrint = () => {
    if (!formData.supplierName) {
      alert("Please select a supplier first.");
      return;
    }

    const filteredItems = items.filter(item => item.itemDescription);
    if (filteredItems.length === 0) {
      alert("Please add at least one item before printing.");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Pop-up blocker is preventing print view. Please allow popups for this site.");
      return;
    }
    
    let rowsHtml = '';
    const totalRowsCount = 10;
    for (let i = 0; i < totalRowsCount; i++) {
      if (i < filteredItems.length) {
        const item = filteredItems[i];
        rowsHtml += `
          <tr class="item-row">
            <td style="text-align: center; border: 1px solid #000; padding: 4px 2px;">${i + 1}</td>
            <td style="border: 1px solid #000; padding: 4px 6px; text-align: left;">${item.itemDescription}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px 2px;">${item.hsn || '28044000'}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px 2px;">${item.unit || 'CUM'}</td>
            <td style="text-align: right; border: 1px solid #000; padding: 4px 6px;">${parseFloat(item.qty).toFixed(2)}</td>
            <td style="text-align: right; border: 1px solid #000; padding: 4px 6px;">${parseFloat(item.rate).toFixed(2)}</td>
            <td style="text-align: right; border: 1px solid #000; padding: 4px 6px;">${parseFloat(item.amount).toFixed(2)}</td>
          </tr>
        `;
      } else {
        rowsHtml += `
          <tr class="item-row empty">
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
          </tr>
        `;
      }
    }

    const amtInWords = numberToWords(formData.netTotal);

    const totalAmountBeforeTax = parseFloat(formData.grossTotal) + parseFloat(formData.freight || 0);
    const totalAfterTax = totalAmountBeforeTax + parseFloat(formData.cgst) + parseFloat(formData.sgst) + parseFloat(formData.igst);
    const roundedTotal = Math.round(totalAfterTax);
    const roundOffDiff = (roundedTotal - totalAfterTax).toFixed(2);

    const printContent = `
      <html>
      <head>
        <title>Invoice Print - Shiv Shakti Industrial Gases</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
            @page { margin: 8mm; }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 10px;
            color: #000;
            background-color: #fff;
            font-size: 11px;
          }
          .invoice-container {
            border: 2px solid #000;
            width: 100%;
            max-width: 780px;
            margin: 0 auto;
            box-sizing: border-box;
          }
          /* Company Header */
          .company-header {
            text-align: center;
            padding: 10px 15px 8px 15px;
            border-bottom: 2px solid #000;
            position: relative;
          }
          .company-header .logo-circle {
            position: absolute;
            left: 20px;
            top: 12px;
            width: 55px;
            height: 55px;
            border: 2px solid #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: bold;
            font-family: 'Times New Roman', serif;
          }
          .company-header .company-name {
            font-size: 20px;
            font-weight: 900;
            font-family: 'Arial Black', Gadget, sans-serif;
            letter-spacing: 1px;
            margin: 0;
          }
          .company-header .regd-add {
            font-size: 9px;
            margin: 3px 0 0 0;
            line-height: 1.4;
          }
          .company-header .work-add {
            font-size: 9px;
            margin: 2px 0 0 0;
            line-height: 1.4;
          }
          .company-header .contact-line {
            font-size: 9px;
            font-weight: bold;
            margin: 2px 0 0 0;
          }
          .company-header .gstin-line {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 1px;
            margin: 3px 0 0 0;
          }

          /* Tax Invoice Title */
          .tax-invoice-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 2px;
            padding: 4px 0;
            border-bottom: 2px solid #000;
            background-color: #f5f5f5;
          }

          /* Invoice Meta Grid */
          .meta-grid {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #000;
          }
          .meta-grid td {
            border: 1px solid #000;
            padding: 3px 6px;
            font-size: 10px;
            vertical-align: middle;
          }
          .meta-grid .label {
            font-weight: bold;
            white-space: nowrap;
          }
          .meta-grid .value {
            min-width: 60px;
          }

          /* Bill To / Ship To */
          .bill-ship-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #000;
          }
          .bill-ship-table td {
            border: 1px solid #000;
            padding: 3px 6px;
            font-size: 10px;
            vertical-align: top;
          }
          .bill-ship-table .section-title {
            font-weight: bold;
            text-align: center;
            background-color: #f5f5f5;
            padding: 3px;
            font-size: 11px;
          }
          .bill-ship-table .field-label {
            font-weight: bold;
            width: 80px;
          }

          /* Items Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #000;
          }
          .items-table th {
            border: 1px solid #000;
            padding: 5px 4px;
            font-size: 10px;
            font-weight: bold;
            background-color: #f2f2f2;
            text-align: center;
          }
          .items-table td {
            padding: 3px 4px;
            font-size: 10px;
          }
          .item-row { height: 24px; }
          .item-row.empty { height: 24px; }

          /* Footer / Totals area */
          .footer-wrapper {
            width: 100%;
            border-collapse: collapse;
          }
          .footer-wrapper td {
            vertical-align: top;
          }

          .amount-words {
            padding: 6px 8px;
            border: 1px solid #000;
            font-size: 10px;
          }

          .totals-right-table {
            width: 100%;
            border-collapse: collapse;
          }
          .totals-right-table td {
            border: 1px solid #000;
            padding: 3px 8px;
            font-size: 10px;
          }
          .totals-right-table .total-label {
            font-weight: bold;
            text-align: right;
            width: 55%;
          }
          .totals-right-table .total-value {
            text-align: right;
            font-weight: bold;
            width: 45%;
          }

          .bank-details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0;
          }
          .bank-details-table td {
            border: 1px solid #000;
            padding: 3px 8px;
            font-size: 10px;
          }
          .bank-details-table .bank-label {
            font-weight: bold;
            width: 110px;
          }

          .terms-section {
            padding: 6px 8px;
            border: 1px solid #000;
            border-top: none;
            font-size: 9px;
            line-height: 1.5;
          }
          .terms-section .terms-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 3px;
            font-size: 10px;
          }

          .signatory-section {
            text-align: center;
            padding: 8px;
            border: 1px solid #000;
            border-top: none;
            font-size: 10px;
          }

          .cert-line {
            text-align: center;
            padding: 4px 8px;
            font-size: 9px;
            font-style: italic;
            border: 1px solid #000;
            border-top: none;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 10px;">
          <button onclick="window.print();" style="padding: 8px 20px; font-weight: bold; background-color: #1e3a8a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">🖨️ Print Invoice</button>
          <button onclick="window.close();" style="padding: 8px 20px; font-weight: bold; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 13px;">✕ Close</button>
        </div>

        <div class="invoice-container">
          <!-- TAX INVOICE Title -->
          <div style="text-align: center; font-weight: bold; font-size: 14px; letter-spacing: 1px; padding: 4px 0; border-bottom: 1px solid #000; background-color: #f5f5f5;">TAX INVOICE</div>
          
          <!-- Company Header -->
          <div style="text-align: center; padding: 10px 15px 8px 15px; border-bottom: 2px solid #000;">
            <div style="font-size: 22px; font-weight: 900; font-family: 'Arial Black', Gadget, sans-serif; letter-spacing: 1px; margin: 0; color: #0f172a;">SHIV SHAKTI INDUSTRIAL GASES</div>
            <div style="font-size: 11px; margin: 4px 0 0 0; color: #3b82f6;">Add.: C/o. Sairaj Industries, Behind Pyramid Hotel, Bhosari-Alandi Road, Bhosari, Pune 411039</div>
            <div style="font-size: 11px; margin: 2px 0 0 0; color: #3b82f6;">Email: shivshakti.indgases@gmail.com &nbsp;&nbsp; Mob: 7248984438 / 7219684439</div>
            <div style="font-size: 12px; font-weight: bold; margin: 4px 0 0 0; letter-spacing: 1px; color: #0f172a;">GST No. : 27AFSFS7860R1ZL</div>
          </div>

          <!-- Invoice Meta Details -->
          <table class="meta-grid">
            <tr>
              <td class="label">Invoice No.</td>
              <td class="value">${formData.invoiceNo}</td>
              <td class="label">Vehicle No.</td>
              <td class="value">${formData.vehicleNo || ''}</td>
              <td class="label">P.O. No.</td>
              <td class="value">N/A</td>
            </tr>
            <tr>
              <td class="label">Invoice Date.</td>
              <td class="value">${formData.invoiceDate}</td>
              <td class="label">Vendor Code</td>
              <td class="value">${formData.vendorCode || ''}</td>
              <td class="label">P.O. Date</td>
              <td class="value">N/A</td>
            </tr>
            <tr>
              <td class="label">Challan No.</td>
              <td class="value">${formData.ftmNo || ''}</td>
              <td class="label">Date of supply</td>
              <td class="value">${formData.invoiceDate}</td>
              <td class="label">GDA no.</td>
              <td class="value">${formData.ftmNo || ''}</td>
            </tr>
          </table>

          <!-- Bill To / Ship To -->
          <table class="bill-ship-table">
            <tr>
              <td class="section-title" style="width: 50%; border-bottom: 1px solid #000;">Bill To</td>
              <td class="section-title" style="width: 50%; border-bottom: 1px solid #000;">Ship To</td>
            </tr>
            <tr>
              <td style="padding: 4px 6px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">Company Name :</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.supplierName}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">Address:</td><td style="border:none; padding: 2px 0;">${formData.supplierAddress.replace(/\n/g, '<br/>')}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">GSTIN</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.supplierGstNo || 'N/A'}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">State:</td><td style="border:none; padding: 2px 0;">Maharashtra</td></tr>
                </table>
              </td>
              <td style="padding: 4px 6px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">Company Name :</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.supplierName}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">Address:</td><td style="border:none; padding: 2px 0;">${formData.supplierAddress.replace(/\n/g, '<br/>')}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">GSTIN</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.supplierGstNo || 'N/A'}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">State:</td><td style="border:none; padding: 2px 0;">Maharashtra</td></tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 6%;">Sr.No.</th>
                <th style="width: 36%; text-align: left; padding-left: 8px;">Product Description</th>
                <th style="width: 12%;">HSN Code</th>
                <th style="width: 8%;">UOM</th>
                <th style="width: 12%;">Qty.</th>
                <th style="width: 12%;">Rate</th>
                <th style="width: 14%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- Amount in Words + Totals side by side -->
          <table class="footer-wrapper" style="width: 100%; border-collapse: collapse;">
            <tr>
              <!-- Left: Amount in words -->
              <td style="width: 50%; vertical-align: top;">
                <div class="amount-words">
                  <div style="font-weight: bold; margin-bottom: 4px; font-size: 11px;">In Words : ${amtInWords}</div>
                </div>

                <!-- Bank Details -->
                <table class="bank-details-table">
                  <tr>
                    <td colspan="2" style="font-weight: bold; text-align: center; background-color: #f5f5f5; font-size: 11px;">Bank Details</td>
                  </tr>
                  <tr>
                    <td class="bank-label">Bank Account :</td>
                    <td style="font-weight: bold;">39520200003198</td>
                  </tr>
                  <tr>
                    <td class="bank-label">Bank Name :</td>
                    <td style="font-weight: bold;">Bank of Baroda</td>
                  </tr>
                  <tr>
                    <td class="bank-label">Bank IFSC :</td>
                    <td style="font-weight: bold;">BARB0BHOSAR</td>
                  </tr>
                  <tr>
                    <td class="bank-label">Branch :</td>
                    <td style="font-weight: bold;">Bhosari, Pune - 411039</td>
                  </tr>
                </table>
              </td>

              <!-- Right: Totals -->
              <td style="width: 50%; vertical-align: top;">
                <table class="totals-right-table">
                  <tr>
                    <td class="total-label">Total Amount</td>
                    <td class="total-value">${parseFloat(formData.grossTotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="total-label">Freight</td>
                    <td class="total-value">${parseFloat(formData.freight || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="total-label">Total Amount before tax</td>
                    <td class="total-value">${totalAmountBeforeTax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="total-label">Add: CGST @ 9%</td>
                    <td class="total-value">${parseFloat(formData.cgst).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="total-label">Add: SGST @ 9%</td>
                    <td class="total-value">${parseFloat(formData.sgst).toFixed(2)}</td>
                  </tr>
                  ${parseFloat(formData.igst) > 0 ? `
                  <tr>
                    <td class="total-label">Add: IGST @ 18%</td>
                    <td class="total-value">${parseFloat(formData.igst).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr style="background-color: #f0f0f0;">
                    <td class="total-label" style="font-size: 11px;">Total After Tax</td>
                    <td class="total-value" style="font-size: 11px;">${totalAfterTax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="total-label">Round Off Amount</td>
                    <td class="total-value" style="font-size: 12px; font-weight: 900; background-color: #f5f5f5;">${roundedTotal.toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Certified line -->
          <div class="cert-line">
            Certified that the particulars given above are true and correct
          </div>

          <!-- Terms & Conditions + Signatory -->
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 55%; vertical-align: top; border: 1px solid #000; padding: 6px 8px;">
                <div style="font-weight: bold; text-decoration: underline; margin-bottom: 4px; font-size: 10px;">Terms & Conditions:</div>
                <div style="font-size: 9px; line-height: 1.6;">
                  1) Client will ensure to upload all invoices in GSTR on or before 5th of every month, if any query arises then both the parties will have some buffer time for rectifications if any<br/>
                  2) Most IMP – Need to pay GST in time<br/>
                  3) Payment terms - As per agreement
                </div>
              </td>
              <td style="width: 45%; vertical-align: top; border: 1px solid #000; padding: 6px 8px; text-align: center;">
                <div style="font-weight: bold; font-size: 10px;">For SHIV SHAKTI INDUSTRIAL GASES</div>
                <div style="height: 55px;"></div>
                <div style="font-weight: bold; font-size: 10px; border-top: 1px dashed #000; padding-top: 4px; display: inline-block; padding-left: 15px; padding-right: 15px;">Authorised Signatory</div>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-2 flex flex-col font-semibold">
      <div className="bg-[#f0f0f0] border border-gray-400 p-2 mb-1 shadow-sm">
        <h2 className="text-[#000080] font-bold mb-2 flex items-center space-x-2 text-sm uppercase">
          <span className="text-blue-600">📊</span>
          <span>Purchase Book - MATERIAL</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Panel */}
          <div className="space-y-1">
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Purchase A/c :</label>
              <select name="purchaseAc" value={formData.purchaseAc} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner">
                <option value="PURCHASE ACCOUNT - MATERIAL">PURCHASE ACCOUNT - MATERIAL</option>
              </select>
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">Invoice No :</label>
              <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner" />
              <label className="w-16 shrink-0 text-right pr-2">Date :</label>
              <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner text-[11px]" />
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Supplier :</label>
              <select name="supplierName" value={formData.supplierName} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner text-[10px]">
                <option value="">-- Select Supplier --</option>
                {supplierOptions.map((opt, i) => <option key={i} value={opt.name}>{opt.name}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2 text-blue-800">Link FTM No :</label>
              <select value={selectedFtmNo} onChange={(e) => handleFtmSelect(e.target.value)} disabled={!formData.supplierName} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner text-[10px] disabled:bg-gray-200">
                <option value="">-- Select FTM to load items --</option>
                {availableFtm.map((f, i) => (
                    <option key={i} value={f.entryNo}>
                        {f.entryNo} ({f.entryDate}) - {f.items?.length || 0} items
                    </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Location :</label>
              <input type="text" name="supplierLocation" value={formData.supplierLocation} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-start">
              <label className="w-24 shrink-0 text-right pr-2 pt-1">Address :</label>
              <textarea name="supplierAddress" value={formData.supplierAddress} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-10 shadow-inner resize-none"></textarea>
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Consignee :</label>
              <input type="text" className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner" placeholder="Same as supplier" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-1">
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">Type Of Invoice:</label>
              <select name="invoiceType" value={formData.invoiceType} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner">
                <option value="REGULAR">REGULAR</option>
                <option value="EXPORT">EXPORT</option>
              </select>
              <label className="w-20 shrink-0 text-right pr-2">FTM No:</label>
              <input type="text" name="ftmNo" value={formData.ftmNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">Tax Type :</label>
              <select name="taxType" value={formData.taxType} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[110px] bg-white h-5 shadow-inner">
                <option value="GST LOCAL">GST LOCAL (CGST+SGST 9%)</option>
                <option value="GST INTERSTATE">GST INTERSTATE (IGST 18%)</option>
              </select>
              <label className="w-14 shrink-0 text-right pr-1">Cr.Days:</label>
              <input type="number" name="crDays" value={formData.crDays} onChange={handleInputChange} className="border border-gray-400 px-1 w-12 bg-white h-5 shadow-inner" />
              <label className="w-16 shrink-0 text-right pr-1">Due.Date:</label>
              <input type="date" name="dueDate" value={formData.dueDate} readOnly className="border border-gray-400 px-1 w-28 bg-gray-100 h-5 shadow-inner text-[11px]" />
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">GST Type :</label>
              <select name="gstType" value={formData.gstType} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner">
                <option value="Purchase Taxable">Purchase Taxable</option>
                <option value="Interstate Purchase Taxable">Interstate Purchase Taxable</option>
              </select>
              <label className="w-20 shrink-0 text-right pr-2">Vehicle No:</label>
              <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner font-bold" />
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">Purchase Exec.:</label>
              <input type="text" name="purchaseExecutive" value={formData.purchaseExecutive} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner" />
              <label className="w-20 shrink-0 text-right pr-2">Vendor Code:</label>
              <input type="text" name="vendorCode" value={formData.vendorCode} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Remarks :</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white border border-gray-400 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left border-collapse text-[10px]">
          <thead className="bg-[#f0f0f0] border-b border-gray-400 sticky top-0 shadow-sm">
            <tr>
              <th className="border-r border-gray-400 px-1 py-1 w-6 text-center">Sr.</th>
              <th className="border-r border-gray-400 px-1 py-1">Item Description</th>
              <th className="border-r border-gray-400 px-1 py-1 w-20 text-center">HSN Code</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Unit</th>
              <th className="border-r border-gray-400 px-1 py-1 w-14 text-center">Our Cyl</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Capacity</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Qty</th>
              <th className="border-r border-gray-400 px-1 py-1 w-16 text-center">Rate Per</th>
              <th className="border-r border-gray-400 px-1 py-1 w-20 text-center">Rate</th>
              <th className="border-r border-gray-400 px-1 py-1 w-24 text-center">Amount</th>
              <th className="border-r border-gray-400 px-1 py-1 text-center w-24">Remark</th>
              <th className="px-1 py-1 text-center w-8">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"} hover:bg-yellow-100 h-6 border-b border-gray-200`}>
                <td className="border-r border-gray-300 text-center font-bold text-gray-600">{idx + 1}</td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none font-bold" value={row.itemDescription} onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)} placeholder="" /></td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none text-center" value={row.hsn} onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)} placeholder="" /></td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none text-center" value={row.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none text-right" type="number" value={row.ourCyl || ''} onChange={(e) => handleItemChange(idx, 'ourCyl', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none text-right" type="number" step="0.001" value={row.capacity || ''} onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none text-right font-bold text-blue-900" type="number" value={row.qty || ''} onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-1">
                  <select className="w-full h-full bg-transparent outline-none" value={row.ratePer} onChange={(e) => handleItemChange(idx, 'ratePer', e.target.value)}>
                    <option value="Nos">Nos</option>
                    <option value="Qty">Qty</option>
                  </select>
                </td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none text-right font-bold" type="number" value={row.rate || ''} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} /></td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none text-right font-bold text-emerald-800" value={row.amount ? row.amount.toFixed(2) : ''} readOnly /></td>
                <td className="border-r border-gray-300 px-1"><input className="w-full h-full bg-transparent outline-none" value={row.remark} onChange={(e) => handleItemChange(idx, 'remark', e.target.value)} /></td>
                <td className="px-1 text-center">
                  <button type="button" onClick={() => handleRemoveRow(idx)} title="Delete Row" className="text-red-500 hover:text-red-700 font-bold px-1 rounded hover:bg-red-50">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-100 border-x border-b border-gray-400 p-1 flex justify-start">
        <button type="button" onClick={handleAddRow} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-0.5 rounded text-[10px] flex items-center gap-1 shadow-sm">
          <span>➕</span> Add Item Row
        </button>
      </div>

      <div className="flex justify-end mt-1">
        <div className="w-full sm:w-80 md:w-96 bg-white border border-gray-400 p-2 space-y-0.5 shadow-sm">
          <div className="flex justify-between"><span>Gross Total :</span><span className="font-bold">{formData.grossTotal.toFixed(2)}</span></div>
          <div className="flex justify-between items-center">
            <span>Dis/Sur :</span>
            <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} className="border border-gray-400 w-20 text-right h-4" />
          </div>
          <div className="flex justify-between"><span>P.F. :</span><input type="number" name="pf" value={formData.pf} onChange={handleInputChange} className="border border-gray-400 w-20 text-right h-4" /></div>
          <div className="flex justify-between"><span>Freight :</span><input type="number" name="freight" value={formData.freight} onChange={handleInputChange} className="border border-gray-400 w-20 text-right h-4" /></div>
          <div className="flex justify-between"><span>Other :</span><input type="number" name="other" value={formData.other} onChange={handleInputChange} className="border border-gray-400 w-20 text-right h-4" /></div>
          <div className="flex justify-between text-gray-600"><span>IGST :</span><span className="font-bold">{formData.igst.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>CGST (9%) :</span><span className="font-bold">{formData.cgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>SGST (9%) :</span><span className="font-bold">{formData.sgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-400 italic"><span>Round Off :</span><span className="font-bold">{formData.roundOff.toFixed(2)}</span></div>
          <div className="border-t border-gray-400 pt-1 flex justify-between text-blue-900 font-bold text-sm bg-blue-50 px-1 mt-1">
            <span>Net Total :</span>
            <span>{formData.netTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded border border-gray-400 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] overflow-hidden shadow-sm">
            <button onClick={handleSave} className="px-3 sm:px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">💾</span>
              <span className="font-bold">SAVE / ADD</span>
            </button>
            <button onClick={handleOpenViewModal} className="px-3 sm:px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">🔍</span>
              <span className="font-bold">VIEW LIST</span>
            </button>
            <button onClick={handlePrint} className="px-3 sm:px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-blue-600 hover:text-white bg-blue-50 text-blue-900 font-bold">
              <span className="text-blue-800 font-bold text-sm">🖨️</span>
              <span className="font-bold">PRINT INVOICE</span>
            </button>
            <button type="button" onClick={handleClear} className="px-3 sm:px-4 py-1 flex items-center space-x-1 hover:bg-gray-300 text-gray-800 font-bold">
              <span className="text-orange-600 font-bold text-sm">🔄</span>
              <span className="font-bold">CLEAR</span>
            </button>
          </div>
          <button onClick={() => window.location.href = '/'} className="px-4 py-1 rounded border border-gray-400 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] hover:bg-gray-300 flex items-center space-x-1 shadow-sm">
            <span className="text-red-600 font-bold">🚪</span>
            <span className="font-bold uppercase">Exit</span>
          </button>
        </div>
      </div>

      {/* VIEW Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-400 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden font-sans">
            <div className="bg-[#1e3a8a] text-white px-4 py-2 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase">🔍 Search / Select Purchase Invoice</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-white hover:text-red-200 font-bold text-lg leading-none">×</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-400 font-semibold text-gray-700">
                    <th className="p-2 border border-gray-300">Invoice No.</th>
                    <th className="p-2 border border-gray-300">Date</th>
                    <th className="p-2 border border-gray-300">Supplier Name</th>
                    <th className="p-2 border border-gray-300">Purchase Account</th>
                    <th className="p-2 border border-gray-300 text-right">Gross Total</th>
                    <th className="p-2 border border-gray-300 text-right">Net Total</th>
                    <th className="p-2 border border-gray-300 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500 italic">No invoices found in database.</td>
                    </tr>
                  ) : (
                    invoicesList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-blue-50 border-b border-gray-200 text-gray-700">
                        <td className="p-2 border border-gray-200 font-bold text-blue-900">{inv.invoiceNo}</td>
                        <td className="p-2 border border-gray-200">{inv.invoiceDate}</td>
                        <td className="p-2 border border-gray-200">{inv.supplierName}</td>
                        <td className="p-2 border border-gray-200">{inv.purchaseAc}</td>
                        <td className="p-2 border border-gray-200 text-right">{(inv.grossTotal || 0).toFixed(2)}</td>
                        <td className="p-2 border border-gray-200 text-right font-bold text-gray-900">{(inv.netTotal || 0).toFixed(2)}</td>
                        <td className="p-2 border border-gray-200 text-center">
                          <button 
                            onClick={() => handleSelectInvoice(inv)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-[10px] font-bold shadow-sm"
                          >
                            SELECT
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-100 px-4 py-2.5 border-t border-gray-300 flex justify-end">
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 rounded text-[10px] font-bold shadow-sm"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoice;
