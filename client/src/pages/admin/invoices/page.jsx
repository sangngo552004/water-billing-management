import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInvoices } from "@/hooks/useInvoices.jsx";
// Import component chi tiết hóa đơn đã tách
import { InvoiceDetailsModal } from "@/components/invoices/InvoiceDetailsModal";
// Import Badge cho trạng thái hóa đơn (nếu chưa có thì tạo)
import { Badge } from "@/components/ui/badge"; // Hoặc tạo InvoiceStatusBadge.jsx riêng nếu muốn

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const {
    invoices,
    billingPeriods,
    loading,
    error,
    pagination,
    filters,
    setPage,
    setFilter,
    cancelInvoice,
    getInvoiceDetail,
  } = useInvoices();

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case "unpaid":
        return <Badge className="bg-gray-100 text-gray-800">Chưa thanh toán</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>;
      case "cancelled":
        return <Badge className="bg-yellow-100 text-yellow-800">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleViewDetails = async (invoiceId) => {
    const detail = await getInvoiceDetail(invoiceId);
    if (detail) {
      setSelectedInvoice(detail);
      setIsViewModalOpen(true);
    }
  };

  const handleCancelInvoice = async (invoiceId) => {
    await cancelInvoice(invoiceId);
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
        </div>

        {/* Filters Section (remains in page.jsx) */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm mã KH"
                  className="pl-9 pr-3 py-2 border rounded-md w-full md:w-64"
                  value={filters.searchTerm}
                  onChange={(e) => setFilter("searchTerm", e.target.value)}
                />
              </div>
              <Select value={filters.status} onValueChange={(value) => setFilter("status", value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="overdue">Quá hạn</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.billingPeriodId || "all"} onValueChange={(value) => setFilter("billingPeriodId", value === "all" ? null : Number(value))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Kỳ hóa đơn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kỳ</SelectItem>
                  {billingPeriods.map((period) => (
                    <SelectItem key={period.id} value={Number(period.id)}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table Section (remains in page.jsx) */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách hóa đơn ({pagination.totalElements}) - Trang {pagination.page}/{pagination.totalPages}
              {loading && <span className="ml-2 text-gray-500 text-sm">Đang tải...</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 mb-4">Error: {error.message}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Mã KH</TableHead>
                  <TableHead>Kỳ</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Tiêu thụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.invoiceId} className={invoice.status === "OVERDUE" ? "bg-red-50" : ""}>
                      <TableCell>{invoice.invoiceId}</TableCell>
                      <TableCell className="font-medium">{invoice.customerCode}</TableCell>
                      <TableCell>{invoice.periodName}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(invoice.totalPrice)}</TableCell>
                      <TableCell>{invoice.totalUsage} m³</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(invoice.invoiceId)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết hóa đơn</TooltipContent>
                          </Tooltip>
                          {invoice.status === "unpaid" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <X className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận hủy hóa đơn</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn hủy hóa đơn #{invoice.invoiceId}? Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancelInvoice(invoice.invoiceId)}>
                                    Xác nhận hủy
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                      Không tìm thấy hóa đơn nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination (remains in page.jsx) */}
            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (pagination.page > 1) setPage(pagination.page - 1);
                        }}
                        className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNumber = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = pagination.page - 2 + i;
                      }
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNumber);
                            }}
                            isActive={pagination.page === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (pagination.page < pagination.totalPages) setPage(pagination.page + 1);
                        }}
                        className={pagination.page === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Details Modal Component */}
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedInvoice(null);
          }}
        />
      </div>
    </TooltipProvider>
  );
}