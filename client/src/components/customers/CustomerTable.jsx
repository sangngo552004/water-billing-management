import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Edit, UserX, Eye, Trash2, UserCheck } from "lucide-react"

const ITEMS_PER_PAGE = 10; // This should ideally come from useCustomers hook or constants

export function CustomerTable({
  customers,
  totalCustomers,
  totalPages,
  currentPage,
  setCurrentPage,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Danh sách khách hàng ({totalCustomers}) - Trang {currentPage}/{totalPages}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>CMND/CCCD</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.ownerId} className={!customer.isActive ? "opacity-60" : ""}>
                <TableCell>{customer.ownerId}</TableCell>
                <TableCell className="font-medium">{customer.fullName}</TableCell>
                <TableCell>{customer.identityNumber}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phoneNumber}</TableCell>
                <TableCell>
                  <Badge variant={customer.isActive ? "default" : "secondary"}>
                    {customer.isActive ? "✅ Hoạt động" : "❌ Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Chỉnh sửa thông tin khách hàng</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => onView(customer)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xem chi tiết thông tin khách hàng</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleStatus(customer.ownerId)}
                          className={customer.isActive ? "text-orange-600" : "text-green-600"}
                        >
                          {customer.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {customer.isActive ? "Vô hiệu hóa tài khoản khách hàng" : "Kích hoạt tài khoản khách hàng"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(customer.ownerId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xóa khách hàng khỏi hệ thống</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}