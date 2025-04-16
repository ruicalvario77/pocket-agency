"use client";
import { useState } from "react";
import TopBar from "@/app/components/TopBar";
import ContractorSidebar from "@/app/components/ContractorSidebar";
import { usePathname } from "next/navigation";

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter((segment) => segment);
    const breadcrumbs = [];
    let currentPath = "";
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      breadcrumbs.push({ label, path: currentPath });
    }
    return breadcrumbs;
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex">
      <ContractorSidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex-1">
        <TopBar breadcrumbs={getBreadcrumbs()} onToggleSidebar={toggleSidebar} />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}