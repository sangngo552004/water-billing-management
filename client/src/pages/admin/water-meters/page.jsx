import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner"; // Import Toaster as well

// Import the consolidated hook
import { useWaterMeters } from "@/hooks/useWaterMeters";

// Import components
import WaterMeterList from "@/components/water-meters/WaterMeterList";
import AddWaterMeterForm from "@/components/water-meters/AddWaterMeterForm";
import ViewWaterMeterDetails from "@/components/water-meters/ViewWaterMeterDetails";

export default function WaterMetersPage() {
  const navigate = useNavigate();

  // Sử dụng hook useWaterMeters
  const {
    waterMeters,
    totalWaterMeters,
    totalPages,
    currentPage,
    searchTerm,
    isActiveFilter,
    isLoadingList,
    errorList,
    setSearchTerm,
    setIsActiveFilter,
    setCurrentPage,
    addMeter,
    deleteMeter,
    fetchWaterMeters, // Exposd to manually trigger list refresh if needed

    selectedMeterId,
    meterDetails,
    meterContracts,
    isLoadingDetails,
    errorDetails,
    viewMeter,
    clearMeterView,
  } = useWaterMeters();

  // State cho các modals/dialogs (chỉ quản lý việc mở/đóng UI)
  const [isAddMeterOpen, setIsAddMeterOpen] = useState(false);
  const [isViewMeterOpen, setIsViewMeterOpen] = useState(false);
  const [deleteMeterConfirmId, setDeleteMeterConfirmId] = useState(null);

  // Hàm helper để trích xuất thông báo lỗi
  const getErrorMessage = (error) => {
    // Axios errors might have response.data.message
    return error.response?.data?.message || error.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
  };

  const handleAddMeterSave = async (newMeterData) => {
    try {
      await addMeter(newMeterData);
      toast.success("Thêm đồng hồ nước mới thành công!");
      setIsAddMeterOpen(false); // Đóng modal khi thành công
    } catch (error) {
      toast.error(getErrorMessage(error));
      // Giữ modal mở để người dùng có thể sửa lỗi hoặc thử lại
    }
  };

 

  const handleDeleteMeterConfirm = async (meterId) => {
    try {
      await deleteMeter(meterId);
      toast.success("Xóa đồng hồ nước thành công!");
      setDeleteMeterConfirmId(null); // Đóng dialog khi thành công
    } catch (error) {
      toast.error(getErrorMessage(error));
      // Giữ dialog mở
    }
  };

  const handleViewMeter = (meter) => {
    viewMeter(meter.waterMeterId); // Gọi hàm từ hook để set ID và trigger fetch details
    setIsViewMeterOpen(true);
  };

  const handleCloseViewMeter = () => {
    clearMeterView(); // Xóa selectedMeterId và details trong hook
    setIsViewMeterOpen(false); // Đóng modal UI
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">


        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đồng hồ nước</h1>
        </div>

        {/* Toolbar (Filter and Add Button) */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo số serial..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0); // Reset page on search
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={isActiveFilter === true ? "active" : isActiveFilter === false ? "inactive" : "all"}
                onValueChange={(value) => {
                  setIsActiveFilter(value === "active" ? true : value === "inactive" ? false : null);
                  setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
                }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setIsAddMeterOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm đồng hồ
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thêm đồng hồ nước mới vào hệ thống</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Water Meters Table */}
        <WaterMeterList
          waterMeters={waterMeters}
          totalMeters={totalWaterMeters}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onViewMeter={handleViewMeter} // Sử dụng hàm handleViewMeter
          onDeleteMeterConfirm={setDeleteMeterConfirmId}
          isLoading={isLoadingList}
        />

        {/* Add Water Meter Modal */}
        <Dialog open={isAddMeterOpen} onOpenChange={setIsAddMeterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm đồng hồ nước mới</DialogTitle>
            </DialogHeader>
            <AddWaterMeterForm onClose={() => setIsAddMeterOpen(false)} onSave={handleAddMeterSave} isLoading={isLoadingList} />
          </DialogContent>
        </Dialog>


        {/* View Water Meter Details Modal */}
        <Dialog open={isViewMeterOpen} onOpenChange={handleCloseViewMeter}> {/* Đóng modal bằng handleCloseViewMeter */}
          <DialogContent className="max-w-6xl"> {/* Tăng kích thước modal */}
            <DialogHeader>
              <DialogTitle>Chi tiết đồng hồ nước</DialogTitle>
            </DialogHeader>
            {isLoadingDetails ? (
              <p className="text-center text-gray-500">Đang tải chi tiết đồng hồ...</p>
            ) : errorDetails ? (
              <p className="text-center text-red-500">{errorDetails}</p>
            ) : (
              <ViewWaterMeterDetails
                meter={meterDetails} // Lấy chi tiết từ hook
                contracts={meterContracts} // Lấy hợp đồng từ hook
                onClose={handleCloseViewMeter}
                onViewContract={(contractId) => {
                  navigate(`/admin/contracts/${contractId}`); // Điều hướng đến trang chi tiết hợp đồng
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Meter Confirmation Dialog */}
        <AlertDialog open={!!deleteMeterConfirmId} onOpenChange={() => setDeleteMeterConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa đồng hồ nước</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa đồng hồ này? 
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoadingList}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMeterConfirmId && handleDeleteMeterConfirm(deleteMeterConfirmId)}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoadingList}
              >
                {isLoadingList ? "Đang xóa..." : "Xóa đồng hồ"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}