import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, FileText, Settings, Calendar, Bell, Search, Menu } from 'lucide-react';

export const DashboardLayout = () => {
  const location = useLocation();

  const navItems = [
    { icon: <Users size={20} />, label: "Employees", path: "/dashboard" },
    { icon: <Calendar size={20} />, label: "Leave Management", path: "/dashboard/leave" },
    { icon: <FileText size={20} />, label: "Reports", path: "/dashboard/reports" },
    { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center text-slate-800">
            <h1 className="text-xl font-semibold tracking-tight">Dashboard Overview</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
              <Search size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-inner flex items-center justify-center text-white font-medium text-sm">
              AD
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-8 flex-1 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 bg-white border-l border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.03)] flex flex-col z-20">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">HRMS Admin</h2>
          <Menu className="text-slate-400" size={24} />
        </div>
        <nav className="flex-1 p-4 space-y-1.5 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path 
                  ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className={`${location.pathname === item.path ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} transition-colors`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Dummy quick action at bottom */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
            <h3 className="font-semibold text-lg mb-1">Need Help?</h3>
            <p className="text-indigo-100 text-sm mb-4">Contact our support team for any issues.</p>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-white text-sm font-medium py-2 px-4 rounded-lg w-full">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
