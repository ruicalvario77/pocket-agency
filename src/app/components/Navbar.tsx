"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image'; // Added import for Image

export default function Navbar() {
  const [user, loading] = useAuthState(auth); // Keep loading and use it
  const [role, setRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [profilePic, setProfilePic] = useState('/default-avatar.svg');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

<<<<<<< HEAD
  // Fetch user data (role, fullName, profilePic) from Firestore
=======
  // Fetch user's role from Firestore when authenticated
>>>>>>> feature/portal-layouts
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole(data.role);
          setFullName(data.fullName || 'User');
          setProfilePic(data.profilePic || '/default-avatar.svg');
        }
      } else {
        setRole(null); // Clear role when logged out
      }
    };
    fetchUserData();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    setIsDropdownOpen(false); // Close dropdown on logout
    router.push('/');
  };

  // Set dashboard link based on role
  const dashboardLink = role ? `/${role}/dashboard` : '/';

  // Show loading state while auth is being checked
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
<<<<<<< HEAD
        {/* Left: Logo */}
        <Link href="/">
          <img src="/logo.svg" alt="Pocket Agency" className="h-10" />
        </Link>

        {/* Middle: Customer Navigation */}
        {role === 'customer' && (
=======
        <Link href="/">
          <Image src="/logo.svg" alt="Pocket Agency" width={40} height={40} />
        </Link>
        {/* Customer Navigation - Shown only for authenticated customers */}
        {user && role === 'customer' && (
>>>>>>> feature/portal-layouts
          <div className="flex space-x-6">
            <Link href="/customer/requests" className="hover:underline">
              Requests
            </Link>
            <Link href="/customer/brands" className="hover:underline">
              Brands
            </Link>
            <Link href="/customer/team" className="hover:underline">
              Team
            </Link>
          </div>
        )}
<<<<<<< HEAD

        {/* Right: Navigation Items */}
        <div className="flex items-center space-x-4">
          {user ? (
            role === 'customer' ? (
              <>
                {/* Upgrade Button */}
                <button className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
                  Upgrade
                </button>
                {/* Help Icon (Placeholder) */}
                <button className="text-white hover:text-gray-200">?</button>
                {/* Notifications Bell (Placeholder) */}
                <button className="text-white hover:text-gray-200">🔔</button>
                {/* Profile Section with Dropdown */}
                <div className="relative">
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>{fullName}</span>
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">▼</span>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <Link
                        href="/customer/settings"
                        className="block px-4 py-2 text-black hover:bg-gray-100"
                      >
                        Account Settings
                      </Link>
                      <Link
                        href="/customer/subscriptions"
                        className="block px-4 py-2 text-black hover:bg-gray-100"
                      >
                        Subscriptions
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Existing Navigation for Other Roles */
              <>
                <Link href={dashboardLink}>
                  <p className="mr-4 hover:underline">Dashboard</p>
                </Link>
                {role === 'admin' && (
                  <Link href="/admin/manage-users">
                    <p className="mr-4 hover:underline">Manage Users</p>
                  </Link>
                )}
                {role === 'superadmin' && (
                  <>
                    <Link href="/superadmin/manage-admins">
                      <p className="mr-4 hover:underline">Manage Admins</p>
                    </Link>
                    <Link href="/superadmin/analytics">
                      <p className="mr-4 hover:underline">Analytics</p>
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-white hover:underline"
                >
                  Logout
                </button>
              </>
            )
=======
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href={dashboardLink}>
                <p className="mr-4">Dashboard</p>
              </Link>
              <button onClick={handleLogout} className="text-white">
                Logout
              </button>
            </>
>>>>>>> feature/portal-layouts
          ) : (
            <Link href="/auth/login">
              <p className="hover:underline">Login</p>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}