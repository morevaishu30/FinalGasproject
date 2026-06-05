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
    customerGstNo: '',
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
      setCustomerOptions(res.data.map(c => ({
          name: c.customerName,
          address: [c.address1, c.address2, c.address3].filter(Boolean).join(', '),
          gstNo: c.gstin
      })));
      setFormData(prev => ({ ...prev, invoiceNo: 'POS23/TM/00062' }));
      
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
        } else {
            updatedData.customerAddress = '';
            updatedData.customerGstNo = '';
        }
        // Filter available GDAs matching selected customerName
        const filteredGda = gdaEntries.filter(g => g.partyName === value);
        setAvailableGda(filteredGda);
        setSelectedGdaNo('');
    }

    if (name === 'crDays') {
        const days = parseInt(value) || 0;
        const newDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updatedData.dueDate = newDueDate;
    }

    setFormData(updatedData);
  };

  const handleGdaSelect = (gdaNo) => {
    setSelectedGdaNo(gdaNo);
    if (!gdaNo) return;
    const gda = availableGda.find(g => g.gdaNo === gdaNo);
    if (gda) {
        // Auto-populate invoice items from GDA items
        const mappedItems = (gda.items || []).map((item) => ({
            itemDescription: item.itemDescription || '',
            unit: 'CUM',
            partyCyl: 0,
            ourCyl: item.qty || 0, // Assume our cylinder as default
            capacity: item.capacity || 7.000,
            qty: (item.capacity || 7.000) * (item.qty || 0),
            ratePer: 'Qty',
            rate: item.rate || 0,
            amount: item.amount || 0,
            remark: item.remark || '',
            hsn: ''
        }));
        // Fill the rest of the 10 rows with empty rows for editability
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
                remark: '',
                hsn: ''
            });
        }
        setItems(mappedItems);
        setFormData(prev => {
            const updated = {
                ...prev,
                drChallanNo: gda.gdaNo,
                remarks: `Ref GDA: ${gda.gdaNo}`
            };
            calculateTotals(mappedItems, updated);
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
      await api.post('/sales-invoices', { ...formData, items: filteredItems });
      alert("Sales Invoice saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving Sales Invoice:", error);
      alert("Error saving data. Please check backend.");
    }
  };

  const handleOpenViewModal = async () => {
    try {
      const res = await api.get('/sales-invoices');
      setInvoicesList(res.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoices list:", error);
      alert("Error fetching invoices list from backend.");
    }
  };

  const handleSelectInvoice = (invoice) => {
    const selectedCustomer = customerOptions.find(c => c.name === invoice.customerName);
    const gstNo = selectedCustomer ? selectedCustomer.gstNo : '';

    setFormData({
      salesAc: invoice.salesAc || 'SALES ACCOUNT - MATERIAL',
      invoiceNo: invoice.invoiceNo || '',
      invoiceDate: invoice.invoiceDate || '',
      invoiceType: invoice.invoiceType || 'REGULAR',
      taxType: invoice.taxType || 'GST LOCAL',
      gstType: invoice.gstType || 'Sales Taxable',
      customerName: invoice.customerName || '',
      customerLocation: invoice.customerLocation || 'DEFAULT ADDRESS',
      customerAddress: invoice.customerAddress || '',
      customerGstNo: gstNo,
      salesExecutive: invoice.salesExecutive || '',
      remarks: invoice.remarks || '',
      drChallanNo: invoice.drChallanNo || '',
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

    const loadedItems = invoice.items || [];
    const paddedItems = [...Array(10)].map((_, idx) => {
      if (idx < loadedItems.length) {
        return {
          itemDescription: loadedItems[idx].itemDescription || '',
          unit: loadedItems[idx].unit || 'CUM',
          partyCyl: loadedItems[idx].partyCyl || 0,
          ourCyl: loadedItems[idx].ourCyl || 0,
          capacity: loadedItems[idx].capacity || 7.0,
          qty: loadedItems[idx].qty || 0,
          ratePer: loadedItems[idx].ratePer || 'Qty',
          rate: loadedItems[idx].rate || 0,
          amount: loadedItems[idx].amount || 0,
          remark: loadedItems[idx].remark || '',
          hsn: loadedItems[idx].hsn || ''
        };
      }
      return {
        itemDescription: '',
        unit: 'CUM',
        partyCyl: 0,
        ourCyl: 0,
        capacity: 7.0,
        qty: 0,
        ratePer: 'Qty',
        rate: 0,
        amount: 0,
        remark: '',
        hsn: ''
      };
    });
    setItems(paddedItems);
    setIsViewModalOpen(false);
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
    if (!formData.customerName) {
      alert("Please select a customer first.");
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
    const totalRowsCount = 12;
    for (let i = 0; i < totalRowsCount; i++) {
      if (i < filteredItems.length) {
        const item = filteredItems[i];
        rowsHtml += `
          <tr class="item-row">
            <td style="text-align: center; border-right: 1px solid black;">${i + 1}</td>
            <td style="border-right: 1px solid black; padding-left: 8px;">${item.itemDescription}</td>
            <td style="text-align: center; border-right: 1px solid black;">${item.hsn || '28044000'}</td>
            <td style="text-align: right; border-right: 1px solid black; padding-right: 8px;">${parseFloat(item.qty).toFixed(2)}</td>
            <td style="text-align: right; border-right: 1px solid black; padding-right: 8px;">${parseFloat(item.rate).toFixed(2)}</td>
            <td style="text-align: right; padding-right: 8px;">${parseFloat(item.amount).toFixed(2)}</td>
          </tr>
        `;
      } else {
        rowsHtml += `
          <tr class="item-row empty">
            <td style="border-right: 1px solid black;">&nbsp;</td>
            <td style="border-right: 1px solid black;">&nbsp;</td>
            <td style="border-right: 1px solid black;">&nbsp;</td>
            <td style="border-right: 1px solid black;">&nbsp;</td>
            <td style="border-right: 1px solid black;">&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
        `;
      }
    }

    const amtInWords = numberToWords(formData.netTotal);

    const printContent = `
      <html>
      <head>
        <title>Invoice Print - Shiv Shakti Industrial Gases</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 15px;
            color: #000;
            background-color: #fff;
            font-size: 11px;
          }
          .invoice-border {
            border: 2px solid black;
            width: 100%;
            max-width: 750px;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .tax-invoice-header {
            text-align: center;
            border-bottom: 1.5px solid black;
            padding: 2px 0;
            font-weight: bold;
            font-size: 12px;
            letter-spacing: 1px;
          }
          .company-header {
            text-align: center;
            border-bottom: 2px solid black;
            padding: 8px 5px;
            position: relative;
          }
          .company-logo-container {
            position: absolute;
            left: 15px;
            top: 15px;
          }
          .company-logo {
            font-size: 32px;
            font-weight: bold;
            border: 2px solid black;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            line-height: 50px;
            text-align: center;
            font-family: 'Times New Roman', Times, serif;
          }
          .company-name {
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            font-family: 'Arial Black', Gadget, sans-serif;
            letter-spacing: 0.5px;
          }
          .company-address {
            margin: 3px 0 0 0;
            font-size: 10px;
            font-weight: bold;
          }
          .company-contact {
            margin: 2px 0 0 0;
            font-size: 10px;
            font-weight: bold;
          }
          .company-gst {
            margin: 2px 0 0 0;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid black;
          }
          .meta-table td {
            border: 1px solid black;
            padding: 4px 6px;
            vertical-align: top;
          }
          .customer-details {
            width: 60%;
          }
          .invoice-meta {
            width: 40%;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid black;
          }
          .items-table th {
            border: 1px solid black;
            border-top: none;
            padding: 6px 4px;
            font-size: 10px;
            font-weight: bold;
            background-color: #f2f2f2;
          }
          .items-table td {
            padding: 2px 4px;
          }
          .item-row {
            height: 22px;
          }
          .item-row.empty {
            height: 22px;
          }
          .vehicle-row {
            border-bottom: 1.5px solid black;
            height: 25px;
            padding: 4px 8px;
            font-weight: bold;
            box-sizing: border-box;
          }
          .footer-section {
            width: 100%;
            border-collapse: collapse;
          }
          .footer-section td {
            border: 1px solid black;
            padding: 4px;
            vertical-align: top;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
          }
          .totals-table td {
            border: 1px solid black;
            padding: 3px 6px;
            font-size: 10px;
          }
          .grand-total-row {
            font-weight: bold;
            background-color: #f2f2f2;
            font-size: 11px;
          }
          .signature-container {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding: 0 10px 5px 10px;
          }
          .signature-block {
            text-align: center;
            width: 180px;
          }
          .signature-line {
            border-top: 1px dashed black;
            margin-top: 35px;
            padding-top: 3px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 10px;">
          <button onclick="window.print();" style="padding: 6px 15px; font-weight: bold; background-color: #1e3a8a; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Invoice</button>
          <button onclick="window.close();" style="padding: 6px 15px; font-weight: bold; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close Window</button>
        </div>

        <div class="invoice-border">
          <div class="tax-invoice-header">TAX INVOICE</div>
          
          <div class="company-header">
            <div class="company-logo-container">
              <div class="company-logo">Ś</div>
            </div>
            <div class="company-name">SHIV SHAKTI INDUSTRIAL GASES</div>
            <div class="company-address">Add.: C/o. Sairaj Industries, Behind Pyramid Hotel, Bhosari-Alandi Road, Bhosari, Pune 411039</div>
            <div class="company-contact">Email: shivshakti.indgases@gmail.com &nbsp;&nbsp; Mob: 7248984438 / 7219684439</div>
            <div class="company-gst">GST No. : 27AFSFS7860R1ZL</div>
          </div>

          <table class="meta-table">
            <tr>
              <td class="customer-details">
                <div style="font-weight: bold; margin-bottom: 5px;">M/s:</div>
                <div style="font-size: 11px; line-height: 1.4; min-height: 50px;">
                  <strong>${formData.customerName}</strong><br/>
                  ${formData.customerAddress.replace(/\n/g, '<br/>')}
                </div>
                <div style="margin-top: 10px; font-weight: bold; font-size: 10px;">
                  Customer GST No. : ${formData.customerGstNo || 'N/A'}
                </div>
              </td>
              <td class="invoice-meta">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="border: none; padding: 2px 0; font-weight: bold; width: 45%;">Invoice No.</td>
                    <td style="border: none; padding: 2px 0; width: 5%;">:</td>
                    <td style="border: none; padding: 2px 0; font-weight: bold; font-size: 12px;">${formData.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td style="border: none; padding: 2px 0; font-weight: bold;">Dt.</td>
                    <td style="border: none; padding: 2px 0;">:</td>
                    <td style="border: none; padding: 2px 0;">${formData.invoiceDate}</td>
                  </tr>
                  <tr style="border-top: 1px solid #ccc;">
                    <td style="border: none; padding: 2px 0; font-weight: bold;">Challan No.</td>
                    <td style="border: none; padding: 2px 0;">:</td>
                    <td style="border: none; padding: 2px 0;">${formData.drChallanNo || ''}</td>
                  </tr>
                  <tr>
                    <td style="border: none; padding: 2px 0; font-weight: bold;">Dt.</td>
                    <td style="border: none; padding: 2px 0;">:</td>
                    <td style="border: none; padding: 2px 0;">${formData.invoiceDate}</td>
                  </tr>
                  <tr style="border-top: 1px solid #ccc;">
                    <td style="border: none; padding: 2px 0; font-weight: bold;">P.O. No.</td>
                    <td style="border: none; padding: 2px 0;">:</td>
                    <td style="border: none; padding: 2px 0;">N/A</td>
                  </tr>
                  <tr>
                    <td style="border: none; padding: 2px 0; font-weight: bold;">P.O. Date</td>
                    <td style="border: none; padding: 2px 0;">:</td>
                    <td style="border: none; padding: 2px 0;">N/A</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 7%; text-align: center;">Sr. No.</th>
                <th style="width: 48%; text-align: left; padding-left: 8px;">Description of Goods</th>
                <th style="width: 13%; text-align: center;">HSN Code</th>
                <th style="width: 10%; text-align: right; padding-right: 8px;">Qty.</th>
                <th style="width: 10%; text-align: right; padding-right: 8px;">Rate</th>
                <th style="width: 12%; text-align: right; padding-right: 8px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="vehicle-row">
            Vehicle No. : ${formData.remarks && formData.remarks.toLowerCase().includes('vehicle') ? formData.remarks : ''}
          </div>

          <table class="footer-section">
            <tr>
              <td style="width: 60%; padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 8px;">Rupees in words:</div>
                <div style="font-style: italic; font-size: 10px; line-height: 1.4; min-height: 35px;">
                  ${amtInWords}
                </div>
                
                <div class="signature-container">
                  <div class="signature-block">
                    <div class="signature-line" style="margin-top: 40px;">Receiver's Signature</div>
                  </div>
                </div>
              </td>
              <td style="width: 40%; padding: 0;">
                <table class="totals-table">
                  <tr>
                    <td style="border-left: none; border-top: none; width: 60%;">Total</td>
                    <td style="border-right: none; border-top: none; text-align: right; font-weight: bold;">${parseFloat(formData.grossTotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="border-left: none;">CGST @ 9%</td>
                    <td style="border-right: none; text-align: right;">${parseFloat(formData.cgst).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="border-left: none;">SGST @ 9%</td>
                    <td style="border-right: none; text-align: right;">${parseFloat(formData.sgst).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="border-left: none;">IGST @ 18%</td>
                    <td style="border-right: none; text-align: right;">${parseFloat(formData.igst).toFixed(2)}</td>
                  </tr>
                  <tr class="grand-total-row">
                    <td style="border-left: none; border-bottom: none;">Grand Total</td>
                    <td style="border-right: none; border-bottom: none; text-align: right;">${parseFloat(formData.netTotal).toFixed(2)}</td>
                  </tr>
                </table>
                
                <div style="text-align: center; margin-top: 10px; font-weight: bold; font-size: 9px; line-height: 1.3;">
                  For SHIV SHAKTI INDUSTRIAL GASES<br/>
                  <div style="height: 35px;"></div>
                  Authorised Signatory
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
              <label className="w-24 text-right pr-2 text-blue-800">Link GDA No :</label>
              <select value={selectedGdaNo} onChange={(e) => handleGdaSelect(e.target.value)} disabled={!formData.customerName} className="border border-gray-400 px-1 w-96 bg-white h-5 shadow-inner text-[10px] disabled:bg-gray-200">
                <option value="">-- Select GDA to load items --</option>
                {availableGda.map((g, i) => (
                    <option key={i} value={g.gdaNo}>
                        {g.gdaNo} ({g.entryDate}) - {g.items?.length || 0} items
                    </option>
                ))}
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
                <div className="text-red-700 font-bold uppercase">GST No: {formData.customerGstNo || 'N/A'}</div>
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
            <button onClick={handleOpenViewModal} className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
              <span className="text-blue-800 font-bold text-sm">🔍</span>
              <span className="font-bold">VIEW</span>
            </button>
            <button onClick={handlePrint} className="px-4 py-1 border-r border-gray-400 flex items-center space-x-1 hover:bg-gray-300">
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
                    <th className="p-2 border border-gray-300">Sales Account</th>
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
                        <td className="p-2 border border-gray-200">{inv.customerName}</td>
                        <td className="p-2 border border-gray-200">{inv.salesAc}</td>
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
