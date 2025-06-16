import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Edit, DollarSign, LogOut } from "lucide-react"
import {Link, useLocation} from "react-router-dom"
import { logout } from "../../redux/auth/authSlice";
import { useDispatch } from 'react-redux'; 
 
const navigation = [,
  { name: "Ghi chỉ số nước", href: "/employee/record", icon: Edit },
  { name: "Thu tiền", href: "/employee/collect", icon: DollarSign },
]

export default function SideBar() {
        const dispatch = useDispatch();
        const location  = useLocation();

        const handleLogout = () => {
            dispatch(logout());
            console.log("Đăng xuất thành công");
         };
        return (
                <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                        <div className="flex flex-col flex-grow bg-white border-r border-green-200">
                          <div className="flex h-16 items-center px-4 bg-green-600">
                            <h1 className="text-lg font-semibold text-white">Nhân viên</h1>
                          </div>
                          <nav className="flex-1 space-y-1 px-2 py-4">
                            {navigation.map((item) => {
                              const Icon = item.icon
                              return (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  className={cn(
                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                    location.pathname === item.href
                                      ? "bg-green-100 text-green-900"
                                      : "text-gray-600 hover:bg-green-50 hover:text-green-900",
                                  )}
                                >
                                  <Icon className="mr-3 h-5 w-5" />
                                  {item.name}
                                </Link>
                              )
                            })}
                          </nav>
                          <div className="p-4">
                            <Button
                              variant="outline"
                              className="w-full border-green-200 text-green-700 hover:bg-green-50"
                              onClick={handleLogout}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Đăng xuất
                            </Button>
                          </div>
                        </div>
                      </div>
        )
}