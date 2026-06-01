import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AttachmentModal = ({ isOpen, onClose, referenceType, referenceId }) => {
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && referenceId) {
      fetchAttachments();
    }
  }, [isOpen, referenceId]);

  const fetchAttachments = async () => {
    try {
      const response = await api.get(`/attachments/list/${referenceType}/${referenceId}`);
      setAttachments(response.data);
    } catch (error) {
      console.error("Error fetching attachments:", error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('referenceType', referenceType);
    formData.append('referenceId', referenceId);

    try {
      await api.post('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('File uploaded successfully!');
      fetchAttachments();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert('Failed to upload file.');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // reset file input
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      try {
        await api.delete(`/attachments/${id}`);
        fetchAttachments();
      } catch (error) {
        console.error("Error deleting attachment:", error);
        alert("Failed to delete attachment.");
      }
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await api.get(`/attachments/download/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col font-sans overflow-hidden">
        
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Attachments ({referenceType})</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Uploaded Files</h3>
            <div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className={`px-4 py-2 text-white font-bold rounded shadow-md transition-colors ${isUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isUploading ? 'Uploading...' : '+ Add New File'}
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#e2e8f0] sticky top-0">
                <tr>
                  <th className="py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">File Name</th>
                  <th className="py-2 px-3 font-semibold text-gray-700 border-b border-gray-200 text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attachments.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="py-4 text-center text-gray-500">No attachments found.</td>
                  </tr>
                ) : (
                  attachments.map(att => (
                    <tr key={att.id} className="hover:bg-blue-50 border-b border-gray-100">
                      <td className="py-2 px-3 font-medium text-blue-700 break-all">{att.fileName}</td>
                      <td className="py-2 px-3 flex justify-center gap-2">
                        <button onClick={() => handleDownload(att.id, att.fileName)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-300 hover:bg-blue-200" title="Download">
                          📥
                        </button>
                        <button onClick={() => handleDelete(att.id)} className="bg-red-100 text-red-700 px-2 py-1 rounded border border-red-300 hover:bg-red-200" title="Delete">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;
