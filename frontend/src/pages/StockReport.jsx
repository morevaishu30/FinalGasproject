import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const StockReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/stock');
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching stock report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e0e0e0] min-h-screen font-sans text-[11px] p-4 flex flex-col font-semibold">
      <div className="bg-white border border-gray-400 p-4 shadow-sm mb-4">
        <h2 className="text-[#000080] font-bold text-lg uppercase flex items-center mb-2">
          <span className="mr-2">📊</span> Stock Report
        </h2>
        <p className="text-gray-600 text-sm font-normal">
          Shows current stock balance by aggregating material inwards/outwards (FTM, GDA, ECR, ETM).
        </p>
      </div>

      <div className="flex-grow bg-white border border-gray-400 overflow-auto shadow-inner">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading Report...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#f0f0f0] border-b border-gray-400 sticky top-0 shadow-sm">
              <tr>
                <th className="border-r border-gray-400 px-4 py-2 font-bold">Item Description</th>
                <th className="border-r border-gray-400 px-4 py-2 font-bold text-right text-blue-800">Fill Stock</th>
                <th className="border-r border-gray-400 px-4 py-2 font-bold text-right text-red-800">Empty Stock</th>
                <th className="px-4 py-2 font-bold text-right text-green-800">Total Stock</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-400">No data found.</td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className={`${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-yellow-100 h-8 border-b border-gray-200`}>
                    <td className="border-r border-gray-300 px-4 font-bold">{row.itemDescription}</td>
                    <td className={`border-r border-gray-300 px-4 text-right font-bold ${row.fillStock < 0 ? 'text-red-500' : 'text-blue-800'}`}>{row.fillStock}</td>
                    <td className={`border-r border-gray-300 px-4 text-right font-bold ${row.emptyStock < 0 ? 'text-red-500' : 'text-red-800'}`}>{row.emptyStock}</td>
                    <td className={`px-4 text-right font-bold ${row.totalStock < 0 ? 'text-red-500' : 'text-green-800'}`}>{row.totalStock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default StockReport;
