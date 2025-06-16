
import SideBar from "./sidebar"
import Header from "./header"
import { Outlet } from "react-router-dom"; 

const EmployeeLayout = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />

      {/* Main content */}
      <div className=" lg:pl-64">
        <Header />
        <main className="ml-6 mr-6  py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default EmployeeLayout;