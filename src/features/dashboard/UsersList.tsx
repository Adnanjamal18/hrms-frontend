import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MoreHorizontal, Filter, ChevronDown, X, Briefcase, UserCheck } from 'lucide-react';

export const UsersList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  const [designationInput, setDesignationInput] = useState('');
  const [employmentTypeInput, setEmploymentTypeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      // NOTE: Adjust port/url based on your actual backend URL
      const res = await axios.get('http://localhost:5000/api/employees', { withCredentials: true });
      setEmployees(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAssign = async (employeeId: number) => {
    if (!designationInput || !employmentTypeInput) return alert("Please fill both fields!");
    setIsSubmitting(true);
    try {
      // 1. Create Designation
      const desRes = await axios.post('http://localhost:5000/api/designations', { post: designationInput }, { withCredentials: true });
      const designationId = desRes.data.id;

      // 2. Create Employment Type
      const empRes = await axios.post('http://localhost:5000/api/employment-types', { type: employmentTypeInput }, { withCredentials: true });
      const employmentTypeId = empRes.data.id;

      // 3. Update Employee
      await axios.put(`http://localhost:5000/api/employees/${employeeId}`, {
        designationId,
        employmentTypeId
      }, { withCredentials: true });

      setActiveMenuId(null);
      setDesignationInput('');
      setEmploymentTypeInput('');
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse p-8 text-slate-500 font-medium">Loading users...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your employees, designations, and roles.</p>
        </div>
        <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Filter size={16} className="text-slate-400" />
          <span>Filter</span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-visible min-h-[400px]">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Designation</th>
              <th className="px-6 py-4">Employment Type</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-inner">
                      {emp.user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{emp.user?.fullName || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500">{emp.user?.email || 'No Email'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {emp.designation ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      <Briefcase size={12} className="mr-1.5" />
                      {emp.designation.post}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs bg-slate-100 px-2.5 py-1 rounded-full">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {emp.employmentType ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <UserCheck size={12} className="mr-1.5" />
                      {emp.employmentType.type}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs bg-slate-100 px-2.5 py-1 rounded-full">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {/* Popover Form */}
                  {activeMenuId === emp.id && (
                    <div className="absolute right-12 top-10 w-72 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-5 z-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-slate-800">Assign Roles</h4>
                        <button onClick={() => setActiveMenuId(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Designation Name</label>
                          <input 
                            type="text" 
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="e.g. Senior Developer"
                            value={designationInput}
                            onChange={(e) => setDesignationInput(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Employment Type Name</label>
                          <input 
                            type="text" 
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="e.g. Full-Time"
                            value={employmentTypeInput}
                            onChange={(e) => setEmploymentTypeInput(e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button 
                            onClick={() => setActiveMenuId(null)}
                            disabled={isSubmitting}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleAssign(emp.id)}
                            disabled={isSubmitting}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors flex justify-center items-center"
                          >
                            {isSubmitting ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            
            {employees.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
