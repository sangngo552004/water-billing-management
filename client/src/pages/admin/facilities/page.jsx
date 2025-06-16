import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react"
import { useFacilities } from '../../../hooks/useFacilities'; // Đường dẫn của bạn có thể khác
import { AddFacilityForm } from '../../../components/facilities/AddFacilityForm'; // Đường dẫn của bạn có thể khác
import { ViewFacilityDetails } from '../../../components/facilities/ViewFacilityDetails'; // Đường dẫn của bạn có thể khác
import { toast } from 'sonner';

const ITEMS_PER_PAGE_DEFAULT = 10; // Giữ nguyên

export default function FacilitiesPage() {
  const {
    facilities,
    loading,
    error,
    totalFacilities,
    currentPage,
    itemsPerPage,
    searchTerm, // Lấy searchTerm từ hook
    isActiveFilter,
    setSearchTerm, // Hàm để cập nhật searchTerm trong hook
    setIsActiveFilter,
    setCurrentPage,
    deleteFacility
  } = useFacilities();

  // State cục bộ cho input tìm kiếm để xử lý debounce
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [deleteFacilityId, setDeleteFacilityId] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Đồng bộ localSearchTerm với searchTerm từ hook khi searchTerm thay đổi từ bên ngoài (vd: reset)
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // EFFECT DEBOUNCE CHO TÌM KIẾM
  useEffect(() => {
    // Chỉ debounce nếu localSearchTerm khác với searchTerm hiện tại trong hook
    // và đảm bảo không chạy debounce khi component mount lần đầu với searchTerm rỗng
    if (localSearchTerm === searchTerm && localSearchTerm === '') {
        return; // Không làm gì nếu cả hai đều rỗng và bằng nhau
    }

    const handler = setTimeout(() => {
      // Chỉ cập nhật searchTerm trong hook khi localSearchTerm đã ổn định
      if (localSearchTerm !== searchTerm) {
        setSearchTerm(localSearchTerm); // Điều này sẽ kích hoạt fetchFacilities trong useFacilities
        setCurrentPage(1); // Reset về trang 1 khi searchTerm thay đổi
      }
    }, 500); // 500ms debounce time

    // Cleanup function để xóa timeout nếu giá trị thay đổi trước khi timeout kết thúc
    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, setSearchTerm, setCurrentPage, searchTerm]); // Thêm searchTerm vào dependencies để so sánh

  const totalPages = Math.ceil(totalFacilities / itemsPerPage);

  const handleView = (facility) => {
    setSelectedFacility(facility);
    setIsViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteFacilityId) {
      try {
        await deleteFacility(deleteFacilityId);
        toast.success("Xóa cơ sở thành công!");
        setDeleteFacilityId(null);
        // Logic điều chỉnh trang sau khi xóa
        if (currentPage > totalPages && totalFacilities > 0) {
          setCurrentPage(totalPages);
        } else if (totalFacilities === 0) {
          setCurrentPage(1);
        }
      } catch (err) {
        toast.error(err.message || "Đã có lỗi xảy ra khi xóa cơ sở.");
      } finally {
        setDeleteFacilityId(null);
      }
    }
  };

  // Hàm để lấy Badge trạng thái
  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Cơ sở</h1>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo địa chỉ..."
                  value={localSearchTerm} // Sử dụng state cục bộ ở đây
                  onChange={(e) => {
                    setLocalSearchTerm(e.target.value); // Cập nhật state cục bộ ngay lập tức
                    // setCurrentPage(1); // KHÔNG reset trang ở đây nữa, để debounce lo
                  }}
                  className="pl-10"
                  // ĐÃ XÓA disabled={loading} để cho phép gõ liên tục
                />
              </div>

              {/* Bộ lọc isActive */}
              <Select
                value={isActiveFilter === true ? "active" : isActiveFilter === false ? "inactive" : "all"}
                onValueChange={(value) => {
                  setIsActiveFilter(value === "active" ? true : value === "inactive" ? false : null);
                  setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trạng thái hoạt động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm cơ sở
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thêm cơ sở mới vào hệ thống</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Facilities Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách cơ sở ({totalFacilities}) - Trang {currentPage}/{totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && localSearchTerm === searchTerm ? ( // Hiển thị "Đang tải" chỉ khi dữ liệu đang được tải cho searchTerm hiện tại
              <p className="text-center py-8 text-gray-500">Đang tải dữ liệu...</p>
            ) : facilities.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Không tìm thấy cơ sở nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Địa chỉ đầy đủ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((facility) => (
                    <TableRow key={facility.facilityId}>
                      <TableCell>{facility.facilityId}</TableCell>
                      <TableCell className="font-medium">{facility.fullAddress}</TableCell>
                      <TableCell>{getStatusBadge(facility.isActive)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleView(facility)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết cơ sở</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteFacilityId(facility.facilityId)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa cơ sở khỏi hệ thống</TooltipContent>
                          </Tooltip>
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
                          e.preventDefault()
                          if (currentPage > 1) setCurrentPage(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    ))}
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

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm cơ sở mới</DialogTitle>
            </DialogHeader>
            <AddFacilityForm onClose={() => {
                setIsAddModalOpen(false);
            }} />
          </DialogContent>
        </Dialog>


        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Chi tiết cơ sở</DialogTitle>
            </DialogHeader>
            <ViewFacilityDetails facility={selectedFacility} onClose={() => setIsViewModalOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteFacilityId} onOpenChange={() => setDeleteFacilityId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa cơ sở</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa cơ sở này? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan
                bao gồm hợp đồng và đồng hồ nước.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Đang xóa..." : "Xóa cơ sở"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}