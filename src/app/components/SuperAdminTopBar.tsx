"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link'; // Import Link for clickable breadcrumbs

export default function SuperAdminTopBar({ breadcrumbs, onToggleSidebar }: { breadcrumbs: { label: string, path: string }[], onToggleSidebar: () => void }) {
  const [user] = useAuthState(auth);
  const [fullName, setFullName] = useState('');
  const [profilePic, setProfilePic] = useState('/default-avatar.svg');
  const [darkMode, setDarkMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || 'Super Admin');
          setProfilePic(data.profilePic || '/default-avatar.svg');
        }
      }
    };
    fetchUserData();
  }, [user]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* Left: Profile Pic and Name */}
      <div className="flex items-center space-x-3">
        <Image
          src={profilePic}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span>{fullName}</span>
      </div>

      {/* Middle: Breadcrumbs (aligned left, clickable) */}
      <div className="flex-1 ml-4">
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

      {/* Right: Search, Dark Mode Toggle, Notifications */}
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