import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ItemGroupMaster = () => {
  const [itemGroups, setItemGroups] = useState([]);
  const [newName, setNewName] = useState('');

  const fetchItemGroups = async () => {
    try {
      const response = await api.get('/item-groups');
      setItemGroups(response.data);
    } catch (error) {
      console.error("Error fetching item groups:", error);
    }
  };

  useEffect(() => {
    fetchItemGroups();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
      await api.post('/item-groups', { name: newName });
      setNewName('');
      fetchItemGroups();
      alert("Item Group added successfully!");
    } catch (error) {
      console.error("Error adding item group:", error);
      alert("Error adding item group");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Item Group?")) {
      try {
        await api.delete(`/item-groups/${id}`);
        fetchItemGroups();
      } catch (error) {
        console.error("Error deleting item group:", error);
        alert("Error deleting item group");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 flex-grow">
      <div className="max-w-2xl mx-auto bg-white rounded-md shadow-sm border border-gray-200">
        <div className="bg-[#242b63] p-3 rounded-t-md">
          <h2 className="text-white font-semibold text-sm">Item Group Master</h2>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value.toUpperCase())}
              placeholder="Enter Item Group Name"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 uppercase"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              Save
            </button>
          </form>

          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#e2e8f0]">
                <tr>
                  <th className="py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">ID</th>
                  <th className="py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Item Group Name</th>
                  <th className="py-2 px-3 font-semibold text-gray-700 border-b border-gray-200 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {itemGroups.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-500">No Item Groups found. Add one above.</td>
                  </tr>
                ) : (
                  itemGroups.map((group, index) => (
                    <tr key={group.id} className="hover:bg-blue-50 border-b border-gray-100">
                      <td className="py-2 px-3">{index + 1}</td>
                      <td className="py-2 px-3 uppercase">{group.name}</td>
                      <td className="py-2 px-3 text-center">
                        <button 
                          onClick={() => handleDelete(group.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

export default ItemGroupMaster;
