import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { useContracts } from "@/hooks/useContractPeriods";
import ContractTable from "@/components/contractPeriod/ContractTable";
// 1. Import Dialog chi tiết hợp đồng
import ContractPeriodDetailDialog from "@/components/contractPeriod/ContractPeriodDetails"; 

export default function ConfirmPage() {
  const {
    contracts,
    loading,
    error,
    searchOwnerName,
    setSearchOwnerName,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    itemsPerPage,
    handleConfirmRecord, // Hàm này dùng để xác nhận bản ghi con (trong dialog)
    handleCreateInvoice, // Hàm này dùng để tạo hóa đơn
    isAllConfirmed,      // Hàm này kiểm tra tất cả bản ghi đã xác nhận chưa
  } = useContracts();

  const [localSearchTerm, setLocalSearchTerm] = useState(searchOwnerName);

  // 2. Thêm state để quản lý Dialog chi tiết hợp đồng
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null); // Để lưu hợp đồng được chọn

  // 3. Hàm xử lý khi nhấn nút "Xác nhận" ở mỗi dòng
  const handleOpenDetailDialog = (contractToSelect) => {
    setSelectedContract(contractToSelect); // Lưu hợp đồng mà người dùng muốn xem chi tiết
    setIsDetailDialogOpen(true);        // Mở Dialog
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchOwnerName(localSearchTerm);
      setCurrentPage(1); // Đặt lại về trang đầu tiên (1-indexed) khi tìm kiếm thay đổi
    }, 500); // Debounce input tìm kiếm

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, setSearchOwnerName, setCurrentPage]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Kỳ hiện tại: {totalElements > 0 && contracts[0]?.periodName}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Xác nhận và tạo hóa đơn</h1>
        <p className="text-gray-600">Xác nhận các bản ghi chỉ số nước và tạo hóa đơn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hợp đồng cần xác nhận ({totalElements})</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên khách hàng hoặc mã hợp đồng..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Lỗi: {error}</div>
          ) : (
            <>
              {contracts.length > 0 ? (
                <ContractTable
                  contracts={contracts}
                  isAllConfirmed={isAllConfirmed}
                  // Truyền hàm mới này xuống ContractTable (và ContractRow)
                  onSelectContract={handleOpenDetailDialog} 
                  handleConfirmRecord={handleConfirmRecord} // Truyền xuống để dùng trong Dialog chi tiết
                  handleCreateInvoice={handleCreateInvoice} // Truyền xuống để dùng trong Dialog chi tiết
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  itemsPerPage={itemsPerPage}
                  setCurrentPage={setCurrentPage}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {localSearchTerm
                    ? "Không tìm thấy hợp đồng nào phù hợp."
                    : "Hiện chưa có kỳ nào đang mở để xác nhận."}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 4. Render Dialog chi tiết hợp đồng ngay tại đây */}
      {selectedContract && ( // Chỉ render dialog khi có hợp đồng được chọn
        <ContractPeriodDetailDialog
          isOpen={isDetailDialogOpen}       // Truyền trạng thái mở/đóng
          onOpenChange={setIsDetailDialogOpen} // Truyền setter để dialog tự đóng khi cần
          contract={selectedContract}       // Truyền dữ liệu hợp đồng
          handleConfirmRecord={handleConfirmRecord} // Truyền hàm xác nhận bản ghi (cho các nút trong dialog)
          handleCreateInvoice={handleCreateInvoice} // Truyền hàm tạo hóa đơn (cho nút trong dialog)
          isAllConfirmed={isAllConfirmed}       // Truyền hàm kiểm tra xác nhận
        />
      )}
    </div>
  );
}