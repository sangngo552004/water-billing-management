import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Edit, Eye, Trash2 } from "lucide-react";


export default function WaterMeterList({
  waterMeters,
  totalWaterMeters,
  currentPage,
  totalPages,
  onPageChange,
  onViewMeter,
  onDeleteMeterConfirm,
  isLoading,
}) {
  const getStatusBadge = (isActive) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "✅ Hoạt động" : "❌ Không hoạt động"}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Danh sách đồng hồ nước ({totalWaterMeters}) - Trang {currentPage + 1}/{totalPages}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="ml-2 text-gray-600">Đang tải đồng hồ nước...</p>
          </div>
        ) : waterMeters.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Không tìm thấy đồng hồ nước nào.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Số Serial</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waterMeters.map((meter) => (
                <TableRow key={meter.waterMeterId} className={!meter.isActive ? "opacity-60" : ""}>
                  <TableCell>{meter.waterMeterId}</TableCell>
                  <TableCell className="font-medium">{meter.serialNumber}</TableCell>
                  <TableCell>{getStatusBadge(meter.isActive)}</TableCell>
                  <TableCell>
  {new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(meter.createdAt))}
</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => onViewMeter(meter)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem chi tiết đồng hồ</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteMeterConfirm(meter.waterMeterId)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xóa đồng hồ khỏi hệ thống</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination for meters */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 0) onPageChange(currentPage - 1);
                    }}
                    className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageToShow;
                  // Adjust calculation for 0-indexed currentPage and 1-indexed display
                  if (totalPages <= 5) {
                    pageToShow = i;
                  } else if (currentPage <= 2) { // Show 1-5
                    pageToShow = i;
                  } else if (currentPage >= totalPages - 3) { // Show last 5
                    pageToShow = totalPages - 5 + i;
                  } else { // Show current +/- 2
                    pageToShow = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(pageToShow);
                        }}
                        isActive={currentPage === pageToShow}
                      >
                        {pageToShow + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
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