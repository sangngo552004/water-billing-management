import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Chỉ dùng cho modal xác nhận thu tiền
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Search, Eye } from "lucide-react";

import { useCollectInvoices } from "@/hooks/useCollectInvoices";


export default function CollectInvoicesPage() {
  const [showCollectConfirmDialog, setShowCollectConfirmDialog] = useState(false);
  const [invoiceToCollect, setInvoiceToCollect] = useState(null);


  const {
    invoices,
    loading,
    error,
    pagination,
    filters,
    setPage,
    setFilter,
    collectInvoice,
  } = useCollectInvoices();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

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
  const handleOpenCollectConfirm = (invoice) => {
    setInvoiceToCollect(invoice);
    setShowCollectConfirmDialog(true);
  };

  const handleCollectPayment = async () => {
    if (invoiceToCollect) {
      try {
        await collectInvoice(invoiceToCollect.invoiceId);
        setInvoiceToCollect(null);
        setShowCollectConfirmDialog(false);
      } catch (err) {
        console.error("Collection failed in component:", err);
      }
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoiceForDetails(invoice);
    setIsDetailsModalOpen(true);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (pagination.totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = pagination.totalPages;
    } else {
      if (pagination.currentPage <= Math.ceil(maxPagesToShow / 2)) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (pagination.currentPage + Math.floor(maxPagesToShow / 2) >= pagination.totalPages) {
        startPage = pagination.totalPages - maxPagesToShow + 1;
        endPage = pagination.totalPages;
      } else {
        startPage = pagination.currentPage - Math.floor(maxPagesToShow / 2);
        endPage = pagination.currentPage + Math.floor(maxPagesToShow / 2);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(i);
            }}
            isActive={pagination.currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return pages;
  };


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thu tiền</h1>
        <p className="text-gray-600">Danh sách hóa đơn cần thu tiền</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn cần thu ({pagination.totalItems})</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên chủ sở hữu..."
                  value={filters.searchTerm}
                  onChange={(e) => {
                    setFilter("searchTerm", e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent> {/* <-- Mở thẻ CardContent ở đây */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải hóa đơn...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Lỗi: {error.message}</div>
          ) : (
            <>
              {invoices.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã HĐ</TableHead>
                        <TableHead>Mã KH</TableHead>
                        <TableHead>Tên chủ sở hữu</TableHead>
                        <TableHead>Kỳ hóa đơn</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Tiêu thụ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.invoiceId} className={invoice.status === "overdue" ? "bg-red-50" : ""}>
                          <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                          <TableCell>{invoice.customerCode}</TableCell>
                          <TableCell>{invoice.ownerName || "N/A"}</TableCell>
                          <TableCell>{invoice.periodName}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(invoice.totalPrice)}đ
                          </TableCell>
                          <TableCell>{invoice.totalUsage} m³</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenCollectConfirm(invoice)}
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Thu tiền
                                </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Phân trang */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (pagination.currentPage > 1) setPage(pagination.currentPage - 1);
                              }}
                              className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          {renderPageNumbers()}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (pagination.currentPage < pagination.totalPages) setPage(pagination.currentPage + 1);
                              }}
                              className={pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {filters.searchTerm
                    ? "Không tìm thấy hóa đơn nào phù hợp với tìm kiếm."
                    : "Không có hóa đơn nào cần thu tiền."}
                </div>
              )}
            </>
          )}
        </CardContent> {/* <-- Đóng thẻ CardContent ở đây */}
      </Card>

      {/* Modal Xác nhận thu tiền */}
      <Dialog open={showCollectConfirmDialog} onOpenChange={setShowCollectConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thu tiền</DialogTitle>
          </DialogHeader>
          {invoiceToCollect && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã HĐ:</Label>
                  <p className="font-medium">{invoiceToCollect.invoiceId}</p>
                </div>
                <div>
                  <Label>Mã KH:</Label>
                  <p className="font-medium">{invoiceToCollect.customerCode}</p>
                </div>
                <div className="col-span-2">
                  <Label>Tên chủ sở hữu:</Label>
                  <p className="font-medium">{invoiceToCollect.ownerName || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <Label>Số tiền:</Label>
                  <p className="font-bold text-green-600 text-2xl">
                    {formatCurrency(invoiceToCollect.totalPrice)}đ
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={handleCollectPayment}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Xác nhận thu"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCollectConfirmDialog(false);
                    setInvoiceToCollect(null);
                  }}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}