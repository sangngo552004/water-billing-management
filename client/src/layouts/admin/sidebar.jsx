
import {Link, useLocation} from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { logout } from "../../redux/auth/authSlice";
import { useDispatch } from 'react-redux'; 
import {
  LayoutDashboard,
  Users,
  FileText,
  Building,
  Gauge,
  Receipt,
  MessageSquare,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Khách hàng",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Quản lý Hợp đồng",
    href: "/admin/contracts",
    icon: FileText,
  },
  {
    title: "Quản lý Cơ sở",
    href: "/admin/facilities",
    icon: Building,
  },
  {
    title: "Quản lý Đồng hồ nước",
    href: "/admin/water-meters",
    icon: Gauge,
  },
  {
    title: "Quản lý Hóa đơn",
    href: "/admin/invoices",
    icon: Receipt,
  },
   { 
    title: "Quản lý kỳ", 
    href: "/admin/periods", 
    icon: Calendar 
  },
  { 
    title: "Xác nhận & Tạo hóa đơn", 
    href: "/admin/confirm", 
    icon: CheckCircle 
  },
  {
    title: "Quản lý Yêu cầu",
    href: "/admin/requests",
    icon: MessageSquare,
  },
  {
    title: "Quản lý Nhân viên",
    href: "/admin/employees",
    icon: UserCheck,
  },
]


export default function Sidebar({ collapsed, onToggle }) {
  const location  = useLocation()
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div
      className={cn(
        "relative bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && <h2 className="text-lg font-semibold text-blue-600 ">Water Management</h2>}
        <Button variant="ghost" size="sm" onClick={onToggle} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname?.startsWith(item.href)
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "px-2",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700",
                  )}
                >
                  <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn("w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50", collapsed && "px-2")}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Đăng xuất"}
        </Button>
      </div>
    </div>
  )
}
