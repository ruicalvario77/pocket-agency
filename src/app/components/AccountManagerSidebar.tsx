"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function AccountManagerSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const [user] = useAuthState(auth);
  const [fullName, setFullName] = useState('');
  const [profilePic, setProfilePic] = useState('/default-avatar.svg');
  const [isTaskAssignmentsOpen, setIsTaskAssignmentsOpen] = useState(false);
  const [isTaskManagementOpen, setIsTaskManagementOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || 'Account Manager');
          setProfilePic(data.profilePic || '/default-avatar.svg');
        }
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <div className={`bg-gray-900 text-white h-screen ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Profile Section */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
        <Image
          src={profilePic}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
        {!isCollapsed && <span>{fullName}</span>}
      </div>

      {/* Menu Items */}
      <ul className="space-y-2">
        <li>
          <Link href="/admin/dashboard" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">🏠</span>
            {!isCollapsed && <span>Overview</span>}
          </Link>
        </li>
        <li>
          <button
            onClick={() => setIsTaskAssignmentsOpen(!isTaskAssignmentsOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">📋</span>
            {!isCollapsed && <span>Task Assignments & Coordination</span>}
          </button>
          {isTaskAssignmentsOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/admin/contractor-assignment" className="block p-2 hover:bg-gray-600">
                  Contractor Assignment
                </Link>
              </li>
              <li>
                <Link href="/admin/ai-recommendations" className="block p-2 hover:bg-gray-600">
                  AI Recommendations
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            onClick={() => setIsTaskManagementOpen(!isTaskManagementOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">🔄</span>
            {!isCollapsed && <span>Task Management & Workflow</span>}
          </button>
          {isTaskManagementOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/admin/tracking-progress" className="block p-2 hover:bg-gray-600">
                  Tracking Progress
                </Link>
              </li>
              <li>
                <Link href="/admin/reviewing-work" className="block p-2 hover:bg-gray-600">
                  Reviewing Work
                </Link>
              </li>
              <li>
                <Link href="/admin/customer-revisions" className="block p-2 hover:bg-gray-600">
                  Customer Revisions
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link href="/admin/messages" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">💬</span>
            {!isCollapsed && <span>Messages</span>}
          </Link>
        </li>
        <li>
          <Link href="/admin/notifications" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">🔔</span>
            {!isCollapsed && <span>Notifications</span>}
          </Link>
        </li>
        <li>
          <Link href="/admin/settings" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">⚙️</span>
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}