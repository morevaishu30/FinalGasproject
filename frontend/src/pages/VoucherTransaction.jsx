import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { VOUCHER_CONFIGS } from '../config/voucherConfigs';

const PATH_TO_TYPE = {
  '/bank-receipt': 'bank-receipt',
  '/bank-payment': 'bank-payment',
  '/cash-receipt': 'cash-receipt',
  '/cash-payment': 'cash-payment',
};

const emptyParticularRow = (showCheque) => ({
  particulars: '',
  amount: '',
  chqNo: '',
  chqDate: '',
  bank: '',
});

const emptyAdjustRow = () => ({
  date: '',
  type: '',
  book: '',
  docNo: '',
  refNo: '',
  orgAmount: '',
  dueAmount: '',
  recAmount: '',
  other: '',
});

const VoucherTransaction = () => {
  const { pathname } = useLocation();
  const type = PATH_TO_TYPE[pathname];
  const config = type ? VOUCHER_CONFIGS[type] : null;

  const [showBookModal, setShowBookModal] = useState(true);
  const [selectedBook, setSelectedBook] = useState('');
  const [pendingBook, setPendingBook] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNo, setVoucherNo] = useState('');
  const [depositTo, setDepositTo] = useState('');
  const [parties, setParties] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [activeTab, setActiveTab] = useState('bank');
  const [particularRows, setParticularRows] = useState([]);
  const [adjustRows, setAdjustRows] = useState([]);

  useEffect(() => {
    if (!config) return;
    setPendingBook(config.defaultBook);
    setSelectedBook('');
    setShowBookModal(true);
    setVoucherNo(`${config.shortCode}26/00001`);
    setParticularRows([...Array(8)].map(() => emptyParticularRow(config.showCheque)));
    setAdjustRows([...Array(6)].map(() => emptyAdjustRow()));
    
    if (type === 'bank-receipt' || type === 'cash-receipt') {
        api.get('/customer-ledgers').then(res => setParties(res.data)).catch(console.error);
    } else if (type === 'bank-payment' || type === 'cash-payment') {
        api.get('/supplier-ledgers').then(res => setParties(res.data)).catch(console.error);
    }
  }, [type, config]);

  useEffect(() => {
    if (!depositTo) return;
    if (type === 'bank-receipt' || type === 'cash-receipt') {
        api.get(`/sales-invoices/outstanding/customer/${depositTo}`).then(res => {
            const rows = res.data.map(inv => ({
                date: inv.invoiceDate || '',
                type: 'SalesInvoice',
                book: 'Sales',
                docNo: inv.invoiceNo || '',
                refNo: inv.gdaNo || '',
                orgAmount: inv.netTotal || 0,
                dueAmount: ((inv.netTotal || 0) - (inv.paidAmount || 0)).toFixed(2),
                recAmount: '',
                other: '',
                invoiceId: inv.id
            }));
            while(rows.length < 6) rows.push(emptyAdjustRow());
            setAdjustRows(rows);
        }).catch(console.error);
    } else if (type === 'bank-payment' || type === 'cash-payment') {
        api.get(`/material-purchases/outstanding/supplier/${depositTo}`).then(res => {
            const rows = res.data.map(inv => ({
                date: inv.entryDate || '',
                type: 'MaterialPurchase',
                book: 'Purchase',
                docNo: inv.entryNo || '',
                refNo: inv.billNo || '',
                orgAmount: inv.netTotal || 0,
                dueAmount: ((inv.netTotal || 0) - (inv.paidAmount || 0)).toFixed(2),
                recAmount: '',
                other: '',
                invoiceId: inv.id
            }));
            while(rows.length < 6) rows.push(emptyAdjustRow());
            setAdjustRows(rows);
        }).catch(console.error);
    }
  }, [depositTo, type]);

  if (!config) {
    return (
      <div className="p-8 text-center text-gray-600">Voucher type not found.</div>
    );
  }

  const handleBookOk = () => {
    setSelectedBook(pendingBook);
    setShowBookModal(false);
  };

  const handleParticularChange = (idx, field, value) => {
    const next = [...particularRows];
    next[idx] = { ...next[idx], [field]: value };
    setParticularRows(next);
  };

  const handleAdjustChange = (idx, field, value) => {
    const next = [...adjustRows];
    next[idx] = { ...next[idx], [field]: value };
    setAdjustRows(next);
  };

  const totalAmount = particularRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const totalRec = adjustRows.reduce((sum, r) => sum + (parseFloat(r.recAmount) || 0), 0);

  const titleSuffix = selectedBook
    ? `${selectedBook.split(' - ')[0] || selectedBook} - ${selectedBook.match(/\d+/)?.[0] || ''} - ${config.shortCode}`
    : config.shortCode;

  const cellInput = 'w-full h-full bg-transparent outline-none px-1 text-[11px]';
  const thCls = 'border border-gray-400 bg-[#c0c0c0] px-1 py-0.5 font-bold text-[10px] text-center whitespace-nowrap';
  const tdCls = 'border border-gray-300 p-0 h-6';

  const handleSave = async () => {
    try {
      const payload = {
        voucherType: type,
        book: selectedBook || pendingBook,
        voucherDate,
        voucherNo,
        partyName: depositTo,
        remarks,
        totalAmount,
        totalAdjustedAmount: totalRec,
        particulars: particularRows.filter(r => r.particulars || r.amount).map(r => ({ ...r, amount: parseFloat(r.amount) || 0 })),
        adjustments: adjustRows.filter(r => r.recAmount).map(r => ({ ...r, recAmount: parseFloat(r.recAmount) || 0 }))
      };
      await api.post('/vouchers', payload);
      alert('Voucher saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to save voucher.');
    }
  };

  return (
    <div
      className="bg-[#d4d0c8] min-h-[calc(100vh-8rem)] font-sans text-[11px] select-none -mx-4 sm:-mx-6 lg:-mx-8 px-1 pb-4"
      style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}
    >
      {/* Book selection modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#f0f0f0] border-2 border-gray-500 shadow-2xl w-[420px]">
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-3 py-1.5 font-bold text-sm flex justify-between items-center">
              <span>{config.bookModalTitle}</span>
              <button type="button" onClick={() => setShowBookModal(false)} className="text-white hover:text-red-200 text-lg leading-none">×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <label className="font-bold whitespace-nowrap">Change Book :</label>
                <select
                  value={pendingBook}
                  onChange={(e) => setPendingBook(e.target.value)}
                  className="flex-1 border border-gray-400 bg-white h-7 px-1 shadow-inner text-[11px]"
                >
                  {config.books.map((book) => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleBookOk} className="px-6 py-1 border border-gray-500 bg-[#e0e0e0] hover:bg-[#d0d0d0] font-bold shadow-sm">Ok</button>
                <button type="button" onClick={() => setShowBookModal(false)} className="px-6 py-1 border border-gray-500 bg-[#e0e0e0] hover:bg-[#d0d0d0] font-bold shadow-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title bar */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-3 py-1 flex justify-between items-center border border-gray-600 mb-1">
        <span className="font-bold text-sm">
          {config.title} — {titleSuffix}
        </span>
        <button
          type="button"
          onClick={() => { setPendingBook(selectedBook || config.defaultBook); setShowBookModal(true); }}
          className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded border border-white/40"
        >
          Change Book
        </button>
      </div>

      {/* Header fields */}
      <div className="bg-[#f0f0f0] border border-gray-400 p-2 mb-1 grid grid-cols-12 gap-2 items-start">
        <div className="col-span-8 space-y-1.5">
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex items-center">
              <label className="w-24 text-right pr-2 font-bold">Voucher Date :</label>
              <input type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} className="border border-gray-400 bg-white h-6 w-32 px-1 shadow-inner" />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-2 font-bold">Voucher No :</label>
              <input type="text" value={voucherNo} onChange={(e) => setVoucherNo(e.target.value)} className="border border-gray-400 bg-[#e0ffff] h-6 w-36 px-1 shadow-inner font-semibold" />
            </div>
            <div className="flex items-center flex-1 min-w-[280px]">
              <label className="w-24 text-right pr-2 font-bold">{config.depositLabel} :</label>
              <input type="text" list="partyList" value={depositTo} onChange={(e) => setDepositTo(e.target.value)} className="border border-gray-400 bg-white h-6 flex-1 px-1 shadow-inner" placeholder="Select party / account" />
              <datalist id="partyList">
                {parties.map(p => <option key={p.id} value={p.printName || p.partyName} />)}
              </datalist>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="flex items-start gap-1">
            <label className="font-bold pt-1 whitespace-nowrap">Tip for Remarks :</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="border border-gray-400 bg-white flex-1 h-14 px-1 shadow-inner resize-none text-[10px]" />
          </div>
        </div>
      </div>

      {/* Particulars grid */}
      <div className="bg-white border border-gray-400 mb-1 overflow-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr>
              <th className={`${thCls} text-left min-w-[280px]`}>PARTICULARS</th>
              <th className={`${thCls} w-28`}>AMOUNT</th>
              {config.showCheque && (
                <>
                  <th className={`${thCls} w-24`}>Chq.No</th>
                  <th className={`${thCls} w-28`}>Chq.Date</th>
                </>
              )}
              <th className={`${thCls} min-w-[120px]`}>Bank</th>
            </tr>
          </thead>
          <tbody>
            {particularRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-[#e8f4fc]' : 'bg-white'}>
                <td className={tdCls}><input className={cellInput} value={row.particulars} onChange={(e) => handleParticularChange(idx, 'particulars', e.target.value)} /></td>
                <td className={tdCls}><input className={`${cellInput} text-right`} value={row.amount} onChange={(e) => handleParticularChange(idx, 'amount', e.target.value)} /></td>
                {config.showCheque && (
                  <>
                    <td className={tdCls}><input className={cellInput} value={row.chqNo} onChange={(e) => handleParticularChange(idx, 'chqNo', e.target.value)} /></td>
                    <td className={tdCls}><input type="date" className={cellInput} value={row.chqDate} onChange={(e) => handleParticularChange(idx, 'chqDate', e.target.value)} /></td>
                  </>
                )}
                <td className={tdCls}><input className={cellInput} value={row.bank} onChange={(e) => handleParticularChange(idx, 'bank', e.target.value)} /></td>
              </tr>
            ))}
            <tr className="bg-[#f0f0f0] font-bold">
              <td className="border border-gray-400 px-2 py-1 text-right">Total</td>
              <td className="border border-gray-400 px-2 py-1 text-right text-[#000080]">{totalAmount.toFixed(2)}</td>
              {config.showCheque && <td className="border border-gray-400" colSpan={2} />}
              <td className="border border-gray-400" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tip + balance panel */}
      <div className="bg-[#ffffcc] border border-yellow-500 px-2 py-0.5 mb-1 flex items-center gap-2 text-[10px] font-bold text-yellow-900">
        <span>💡</span>
        <span>Tip : Press &apos;INS&apos; for New Entry, &apos;DEL&apos; for Delete Entry &apos;ENTER&apos; to Edit</span>
      </div>

      <div className="bg-[#f0f0f0] border border-gray-400 mb-1 p-2">
        <div className="flex gap-1 mb-2">
          <button type="button" onClick={() => setActiveTab('bank')} className={`px-4 py-0.5 border border-gray-500 font-bold text-[10px] ${activeTab === 'bank' ? 'bg-[#000080] text-white' : 'bg-[#e0e0e0]'}`}>Bank</button>
          <button type="button" onClick={() => setActiveTab('party')} className={`px-4 py-0.5 border border-gray-500 font-bold text-[10px] ${activeTab === 'party' ? 'bg-[#000080] text-white' : 'bg-[#e0e0e0]'}`}>Party</button>
        </div>
        <div className="text-[10px] font-bold text-[#000080] mb-1 truncate">
          {activeTab === 'bank' ? selectedBook || config.defaultBook : depositTo || '— Select Party —'}
        </div>
        <table className="w-full border-collapse text-[10px] mb-2 max-w-2xl">
          <thead>
            <tr>
              {['Op. Bal', 'Debit', 'Credit', 'Cl. Bal'].map((h) => (
                <th key={h} className="border border-gray-400 bg-[#c0c0c0] px-2 py-0.5 text-center font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {['0.00', '0.00', '0.00', '0.00'].map((v, i) => (
                <td key={i} className="border border-gray-300 bg-white px-2 py-0.5 text-right font-semibold">{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Adjustment grid */}
      <div className="bg-white border border-gray-400 mb-2 overflow-auto flex-1">
        <table className="w-full border-collapse min-w-[900px] text-[10px]">
          <thead>
            <tr>
              {['DATE', 'TYPE', 'BOOK', 'DOC #', 'REF#', 'ORG AMOUNT', 'DUE AMOUNT', 'REC AMOUNT', 'OTHER'].map((h) => (
                <th key={h} className={thCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adjustRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-[#fffef0]' : 'bg-white'}>
                <td className={tdCls}><input type="date" className={cellInput} value={row.date} onChange={(e) => handleAdjustChange(idx, 'date', e.target.value)} /></td>
                <td className={tdCls}><input className={cellInput} value={row.type} onChange={(e) => handleAdjustChange(idx, 'type', e.target.value)} /></td>
                <td className={tdCls}><input className={cellInput} value={row.book} onChange={(e) => handleAdjustChange(idx, 'book', e.target.value)} /></td>
                <td className={tdCls}><input className={cellInput} value={row.docNo} onChange={(e) => handleAdjustChange(idx, 'docNo', e.target.value)} /></td>
                <td className={tdCls}><input className={cellInput} value={row.refNo} onChange={(e) => handleAdjustChange(idx, 'refNo', e.target.value)} /></td>
                <td className={tdCls}><input className={`${cellInput} text-right`} value={row.orgAmount} onChange={(e) => handleAdjustChange(idx, 'orgAmount', e.target.value)} /></td>
                <td className={tdCls}><input className={`${cellInput} text-right`} value={row.dueAmount} onChange={(e) => handleAdjustChange(idx, 'dueAmount', e.target.value)} /></td>
                <td className={tdCls}><input className={`${cellInput} text-right bg-[#e0ffff]`} value={row.recAmount} onChange={(e) => handleAdjustChange(idx, 'recAmount', e.target.value)} /></td>
                <td className={tdCls}><input className={cellInput} value={row.other} onChange={(e) => handleAdjustChange(idx, 'other', e.target.value)} /></td>
              </tr>
            ))}
            <tr className="bg-[#f0f0f0] font-bold">
              <td className="border border-gray-400 px-1" colSpan={7} />
              <td className="border border-gray-400 px-2 py-0.5 text-right text-[#000080]">{totalRec.toFixed(2)}</td>
              <td className="border border-gray-400" />
            </tr>
          </tbody>
        </table>
      </div>
      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pr-4">
        <button type="button" onClick={handleSave} className="flex items-center gap-2 px-6 py-1.5 border-2 border-gray-500 bg-gradient-to-b from-[#f8f8f8] to-[#c8c8c8] hover:from-[#e8e8e8] shadow font-bold text-sm">
          <span className="text-green-700 text-lg">✓</span> SAVE
        </button>
        <button type="button" onClick={() => window.location.reload()} className="flex items-center gap-2 px-6 py-1.5 border-2 border-gray-500 bg-gradient-to-b from-[#f8f8f8] to-[#c8c8c8] hover:from-[#e8e8e8] shadow font-bold text-sm">
          <span className="text-red-600 text-lg">×</span> CANCEL
        </button>
      </div>
    </div>
  );
};

export default VoucherTransaction;
