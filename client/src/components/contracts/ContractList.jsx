// src/components/contracts/ContractList.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye, Pause, X, Play } from "lucide-react";

export default function ContractList({
  contracts,
  totalContracts,
  currentPage,
  totalPages,
  onPageChange,
  onViewContract,
  onSuspendContract,
  onCancelContract,
  onActivateContract,
  getStatusBadge,
  isLoading,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Danh sách hợp đồng ({totalContracts}) - Trang {currentPage}/{totalPages}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Đang tải hợp đồng...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không tìm thấy hợp đồng nào.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mã khách hàng</TableHead>
                <TableHead>Tên khách hàng</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Loại hợp đồng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.id}</TableCell>
                  <TableCell className="font-medium">{contract.customerCode}</TableCell>
                  <TableCell>{contract.ownerName}</TableCell>
                  <TableCell>{contract.address}</TableCell>
                  <TableCell>{contract.contractType}</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>{contract.startDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => onViewContract(contract.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem chi tiết hợp đồng</TooltipContent>
                      </Tooltip>
                      {contract.status === "active" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSuspendContract(contract.id)}
                              className="text-yellow-600"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Tạm dừng hợp đồng</TooltipContent>
                        </Tooltip>
                      )}
                      {contract.status === "suspended" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onActivateContract(contract.id)}
                              className="text-green-600"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bật hoạt động lại</TooltipContent>
                        </Tooltip>
                      )}
                      {contract.status !== "cancelled" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onCancelContract(contract.id)}
                              className="text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Hủy hợp đồng</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}


        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) onPageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) onPageChange(currentPage + 1);
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
  );
}