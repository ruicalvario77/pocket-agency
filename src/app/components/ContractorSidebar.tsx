"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ContractorSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const [user] = useAuthState(auth);
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("/default-avatar.svg");
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "Contractor");
          setProfilePic(data.profilePic || "/default-avatar.svg");
        }
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <div className={`bg-gray-900 text-white h-screen ${isCollapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      {/* Profile Section */}
      <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "space-x-2"}`}>
        <Image src={profilePic} alt="Profile" width={40} height={40} className="rounded-full" />
        {!isCollapsed && <span>{fullName}</span>}
      </div>

      {/* Menu Items */}
      <ul className="space-y-2">
        <li>
          <Link href="/contractor/dashboard" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">🏠</span>
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <button
            onClick={() => setIsTasksOpen(!isTasksOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">📋</span>
            {!isCollapsed && <span>Tasks</span>}
          </button>
          {isTasksOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/contractor/tasks/assigned" className="block p-2 hover:bg-gray-600">
                  Assigned Tasks
                </Link>
              </li>
              <li>
                <Link href="/contractor/tasks/submit" className="block p-2 hover:bg-gray-600">
                  Submit Work
                </Link>
              </li>
              <li>
                <Link href="/contractor/tasks/revisions" className="block p-2 hover:bg-gray-600">
                  Revision History
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link href="/contractor/messages" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">💬</span>
            {!isCollapsed && <span>Messages</span>}
          </Link>
        </li>
        <li>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">👤</span>
            {!isCollapsed && <span>Profile</span>}
          </button>
          {isProfileOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/contractor/profile/skills" className="block p-2 hover:bg-gray-600">
                  Skill Profile
                </Link>
              </li>
              <li>
                <Link href="/contractor/profile/availability" className="block p-2 hover:bg-gray-600">
                  Availability
                </Link>
              </li>
              <li>
                <Link href="/contractor/profile/settings" className="block p-2 hover:bg-gray-600">
                  Settings
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            onClick={() => setIsSupportOpen(!isSupportOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">🆘</span>
            {!isCollapsed && <span>Support</span>}
          </button>
          {isSupportOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/contractor/support/help" className="block p-2 hover:bg-gray-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contractor/support/report" className="block p-2 hover:bg-gray-600">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link href="/contractor/support/escalations" className="block p-2 hover:bg-gray-600">
                  Escalation Status
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}