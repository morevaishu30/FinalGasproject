import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const CylinderHoldingReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/holding');
      // Sort by party name
      const sorted = response.data.sort((a, b) => a.partyName.localeCompare(b.partyName));
      setReportData(sorted);
    } catch (error) {
      console.error("Error fetching holding report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group by Party
  const groupedData = reportData.reduce((acc, row) => {
    if (!acc[row.partyName]) acc[row.partyName] = [];
    acc[row.partyName].push(row);
    return acc;
  }, {});

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-4 flex flex-col font-semibold">
      <div className="bg-white border border-gray-400 p-4 shadow-sm mb-4">
        <h2 className="text-[#000080] font-bold text-lg uppercase flex items-center mb-2">
          <span className="mr-2">📋</span> Cylinder Holding Report
        </h2>
        <p className="text-gray-600 text-sm font-normal">
          Party-wise cylinder holding summary (GDA Outwards - ECR Inwards).
        </p>
      </div>

      <div className="flex-grow bg-white border border-gray-400 overflow-auto shadow-inner p-4">
        {loading ? (
          <div className="text-center text-gray-500 text-sm">Loading Report...</div>
        ) : Object.keys(groupedData).length === 0 ? (
          <div className="text-center text-gray-500 text-sm">No data found.</div>
        ) : (
          Object.keys(groupedData).map((party, idx) => (
            <div key={idx} className="mb-6 border border-gray-300 rounded overflow-hidden shadow-sm">
              <div className="bg-blue-100 border-b border-gray-300 px-4 py-2 font-bold text-blue-900 text-sm flex justify-between">
                <span>🏭 {party}</span>
              </div>
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-[#f0f0f0] border-b border-gray-300 text-xs">
                  <tr>
                    <th className="border-r border-gray-300 px-4 py-1.5 font-bold">Item Description</th>
                    <th className="px-4 py-1.5 font-bold text-right">Holding Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedData[party].map((row, rIdx) => (
                    <tr key={rIdx} className={`${rIdx % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"} hover:bg-yellow-50 h-7 border-b border-gray-200`}>
                      <td className="border-r border-gray-300 px-4">{row.itemDescription}</td>
                      <td className={`px-4 text-right font-bold ${row.holdingQty < 0 ? 'text-red-500' : 'text-green-700'}`}>
                        {row.holdingQty}
                      </td>
                    </tr>
                  ))}
                  {/* Subtotal Row */}
                  <tr className="bg-gray-100 font-bold border-t border-gray-400">
                    <td className="border-r border-gray-300 px-4 text-right text-gray-700">Total Cylinders Held:</td>
                    <td className="px-4 text-right text-black">
                      {groupedData[party].reduce((sum, item) => sum + item.holdingQty, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow mr-2 flex items-center text-sm">
          <span className="mr-2">🖨️</span> Print Report
        </button>
        <button onClick={() => window.history.back()} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded shadow flex items-center text-sm">
          <span className="mr-2">⬅️</span> Back
        </button>
      </div>
    </div>
  );
};

export default CylinderHoldingReport;
