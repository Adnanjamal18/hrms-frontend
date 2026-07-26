import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus } from 'lucide-react';

export const LeaveManagement = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLeaveType, setNewLeaveType] = useState('');

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leave-types', { withCredentials: true });
      setLeaveTypes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleCreateLeaveType = async () => {
    if (!newLeaveType) return;
    try {
      await axios.post('http://localhost:5000/api/leave-types', { type: newLeaveType }, { withCredentials: true });
      setNewLeaveType('');
      fetchLeaveTypes();
    } catch (error) {
      console.error(error);
      alert("Failed to create leave type");
    }
  };

  if (loading) return <div className="animate-pulse p-8 text-slate-500 font-medium">Loading leave types...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Calendar size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Leave Management</h2>
          <p className="text-sm text-slate-500">Create and manage leave types for employees.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
        <h3 className="font-semibold text-slate-700 mb-4">Create New Leave Type</h3>
        <div className="flex space-x-3">
          <input 
            type="text" 
            className="flex-1 text-sm border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="e.g. Sick Leave, Casual Leave"
            value={newLeaveType}
            onChange={(e) => setNewLeaveType(e.target.value)}
          />
          <button 
            onClick={handleCreateLeaveType}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-700 mb-4">Existing Leave Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaveTypes.map((lt: any) => (
            <div key={lt.id} className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between group hover:border-indigo-300 transition-colors">
              <span className="font-medium text-slate-700">{lt.type}</span>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                Active
              </span>
            </div>
          ))}
          {leaveTypes.length === 0 && (
            <div className="col-span-full text-slate-400 italic text-sm">No leave types created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
