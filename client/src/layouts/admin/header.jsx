
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function Header({ onToggleSidebar }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Hệ thống quản lý nước</h1>
        </div>
      </div>
    </header>
  )
}
