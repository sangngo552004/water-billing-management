import { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import các modules đã tách
import { usePeriods, PERIOD_FILTER_DATA } from "../../../hooks/usePeriods";
import PeriodForm from "@/components/period/PeriodForm";
import Pagination from "@/components/common/Pagination";


export default function PeriodsPage() {
  const {
    periods,
    loading,
    error, // Giữ lại error trong hook để debug nếu cần, nhưng không render trực tiếp
    currentPage,
    totalPages,
    totalElements,
    searchTerm, // searchTerm từ hook, sẽ được cập nhật bởi localSearchTerm sau debounce
    selectedYear,
    selectedMonth,
    selectedStatus,
    setCurrentPage,
    setSearchTerm, // Setter từ hook
    setSelectedYear,
    setSelectedMonth,
    setSelectedStatus,
    addPeriod,
    updatePeriod,
    removePeriod,
    markPeriodAsComplete,
  } = usePeriods();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [deletePeriodConfirm, setDeletePeriodConfirm] = useState(null);
  const [completePeriodConfirm, setCompletePeriodConfirm] = useState(null);

  // State cục bộ cho input tìm kiếm để thực hiện debounce
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    console.log(searchTerm)
    const handler = setTimeout(() => {
      setSearchTerm(localSearchTerm); // Cập nhật searchTerm trong hook sau độ trễ
    }, 500); // Độ trễ 500ms

    return () => {
      clearTimeout(handler); // Xóa timeout nếu localSearchTerm thay đổi trước khi hết thời gian
    };
  }, [localSearchTerm, setSearchTerm]);


  const getStatusBadge = (status) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">Đang thu</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Đã hoàn thành</Badge>;
      case "CHO_GHI_SO":
        return <Badge className="bg-purple-100 text-purple-800">Chờ ghi sổ</Badge>;
      case "DA_HUY":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAddClick = () => {
    setEditingPeriod(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (id) => {
    const periodToEdit = periods.find((p) => p.periodId === id);
    if (periodToEdit) {
      setEditingPeriod(periodToEdit);
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = async (formData) => {
    let result;
    if (editingPeriod) {
      result = await updatePeriod(formData.id, formData); 
    } else {
      result = await addPeriod(formData);
    }
    // Chỉ đóng form nếu thao tác thành công
    if (result && result.success) {
      setIsFormOpen(false);
    }
  };

  const handleDeleteConfirm = (id) => {
    setDeletePeriodConfirm(id);
  };

  const handleCompleteConfirm = (id) => {
    setCompletePeriodConfirm(id);
  };

  if (loading && periods.length === 0) { // Chỉ hiển thị loading nếu chưa có dữ liệu nào được tải
    return <div className="p-6 text-center text-gray-600">Đang tải dữ liệu kỳ...</div>;
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý kỳ</h1>
          <Button onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm kỳ mới
          </Button>
        </div>

        {/* Periods Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách kỳ ({totalElements})</CardTitle>
          </CardHeader>
          <CardContent>
            {periods.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên kỳ</TableHead>
                      <TableHead>Từ ngày</TableHead>
                      <TableHead>Đến ngày</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Tổng HĐ</TableHead>
                      <TableHead>HĐ chờ ghi</TableHead>
                      <TableHead>HĐ đã tạo hóa đơn</TableHead>
                      <TableHead>HĐ đã thu</TableHead>
                      <TableHead>HĐ không ghi được</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periods.map((period) => (
                      <TableRow key={period.periodId}>
                        <TableCell className="font-medium">{period.periodName}</TableCell>
                        <TableCell>{period.fromDate}</TableCell>
                        <TableCell>{period.toDate}</TableCell>
                        <TableCell>{getStatusBadge(period.status)}</TableCell>
                        <TableCell>{period.totalContracts}</TableCell>
                        <TableCell>{period.readContracts}</TableCell>
                        <TableCell>{period.invoicedContracts}</TableCell>
                        <TableCell>{period.paidContracts}</TableCell>
                        <TableCell>{period.unrecordedContracts}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {/* Nút Xem chi tiết */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link to={`http://localhost:5173/admin/periods/${period.periodId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Xem chi tiết</TooltipContent>
                            </Tooltip>

                            {/* Các nút hành động chỉ hiển thị nếu kỳ chưa "Đã hoàn thành" hoặc "Đã hủy" */}
                            {period.status !== "completed"  && (
                              <>
                                {/* Nút Hoàn thành kỳ */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCompleteConfirm(period.periodId)}
                                      className="border-green-200 text-green-700 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Hoàn thành kỳ</TooltipContent>
                                </Tooltip>

                                {/* Nút Sửa */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditClick(period.periodId)}
                                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Sửa kỳ</TooltipContent>
                                </Tooltip>
                              </>
                            )}

                            {/* Nút Xóa (chỉ hiển thị nếu kỳ chưa "Đã hoàn thành" hoặc "Đã hủy") */}
                            {period.status !== "completed"  && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteConfirm(period.periodId)}
                                            className="border-red-200 text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Xóa kỳ</TooltipContent>
                                </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedYear !== "Tất cả" || selectedMonth !== "Tất cả" || selectedStatus !== "Tất cả"
                  ? "Không tìm thấy kỳ nào phù hợp với bộ lọc."
                  : "Chưa có kỳ nào được tạo. Vui lòng thêm kỳ mới."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Period Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPeriod ? "Chỉnh sửa kỳ" : "Thêm kỳ mới"}</DialogTitle>
            </DialogHeader>
            <PeriodForm
              initialData={editingPeriod}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleFormSubmit}
            />
          </DialogContent>
        </Dialog>

        {/* AlertDialog để xác nhận xóa kỳ */}
        <AlertDialog open={!!deletePeriodConfirm} onOpenChange={() => setDeletePeriodConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa kỳ</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa kỳ này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={async () => { // Đảm bảo async để await
                const result = await removePeriod(deletePeriodConfirm);
                if (result && result.success) {
                    setDeletePeriodConfirm(null); // Đóng dialog nếu xóa thành công
                }
              }}>
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog để xác nhận hoàn thành kỳ */}
        <AlertDialog open={!!completePeriodConfirm} onOpenChange={() => setCompletePeriodConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận hoàn thành kỳ</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn đánh dấu kỳ này là đã hoàn thành? 
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={async () => { // Đảm bảo async để await
                const result = await markPeriodAsComplete(completePeriodConfirm);
                if (result && result.success) {
                    setCompletePeriodConfirm(null); // Đóng dialog nếu hoàn thành thành công
                }
              }}>
                Hoàn thành
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}