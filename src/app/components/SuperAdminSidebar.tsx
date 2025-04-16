"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function SuperAdminSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCustomersOpen, setIsCustomersOpen] = useState(false);
  const [isContractorsOpen, setIsContractorsOpen] = useState(false);
  const [isAccountManagersOpen, setIsAccountManagersOpen] = useState(false);

  return (
    <div className={`bg-gray-900 text-white h-screen ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      <div className="p-4">
        <h2 className={`${isCollapsed ? 'hidden' : 'block'} text-lg font-bold mb-4`}>Super Admin</h2>
      </div>
      <ul className="space-y-2">
        <li>
          <Link href="/superadmin/dashboard" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">🏠</span>
            {!isCollapsed && <span>Overview</span>}
          </Link>
        </li>
        <li>
          <button
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">📊</span>
            {!isCollapsed && <span>Analytics</span>}
          </button>
          {isAnalyticsOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/superadmin/financial-dashboard" className="block p-2 hover:bg-gray-600">
                  Financial Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/marketing-dashboard" className="block p-2 hover:bg-gray-600">
                  Marketing Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/team-performance" className="block p-2 hover:bg-gray-600">
                  Team Performance Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/ai-insights" className="block p-2 hover:bg-gray-600">
                  AI Insights Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/additional-metrics" className="block p-2 hover:bg-gray-600">
                  Additional Metrics Dashboard
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            onClick={() => setIsCustomersOpen(!isCustomersOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">👥</span>
            {!isCollapsed && <span>Customers</span>}
          </button>
          {isCustomersOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/superadmin/customer-subscriptions" className="block p-2 hover:bg-gray-600">
                  Subscriptions Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/customer-tasks-performance" className="block p-2 hover:bg-gray-600">
                  Tasks & Performance Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/customer-satisfaction" className="block p-2 hover:bg-gray-600">
                  Satisfaction Survey Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/customer-messaging" className="block p-2 hover:bg-gray-600">
                  Messaging Oversight
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            onClick={() => setIsContractorsOpen(!isContractorsOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">🛠️</span>
            {!isCollapsed && <span>Contractors</span>}
          </button>
          {isContractorsOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/superadmin/contractor-applications" className="block p-2 hover:bg-gray-600">
                  Contractor Applications Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/contractor-schedules" className="block p-2 hover:bg-gray-600">
                  Contractor Schedules Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/contractor-work-approvals" className="block p-2 hover:bg-gray-600">
                  Contractor Work & Approvals Oversight
                </Link>
              </li>
              <li>
                <Link href="/superadmin/contractor-performance" className="block p-2 hover:bg-gray-600">
                  Performance Dashboard
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            onClick={() => setIsAccountManagersOpen(!isAccountManagersOpen)}
            className="flex items-center w-full p-4 hover:bg-gray-700"
          >
            <span className="mr-2">👩‍💼</span>
            {!isCollapsed && <span>Account Managers</span>}
          </button>
          {isAccountManagersOpen && !isCollapsed && (
            <ul className="ml-6 space-y-1">
              <li>
                <Link href="/superadmin/account-manager-management" className="block p-2 hover:bg-gray-600">
                  Account Manager Management Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/account-manager-performance" className="block p-2 hover:bg-gray-600">
                  Account Manager Performance
                </Link>
              </li>
              <li>
                <Link href="/superadmin/account-manager-roles" className="block p-2 hover:bg-gray-600">
                  Account Manager Roles
                </Link>
              </li>
              <li>
                <Link href="/superadmin/account-manager-training" className="block p-2 hover:bg-gray-600">
                  Account Manager Training Resources
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link href="/superadmin/billing" className="flex items-center p-4 hover:bg-gray-700">
            <span className="mr-2">💰</span>
            {!isCollapsed && <span>Billing</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}