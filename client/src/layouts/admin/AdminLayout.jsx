
import { Outlet } from "react-router-dom";
import  Sidebar  from "./sidebar";
import  Header  from "./header";
import { useState } from "react";


const  AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout;