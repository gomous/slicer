import React from 'react';
import { Home, Clock, Globe, FlaskConical, Book, LogIn } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: <Home className="h-5 w-5 mr-3" />, active: true },
  { label: 'Recently opened', icon: <Clock className="h-5 w-5 mr-3" /> },
  { label: 'Online Models', icon: <Globe className="h-5 w-5 mr-3" />, badge: 'New' },
  { label: 'Makerlab', icon: <FlaskConical className="h-5 w-5 mr-3" />, badge: 'New' },
  { label: 'User Manual', icon: <Book className="h-5 w-5 mr-3" /> },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Login/Register */}
      <div className="flex items-center px-8 py-6 border-b border-gray-200">
        <LogIn className="h-6 w-6 text-green-600 mr-3" />
        <span className="font-semibold text-green-700 text-lg">Login/Register</span>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 bg-white">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer mb-1 transition-colors ${item.active ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5 font-medium">{item.badge}</span>
            )}
          </div>
        ))}
      </nav>
      {/* Logo/App Name */}
      <div className="px-8 py-6 border-t border-gray-200 flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">3D Slicer</h1>
          <p className="text-sm text-gray-500">Professional slicing tool</p>
        </div>
      </div>
    </div>
  );
};