import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Plus } from "lucide-react"

export function CustomerFilter({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAddCustomerClick }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên khách hàng."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onAddCustomerClick}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm khách hàng
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thêm khách hàng mới vào hệ thống</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}