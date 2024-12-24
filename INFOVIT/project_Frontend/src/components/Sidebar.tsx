import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  BookOpen,
  Clock,
  FileText,
  Users,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  const teacherLinks = [
    { to: '/dashboard', icon: BookOpen, text: 'Dashboard' },
    { to: '/syllabus', icon: BookOpen, text: 'Syllabus' },
    { to: '/classes', icon: Clock, text: 'Classes' },
    { to: '/documents', icon: FileText, text: 'Documents' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: BookOpen, text: 'Dashboard' },
    { to: '/teachers', icon: Users, text: 'Manage Teachers' },
  ];

  const links = user?.role === 'admin' ? adminLinks : teacherLinks;

  return (
    <div className="w-64 bg-gradient-to-br from-gray-800 to-gray-700 text-white min-h-screen shadow-lg">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-600">
        <h2 className="text-2xl font-bold text-white">Appraisal System</h2>
        <p className="text-sm text-gray-300 mt-1">{user?.name}</p>
      </div>

      {/* Navigation Links */}
      <nav className="mt-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-600 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5 mr-3" />
            {link.text}
          </NavLink>
        ))}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center px-6 py-3 mt-4 text-gray-300 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
}
