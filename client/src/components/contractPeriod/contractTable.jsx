import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText } from "lucide-react";
// REMOVE THIS IMPORT: import { DialogTrigger } from "@/components/ui/dialog"; // KHÔNG CẦN NỮA!
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Thêm Tooltip

export default function ContractTable({
  contracts,
  isAllConfirmed,
  onSelectContract, // Vẫn nhận prop này
  handleCreateInvoice,
  currentPage,
  totalPages,
  totalElements,
  itemsPerPage,
  setCurrentPage,
}) {
  return (
    <TooltipProvider> {/* Bọc bằng TooltipProvider để dùng Tooltip */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID Hợp đồng</TableHead>
              <TableHead>Mã Khách hàng</TableHead>
              <TableHead>Tên Khách hàng</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Số lượng bản ghi</TableHead>
              <TableHead>Trạng thái xác nhận</TableHead>
              <TableHead className="w-[200px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  Không tìm thấy dữ liệu hợp đồng nào.
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell>{contract.customerCode}</TableCell>
                  <TableCell>{contract.customerName}</TableCell>
                  <TableCell>{contract.address}</TableCell>
                  <TableCell>{contract.recordCount}</TableCell>
                  <TableCell>
                    {isAllConfirmed(contract) ? (
                      <Badge className="bg-green-600">Đã xác nhận</Badge>
                    ) : (
                      <Badge variant="secondary">Chờ xác nhận</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {/* Thay vì DialogTrigger, chúng ta chỉ dùng Button và gọi onSelectContract */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectContract(contract)} // Gọi hàm từ ConfirmPage
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Xác nhận
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem và xác nhận chi tiết các bản ghi</TooltipContent>
                      </Tooltip>

                      {isAllConfirmed(contract) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateInvoice(contract.id)}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Tạo hóa đơn
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Tạo hóa đơn cho hợp đồng này</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Đảm bảo KHÔNG RENDER ContractPeriodDetailDialog ở đây! */}
      {/* Nó được render và quản lý ở ConfirmPage */}
    </TooltipProvider>
  );
}