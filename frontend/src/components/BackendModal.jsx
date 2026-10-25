import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiBaseUrl } from "../api/axios";

const BackendModal = ({ isOpen, onClose }) => {
  const [apiUrl, setApiUrl] = useState("");
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getApiBaseUrl());
      setTestStatus(null);
      setTestMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiUrl.trim()) {
      setTestStatus("error");
      setTestMessage("Please enter a backend URL.");
      return;
    }

    setTestStatus("testing");
    setTestMessage("Connecting to backend... (If Render free tier, wake up may take 30-60s)");

    try {
      const cleanUrl = apiUrl.trim().replace(/\/+$/, "");
      // Try pinging financial-years or customer-ledgers
      const res = await axios.get(`${cleanUrl}/financial-years`, {
        timeout: 60000,
        headers: { "X-Financial-Year": "2025-2026" }
      });

      if (res.status >= 200 && res.status < 300) {
        setTestStatus("success");
        setTestMessage("Backend connected successfully! Status: " + res.status);
      } else {
        setTestStatus("error");
        setTestMessage(`Received response with status: ${res.status}`);
      }
    } catch (err) {
      console.error("Test connection failed:", err);
      setTestStatus("error");
      if (err.code === "ERR_NETWORK" || !err.response) {
        const isMixedContent = window.location.protocol === "https:" && apiUrl.startsWith("http://");
        if (isMixedContent) {
          setTestMessage("Failed: Mixed Content Blocked! Your frontend is HTTPS, but your backend URL is HTTP. Please use 'https://' for your backend URL.");
        } else {
          setTestMessage("Connection failed: Backend unreachable. Please verify the URL, ensure your Render web service is live, and ensure it ends with '/api'.");
        }
      } else {
        setTestMessage(`Server returned error: ${err.response?.status || err.message}`);
      }
    }
  };

  const handleSave = () => {
    const cleanUrl = apiUrl.trim().replace(/\/+$/, "");
    if (!cleanUrl) {
      alert("Please provide a valid URL.");
      return;
    }
    localStorage.setItem("VITE_API_URL", cleanUrl);
    alert("Backend URL saved successfully! The app will now connect to: " + cleanUrl);
    onClose();
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem("VITE_API_URL");
    localStorage.removeItem("API_URL");
    const defaultUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    setApiUrl(defaultUrl);
    alert("Reset to default URL: " + defaultUrl);
    onClose();
    window.location.reload();
  };

  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const isHttpTarget = apiUrl.startsWith("http://") && !apiUrl.includes("localhost");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="font-bold text-base leading-tight">Backend Server Connection</h3>
              <p className="text-xs text-blue-200">Configure where the app sends API requests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-gray-700">
          {isHttps && apiUrl.includes("localhost") && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-amber-900 text-xs leading-relaxed">
              <strong>⚠️ Production Deployment Warning:</strong> This site is running live on HTTPS, but the API URL is pointing to <code>http://localhost:8080/api</code>.
              Because the browser cannot reach localhost, <strong>Add & Save buttons will fail</strong> until you set your deployed backend URL.
            </div>
          )}

          {isHttps && isHttpTarget && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-900 text-xs leading-relaxed">
              <strong>⚠️ Insecure Mixed Content:</strong> Live HTTPS websites block HTTP requests. Ensure your backend URL begins with <code>https://</code>.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Backend API Base URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. https://erp-backend-xxxx.onrender.com/api"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Must include <code>/api</code> at the end. For Render deployments: <code>https://erp-backend-xxxx.onrender.com/api</code>
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-start space-x-2 ${
                testStatus === "testing"
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : testStatus === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <span className="text-base leading-none">
                {testStatus === "testing" ? "⏳" : testStatus === "success" ? "✅" : "❌"}
              </span>
              <span className="flex-1 leading-relaxed">{testMessage}</span>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-800">💡 Important Deployment Tips:</p>
            <p>1. <strong>Render Free Tier Cold Starts:</strong> Render puts free backends to sleep after 15 min of inactivity. The first request takes ~50s to wake up.</p>
            <p>2. <strong>Permanent Fix:</strong> Add <code>VITE_API_URL</code> to your Vercel/Render Environment Variables so builds automatically use it.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === "testing"}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {testStatus === "testing" ? "Testing..." : "Test Connection"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-bold transition"
            >
              Reset to Default
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs font-bold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition shadow"
            >
              Save URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendModal;
