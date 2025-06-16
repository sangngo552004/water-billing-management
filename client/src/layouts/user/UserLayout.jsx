
import Header from "./HeaderUser";
import SideBar from "./SidebarUser";
import { Outlet } from "react-router-dom";



 const UserLayout = ()  => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <SideBar />
        <main className="flex-1 p-6">
            <Outlet />
        </main>
      </div>
    </div>
  )
}

export default UserLayout;