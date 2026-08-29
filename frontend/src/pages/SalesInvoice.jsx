import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import DateInput, { formatDateToDDMMYYYY } from '../components/DateInput';

const SalesInvoice = () => {
  const [formData, setFormData] = useState({
    salesAc: 'SALES ACCOUNT - MATERIAL',
    invoiceNo: '126',
    invoiceDate: '2026-08-17',
    poNo: '5510774',
    poDate: '2026-08-04',
    chNo: '',
    chDate: '',
    invoiceType: 'REGULAR',
    taxType: 'GST LOCAL',
    gstType: 'Sales Taxable',
    customerName: 'Thermax Limited',
    customerLocation: 'DEFAULT ADDRESS',
    customerAddress: 'D-13,-R.D.Age Road,MIDC,\nChinchwad-Pune-411019',
    customerGstNo: '27AAACT3910D1ZS',
    salesExecutive: '',
    remarks: '',
    gdaNo: '',
    vehicleNo: 'MH14KG8157',
    vendorCode: '',
    crDays: 30,
    dueDate: '2026-09-16',
    grossTotal: 37350,
    discount: 0,
    pf: 0,
    freight: 0,
    other: 0,
    igst: 0,
    cgst: 3361.50,
    sgst: 3361.50,
    roundOff: 0,
    netTotal: 44073,
    totalQty: 3
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

  const [customerOptions, setCustomerOptions] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [invoicesList, setInvoicesList] = useState([]);
  const [gdaEntries, setGdaEntries] = useState([]);
  const [availableGda, setAvailableGda] = useState([]);
  const [selectedGdaNo, setSelectedGdaNo] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/customer-ledgers');
      const loadedCustomers = (res.data || []).map(c => ({
        name: c.customerName,
        address: [c.address1, c.address2, c.address3, c.city, c.pincode].filter(Boolean).join(',\n'),
        gstNo: c.gstin || '',
        vendorCode: c.customerCode || ''
      }));
      setCustomerOptions(loadedCustomers);

      const invRes = await api.get('/sales-invoices');
      const invoices = invRes.data || [];
      const inv133 = invoices.find(i => i.invoiceNo === '133');
      const inv132 = invoices.find(i => i.invoiceNo === '132');
      const inv131 = invoices.find(i => i.invoiceNo === '131');
      const inv126 = invoices.find(i => i.invoiceNo === '126');
      const targetInvoice = inv133 || inv132 || inv131 || inv126 || (invoices.length > 0 ? invoices[invoices.length - 1] : null);

      if (targetInvoice) {
        handleSelectInvoice(targetInvoice, loadedCustomers);
      } else {
        const techknow = loadedCustomers.find(c => c.name && c.name.includes('Techknowgreen'));
        const defaultCust = techknow || loadedCustomers.find(c => c.name === 'Thermax Limited') || loadedCustomers[0];
        if (defaultCust) {
          setFormData(prev => ({
            ...prev,
            customerName: defaultCust.name,
            customerAddress: defaultCust.address,
            customerGstNo: defaultCust.gstNo,
            vendorCode: defaultCust.vendorCode || ''
          }));
        }
      }

      const gdaRes = await api.get('/material-outward-gda');
      setGdaEntries(gdaRes.data || []);
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
        updatedData.customerGstNo = selected.gstNo || '';
        updatedData.vendorCode = selected.vendorCode || '';
      } else {
        updatedData.customerAddress = '';
        updatedData.customerGstNo = '';
        updatedData.vendorCode = '';
      }
      const filteredGda = gdaEntries.filter(g => g.partyName === value);
      setAvailableGda(filteredGda);
      setSelectedGdaNo('');
    }

    if (name === 'invoiceDate') {
      const days = parseInt(updatedData.crDays) || 0;
      if (value) {
        const baseDate = new Date(value);
        if (!isNaN(baseDate.getTime())) {
          const newDueDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          updatedData.dueDate = newDueDate;
        }
      }
    }

    if (name === 'crDays') {
      const days = parseInt(value) || 0;
      const baseDate = updatedData.invoiceDate ? new Date(updatedData.invoiceDate) : new Date();
      if (!isNaN(baseDate.getTime())) {
        const newDueDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updatedData.dueDate = newDueDate;
      }
    }

    if (name === 'taxType') {
      calculateTotals(items, updatedData);
    }

    setFormData(updatedData);

    if (['freight', 'discount', 'pf', 'other'].includes(name)) {
      calculateTotals(items, updatedData);
    }
  };

  const handleGdaSelect = (gdaNo) => {
    setSelectedGdaNo(gdaNo);
    if (!gdaNo) return;
    const gda = availableGda.find(g => g.gdaNo === gdaNo);
    if (gda) {
      const mappedItems = (gda.items || []).map((item) => ({
        itemDescription: item.itemDescription || '',
        unit: item.unit || 'CUM',
        partyCyl: 0,
        ourCyl: item.qty || 0,
        capacity: item.capacity || 7.000,
        qty: (item.capacity || 7.000) * (item.qty || 0),
        ratePer: 'Qty',
        rate: item.rate || 0,
        amount: item.amount || 0,
        remark: item.remark || '',
        hsn: item.hsn || ''
      }));
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
          gdaNo: gda.gdaNo,
          remarks: `Ref GDA: ${gda.gdaNo}`
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
      await api.post('/sales-invoices', { ...formData, items: filteredItems });
      alert("Sales Invoice saved successfully!");
    } catch (error) {
      console.error("Error saving Sales Invoice:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  const handleOpenViewModal = async () => {
    try {
      const res = await api.get('/sales-invoices');
      setInvoicesList(res.data || []);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoices list:", error);
      alert("Error fetching invoices list from backend.");
    }
  };

  const handleSelectInvoice = (invoice, customersList = customerOptions) => {
    const selectedCustomer = customersList.find(c => c.name === invoice.customerName);
    const gstNo = selectedCustomer ? selectedCustomer.gstNo : (invoice.customerGstNo || '');

    setFormData({
      salesAc: invoice.salesAc || 'SALES ACCOUNT - MATERIAL',
      invoiceNo: invoice.invoiceNo || '',
      invoiceDate: invoice.invoiceDate || '',
      poNo: invoice.poNo || '',
      poDate: invoice.poDate || '',
      chNo: invoice.chNo || '',
      chDate: invoice.chDate || '',
      invoiceType: invoice.invoiceType || 'REGULAR',
      taxType: invoice.taxType || 'GST LOCAL',
      gstType: invoice.gstType || 'Sales Taxable',
      customerName: invoice.customerName || '',
      customerLocation: invoice.customerLocation || 'DEFAULT ADDRESS',
      customerAddress: invoice.customerAddress || (selectedCustomer ? selectedCustomer.address : ''),
      customerGstNo: gstNo,
      salesExecutive: invoice.salesExecutive || '',
      remarks: invoice.remarks || '',
      gdaNo: invoice.gdaNo || '',
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
      salesAc: 'SALES ACCOUNT - MATERIAL',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      poNo: '',
      poDate: '',
      chNo: '',
      chDate: '',
      invoiceType: 'REGULAR',
      taxType: 'GST LOCAL',
      gstType: 'Sales Taxable',
      customerName: '',
      customerLocation: 'DEFAULT ADDRESS',
      customerAddress: '',
      customerGstNo: '',
      salesExecutive: '',
      remarks: '',
      gdaNo: '',
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
    setSelectedGdaNo('');
    setAvailableGda([]);
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

    if (!amount || amount === 0) return 'Zero Rupees Only';

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
    if (!formData.customerName) {
      alert("Please select a customer first.");
      return;
    }

    const filteredItems = items.filter(item => item.itemDescription);
    if (filteredItems.length === 0) {
      alert("Please add at least one item before printing.");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
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
            <td style="border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: 500;">${item.itemDescription}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px 2px;">${item.hsn || ''}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px 2px;">${item.unit || 'Nos'}</td>
            <td style="text-align: right; border: 1px solid #000; padding: 4px 6px;">${parseFloat(item.qty).toFixed(2)}</td>
            <td style="text-align: right; border: 1px solid #000; padding: 4px 6px;">${parseFloat(item.rate).toFixed(2)}</td>
            <td style="text-align: right; border: 1px solid #000; padding: 4px 6px; font-weight: 500;">${parseFloat(item.amount).toFixed(2)}</td>
          </tr>
        `;
      } else {
        rowsHtml += `
          <tr class="item-row empty" style="height: 24px;">
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

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${formData.invoiceNo || '126'}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 6mm; size: A4 portrait; }
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 10px auto;
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
          /* Top title bar */
          .top-title-bar {
            text-align: center;
            font-weight: 900;
            font-size: 13px;
            letter-spacing: 1px;
            padding: 4px 0;
            border-bottom: 2px solid #000;
            background-color: #f8fafc;
          }
          /* Company Header */
          .company-header {
            text-align: center;
            padding: 10px 15px 8px 15px;
            border-bottom: 2px solid #000;
          }
          .company-header .company-name {
            font-size: 22px;
            font-weight: 900;
            font-family: 'Arial Black', Gadget, sans-serif;
            letter-spacing: 0.5px;
            margin: 0;
            color: #000;
          }
          .company-header .address-line {
            font-size: 10px;
            margin: 4px 0 0 0;
            color: #2563eb;
            font-weight: 500;
          }
          .company-header .contact-line {
            font-size: 10px;
            margin: 2px 0 0 0;
            color: #2563eb;
            font-weight: 500;
          }
          .company-header .gstin-line {
            font-size: 11.5px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin: 4px 0 0 0;
            color: #000;
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

          .btn-print {
            padding: 8px 24px;
            font-weight: bold;
            background-color: #1e3a8a;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
          }
          .btn-close {
            padding: 8px 24px;
            font-weight: bold;
            background-color: #ef4444;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 12px;">
          <button class="btn-print" onclick="window.print();">🖨️ Print Tax Invoice</button>
          <button class="btn-close" onclick="window.close();">✕ Close</button>
        </div>

        <div class="invoice-container">
          <!-- 1. TAX INVOICE Header Bar -->
          <div class="top-title-bar">TAX INVOICE</div>

          <!-- 2. Company Header -->
          <div class="company-header">
            <div class="company-name">SHIV SHAKTI INDUSTRIAL GASES</div>
            <div class="address-line">Add. : C/o. Sairaj Industries, Behind Pyramid Hotel, Bhosari-Alandi Road, Bhosari, Pune 411039</div>
            <div class="contact-line">Email: shivshakti.indgases@gmail.com &nbsp;&nbsp;&nbsp; Mob.: 7248984438 / 7219684439</div>
            <div class="gstin-line">GST No. : 27AFSFS7860R1ZL</div>
          </div>

          <!-- 3. Metadata Grid (4 rows x 6 cols) -->
          <table class="meta-grid">
            <tr>
              <td class="label" style="width: 14%;">Invoice No.</td>
              <td class="value font-bold" style="width: 20%;">${formData.invoiceNo || 'POS23/TM/00062'}</td>
              <td class="label" style="width: 16%;">Transport Mode:</td>
              <td class="value" style="width: 16%;">${formData.vehicleNo ? formData.vehicleNo : 'Vendor'}</td>
              <td class="label" style="width: 14%;">P.O. No.</td>
              <td class="value font-bold" style="width: 20%;">${formData.poNo || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Invoice Date.</td>
              <td class="value">${formatDateToDDMMYYYY(formData.invoiceDate)}</td>
              <td class="label">Vendor</td>
              <td class="value">${formData.vendorCode || ''}</td>
              <td class="label">P.O. Date</td>
              <td class="value">${formatDateToDDMMYYYY(formData.poDate) || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Challan No.</td>
              <td class="value">${formData.chNo || formData.gdaNo || 'N/A'}</td>
              <td class="label">Date of supply</td>
              <td class="value">${formatDateToDDMMYYYY(formData.invoiceDate)}</td>
              <td class="label">DC no.</td>
              <td class="value">N/A</td>
            </tr>
            <tr>
              <td class="label">State:</td>
              <td class="value">Maharashtra</td>
              <td class="label">Pin</td>
              <td class="value">${(formData.customerAddress || '').match(/\b\d{6}\b/)?.[0] || '411005'}</td>
              <td class="label">Place of supply</td>
              <td class="value">Pune</td>
            </tr>
          </table>

          <!-- 4. Bill To & Ship To Sections -->
          <table class="bill-ship-table">
            <tr>
              <td class="section-title" style="width: 50%;">Bill To</td>
              <td class="section-title" style="width: 50%;">Ship To</td>
            </tr>
            <tr>
              <td style="padding: 4px 6px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">Company Name :</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.customerName}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0; vertical-align: top;">Address:</td><td style="border:none; padding: 2px 0;">${(formData.customerAddress || '').replace(/\n/g, '<br/>')}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">GSTIN</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.customerGstNo || 'N/A'}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">State:</td><td style="border:none; padding: 2px 0;">Maharashtra</td></tr>
                </table>
              </td>
              <td style="padding: 4px 6px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">Company Name :</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.customerName}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0; vertical-align: top;">Address:</td><td style="border:none; padding: 2px 0;">${(formData.customerAddress || '').replace(/\n/g, '<br/>')}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">GSTIN</td><td style="border:none; padding: 2px 0; font-weight: bold;">${formData.customerGstNo || 'N/A'}</td></tr>
                  <tr><td class="field-label" style="border:none; padding: 2px 0;">State:</td><td style="border:none; padding: 2px 0;">Maharashtra</td></tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- 5. Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 6%;">Sr.No.</th>
                <th style="width: 38%; text-align: left; padding-left: 8px;">Product Description</th>
                <th style="width: 14%;">HSN Code</th>
                <th style="width: 8%;">UOM</th>
                <th style="width: 10%;">Qty.</th>
                <th style="width: 12%;">Rate</th>
                <th style="width: 12%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- 6. Bottom Calculations, Amount in Words, Bank Details, Terms & Signatures -->
          <table class="footer-wrapper">
            <tr>
              <!-- Left Column: Amount in words + Bank Details + Terms -->
              <td style="width: 55%; border-right: 1px solid #000;">
                <div class="amount-words">
                  <div style="font-weight: bold; font-size: 10px;">In Words : ${amtInWords}</div>
                </div>

                <!-- Bank Details Table -->
                <table class="bank-details-table">
                  <tr>
                    <td colspan="2" style="font-weight: bold; text-align: center; background-color: #f5f5f5; font-size: 10px;">Bank Details</td>
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

                <div class="cert-line">
                  Certified that the particulars given above are true and correct
                </div>

                <div class="terms-section">
                  <div class="terms-title">Terms & Conditions:</div>
                  1) Client will ensure to upload all invoices in GSTR on or before 5th of every month, if any query arises then both the parties will have some buffer time for rectifications if any<br/>
                  2) Most IMP – Need to pay GST in time<br/>
                  3) Payment terms - As per agreement
                </div>
              </td>

              <!-- Right Column: Totals Table + Signatory -->
              <td style="width: 45%; vertical-align: top;">
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
                  ${parseFloat(formData.cgst) > 0 ? `
                  <tr>
                    <td class="total-label">Add: CGST @ 9%</td>
                    <td class="total-value">${parseFloat(formData.cgst).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  ${parseFloat(formData.sgst) > 0 ? `
                  <tr>
                    <td class="total-label">Add: SGST @ 9%</td>
                    <td class="total-value">${parseFloat(formData.sgst).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  ${parseFloat(formData.igst) > 0 ? `
                  <tr>
                    <td class="total-label">Add: IGST @ 18%</td>
                    <td class="total-value">${parseFloat(formData.igst).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr style="background-color: #f0f0f0;">
                    <td class="total-label" style="font-size: 10px;">Total After Tax</td>
                    <td class="total-value" style="font-size: 10px;">${totalAfterTax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="total-label" style="font-weight: 900;">Round Off Amount</td>
                    <td class="total-value" style="font-size: 11px; font-weight: 900; background-color: #f5f5f5;">${roundedTotal.toFixed(2)}</td>
                  </tr>
                </table>

                <div style="border: 1px solid #000; border-top: none; padding: 10px 8px; text-align: center; height: 115px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
                  <div style="font-weight: bold; font-size: 10px;">For SHIV SHAKTI INDUSTRIAL GASES</div>
                  <div style="font-weight: bold; font-size: 10px;">Authorised Signatory</div>
                </div>
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
          <span>Sales Book - TAX INVOICE</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Panel */}
          <div className="space-y-1">
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Sales A/c :</label>
              <select name="salesAc" value={formData.salesAc} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner">
                <option value="SALES ACCOUNT - MATERIAL">SALES ACCOUNT - MATERIAL</option>
              </select>
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">Invoice No :</label>
              <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner font-bold text-blue-900" />
              <label className="w-16 shrink-0 text-right pr-2">Date :</label>
              <DateInput name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner text-[11px]" />
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Customer :</label>
              <select name="customerName" value={formData.customerName} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner text-[10px] font-bold">
                <option value="">-- Select Customer --</option>
                {customerOptions.map((opt, i) => <option key={i} value={opt.name}>{opt.name}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2 text-blue-800">Link GDA No :</label>
              <select value={selectedGdaNo} onChange={(e) => handleGdaSelect(e.target.value)} disabled={!formData.customerName} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner text-[10px] disabled:bg-gray-200">
                <option value="">-- Select GDA to load items (Optional) --</option>
                {availableGda.map((g, i) => (
                  <option key={i} value={g.gdaNo}>
                    {g.gdaNo} ({g.entryDate}) - {g.items?.length || 0} items
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Location :</label>
              <input type="text" name="customerLocation" value={formData.customerLocation} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner" />
            </div>
            <div className="flex items-start">
              <label className="w-24 shrink-0 text-right pr-2 pt-1">Address :</label>
              <textarea name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-12 shadow-inner resize-none"></textarea>
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">GST No :</label>
              <input type="text" name="customerGstNo" value={formData.customerGstNo} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner font-bold text-red-700" />
              <label className="w-20 shrink-0 text-right pr-2">Vendor Code:</label>
              <input type="text" name="vendorCode" value={formData.vendorCode} onChange={handleInputChange} className="border border-gray-400 px-1 w-28 bg-white h-5 shadow-inner" />
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
              <label className="w-20 shrink-0 text-right pr-2">GDA no:</label>
              <input type="text" name="gdaNo" value={formData.gdaNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner" />
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
              <DateInput name="dueDate" value={formData.dueDate} readOnly className="border border-gray-400 px-1 w-28 bg-gray-100 h-5 shadow-inner text-[11px]" />
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">GST Type :</label>
              <select name="gstType" value={formData.gstType} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner">
                <option value="Sales Taxable">Sales Taxable</option>
                <option value="Exempted Sales">Exempted Sales</option>
              </select>
              <label className="w-20 shrink-0 text-right pr-2">Vehicle No:</label>
              <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner font-bold" />
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2 text-blue-900 font-bold">Po No :</label>
              <input type="text" name="poNo" value={formData.poNo} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner font-bold" />
              <label className="w-20 shrink-0 text-right pr-2 text-blue-900 font-bold">Po Date :</label>
              <DateInput name="poDate" value={formData.poDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner text-[11px]" />
            </div>
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-1">
              <label className="w-24 shrink-0 text-right pr-2">Ch. No :</label>
              <input type="text" name="chNo" value={formData.chNo} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-[100px] bg-white h-5 shadow-inner" />
              <label className="w-20 shrink-0 text-right pr-2">Ch. Date :</label>
              <DateInput name="chDate" value={formData.chDate} onChange={handleInputChange} className="border border-gray-400 px-1 w-32 bg-white h-5 shadow-inner text-[11px]" />
            </div>
            <div className="flex items-center">
              <label className="w-24 shrink-0 text-right pr-2">Sales Executive:</label>
              <input type="text" name="salesExecutive" value={formData.salesExecutive} onChange={handleInputChange} className="border border-gray-400 px-1 flex-1 min-w-0 bg-white h-5 shadow-inner" />
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
          <div className="flex justify-between"><span>Freight :</span><input type="number" name="freight" value={formData.freight} onChange={handleInputChange} className="border border-gray-400 w-20 text-right h-4" /></div>
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
              <h3 className="font-bold text-sm uppercase">🔍 Search / Select Sales Invoice</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-white hover:text-red-200 font-bold text-lg leading-none">×</button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-400 font-semibold text-gray-700">
                    <th className="p-2 border border-gray-300">Invoice No.</th>
                    <th className="p-2 border border-gray-300">Date</th>
                    <th className="p-2 border border-gray-300">Customer Name</th>
                    <th className="p-2 border border-gray-300">PO No.</th>
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
                        <td className="p-2 border border-gray-200">{formatDateToDDMMYYYY(inv.invoiceDate)}</td>
                        <td className="p-2 border border-gray-200 font-semibold">{inv.customerName}</td>
                        <td className="p-2 border border-gray-200">{inv.poNo || '-'}</td>
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

export default SalesInvoice;
