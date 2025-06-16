import { useState } from "react"; // Giữ lại useState nếu bạn cần dùng local state
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { Search, CheckCircle, X, Eye } from "lucide-react";
import { useRequests } from "@/hooks/useRequests"; // Import the custom hook
import { ViewRequestDetails } from "@/components/requests/ViewRequestDetails"; // Import child components
import { Spinner } from "@/components/ui/spinner"; // Assuming you have this
import { Toaster } from "sonner"; // Make sure Toaster is in your App.jsx or root layout

export default function RequestsPage() {
  const {
    requests,
    totalRequests,
    loading,
    error,
    searchTerm,
    statusFilter,
    typeFilter,
    currentPage,
    totalPages,
    selectedRequest,
    loadingDetails, // <-- Thêm loadingDetails
    detailsError,
    isViewDetailsDialogOpen,
    confirmApproveId,
    confirmRejectId,
    handleSearchChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handlePageChange,
    handleApproveRequest,
    handleRejectRequest,
    openViewDetailsDialog,
    closeViewDetailsDialog,
    openApproveConfirm,
    closeApproveConfirm,
    openRejectConfirm,
    closeRejectConfirm,
    getRequestTypes,
    fetchRequests // Make sure this is pulled from hook to allow retry
  } = useRequests();

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Đang chờ</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Đã phê duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
const getType = (type) => {
    switch (type) {
      case 'ChangeInfo':
        return 'Thay đổi thông tin';
      case 'StopService':
        return 'Dừng dịch vụ';
      default:
        return type;
    }
  };
  const requestToApprove = requests.find((req) => req.requestId === confirmApproveId);
  const requestToReject = requests.find((req) => req.requestId === confirmRejectId);

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Yêu cầu</h1>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên khách hàng, mã, địa chỉ, loại yêu cầu..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Loại yêu cầu" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="ChangeInfo">Thay đổi thông tin</SelectItem>
                  <SelectItem value="StopService">Dừng dịch vụ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="approved">Đã phê duyệt</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách yêu cầu ({totalRequests}) - Trang {currentPage}/{totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Spinner size="lg" />
                <p className="ml-2">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>Đã xảy ra lỗi khi tải dữ liệu: {error.message}</p>
                <Button onClick={fetchRequests} className="mt-4">Thử lại</Button>
              </div>
            ) : requests.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không tìm thấy yêu cầu nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Mã KH</TableHead>
                    <TableHead>Loại yêu cầu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian tạo</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.requestId}>
                      <TableCell className="font-semibold">{request.requestId}</TableCell>
                      <TableCell>{request.ownerFullName}</TableCell>
                      <TableCell>{request.customerCode}</TableCell>
                      <TableCell>{getType(request.requestType)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell> {new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(request.createdAt))}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openViewDetailsDialog(request)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết yêu cầu</TooltipContent>
                          </Tooltip>
                          {request.status === "pending" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => openApproveConfirm(request.requestId)} className="text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Phê duyệt yêu cầu</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => openRejectConfirm(request.requestId)} className="text-red-600">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Từ chối yêu cầu</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
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

         {/* View Details Dialog */}
        <Dialog open={isViewDetailsDialogOpen} onOpenChange={closeViewDetailsDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Chi tiết yêu cầu</DialogTitle>
            </DialogHeader>
            {loadingDetails ? (
              <div className="flex justify-center items-center h-48">
                <Spinner size="lg" />
                <p className="ml-2">Đang tải chi tiết yêu cầu...</p>
              </div>
            ) : detailsError ? (
              <div className="text-center text-red-500 py-8">
                <p>Đã xảy ra lỗi khi tải chi tiết: {detailsError.message}</p>
                <Button onClick={() => openViewDetailsDialog({ requestId: selectedRequest?.requestId })} className="mt-4">Thử lại</Button>
              </div>
            ) : (
              <ViewRequestDetails request={selectedRequest} onClose={closeViewDetailsDialog} />
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <AlertDialog open={!!confirmApproveId} onOpenChange={closeApproveConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận phê duyệt yêu cầu</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn phê duyệt yêu cầu của khách hàng "
                {requestToApprove?.ownerFullName}" (ID: {requestToApprove?.requestId}) không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmApproveId && handleApproveRequest(confirmApproveId)}
                className="bg-green-600 hover:bg-green-700"
              >
                Phê duyệt
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={!!confirmRejectId} onOpenChange={closeRejectConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận từ chối yêu cầu</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn từ chối yêu cầu của khách hàng "
                {requestToReject?.ownerFullName}" (ID: {requestToReject?.requestId}) không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmRejectId && handleRejectRequest(confirmRejectId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Từ chối
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}