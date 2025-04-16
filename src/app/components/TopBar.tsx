"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function TopBar({ breadcrumbs, onToggleSidebar }: { breadcrumbs: { label: string, path: string }[], onToggleSidebar: () => void }) {
  const [darkMode, setDarkMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* Breadcrumbs (left-aligned, clickable) */}
      <div className="flex-1">
        <div className="text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && ' / '}
              <Link href={crumb.path} className="hover:underline">
                {crumb.label}
              </Link>
            </span>
          ))}
        </div>
      </div>

      {/* Right-side elements */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search Admins, Contractors, Customers, Tasks..."
          className="px-3 py-1 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={toggleDarkMode}>
          {darkMode ? '🌙' : '☀️'}
        </button>
        <div className="relative">
          <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
            🔔
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
              <div className="px-4 py-2 text-black">
                <p>No new notifications</p>
              </div>
            </div>
          )}
        </div>
        <button onClick={onToggleSidebar} className="text-white">
          ≡
        </button>
      </div>
    </div>
  );
}