import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  DropletIcon,
  UserIcon,
  CalendarIcon,
  MessageSquareIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
} from "lucide-react";
import { logout } from "../../redux/auth/authSlice";
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const contracts = useSelector(state => state.contracts.contracts);
  const [isOpen, setIsOpen] = useState(false);
  const contractId = location.pathname.split('/')[1] || '';

  const pathname = location.pathname;

  const handleLogout = () => {
    dispatch(logout());
  };

  const sidebarItems = [
    {
      title: "Tổng quan",
      href: `/${contractId}/`,
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      title: "Quản lý hóa đơn",
      href: `/${contractId}/bills`,
      icon: <FileTextIcon className="h-5 w-5" />,
    },
    {
      title: "Quản lý đồng hồ nước",
      href: `/${contractId}/meters`,
      icon: <DropletIcon className="h-5 w-5" />,
    },
    {
      title: "Thông tin",
      href: `/${contractId}/profile`,
      icon: <UserIcon className="h-5 w-5" />,
    },
    {
      title: "Gửi yêu cầu",
      href: `/${contractId}/requests`,
      icon: <MessageSquareIcon className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-3 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <LogOutIcon className="h-5 w-5" />
                <span className="ml-3">Đăng xuất</span>
              </button>
            </nav>
          </div>
        </ScrollArea>
      </aside>

      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}