import { useState } from "react";
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
import { Search, Plus, Edit, UserX, Eye, Trash2, UserCheck } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees"; // Import the custom hook
import { AddEmployeeForm } from "@/components/employees/AddEmployeeForm"; // Import child components
import { EditEmployeeForm } from "@/components/employees/EditEmployeeForm";
import { ViewEmployeeDetails } from "@/components/employees/ViewEmployeeDetails";
import { Spinner } from "@/components/ui/spinner"; // Optional: if you have a spinner component
import { Toaster } from "sonner"; // Make sure you have Toaster configured in your root layout/App.jsx

export default function EmployeesPage() {
  const {
    employees,
    totalEmployees,
    loading,
    error,
    searchTerm,
    isActiveFilter,
    currentPage,
    totalPages,
    selectedEmployee,
    isAddDialogOpen,
    isEditDialogOpen,
    isViewDialogOpen,
    deleteEmployeeConfirmId,
    toggleEmployeeStatusConfirmId,
    handleSearchChange,
    handleIsActiveFilterChange,
    handlePageChange,
    handleAddEmployee,
    handleEditEmployee,
    handleToggleStatus,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openViewDialog,
    closeViewDialog,
    openToggleStatusConfirm,
    closeToggleStatusConfirm,
    getRoleDisplayText, 
    fetchEmployees
  } = useEmployees();

  // Helper function to get role badge based on roleId
  const getRoleBadge = (roleId) => {
    const roleText = getRoleDisplayText(roleId);
    switch (roleText) {
      case "Quản lý":
        return <Badge className="bg-red-100 text-red-800">Quản lý</Badge>;
      case "Nhân viên":
        return <Badge className="bg-blue-100 text-blue-800">Nhân viên</Badge>;
      default:
        return <Badge variant="secondary">{roleText}</Badge>;
    }
  };

  // Find the employee being toggled or deleted for AlertDialog content
  const employeeToToggle = employees.find((emp) => emp.employeeId === toggleEmployeeStatusConfirmId);

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhân viên</h1>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={isActiveFilter === true ? "active" : isActiveFilter === false ? "inactive" : "all" } onValueChange={handleIsActiveFilterChange}>
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
                  <Button onClick={openAddDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm nhân viên
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thêm nhân viên mới vào hệ thống</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách nhân viên ({totalEmployees}) - Trang {currentPage}/{totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Spinner size="lg" /> {/* Assuming you have a Spinner component */}
                <p className="ml-2">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>Đã xảy ra lỗi khi tải dữ liệu: {error.message}</p>
              </div>
            ) : employees.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không tìm thấy nhân viên nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Tài khoản</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.employeeId} className={!employee.isActive ? "opacity-60" : ""}>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell className="font-medium">{employee.fullName}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phoneNumber}</TableCell>
                      <TableCell>{employee.username}</TableCell>
                      <TableCell>{getRoleBadge(employee.roleId)}</TableCell>
                      <TableCell>
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "✅ Hoạt động" : "❌ Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Chỉnh sửa nhân viên</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openViewDialog(employee)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openToggleStatusConfirm(employee.employeeId)}
                                className={employee.isActive ? "text-orange-600" : "text-green-600"}
                              >
                                {employee.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {employee.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
                            </TooltipContent>
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

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={closeAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
            </DialogHeader>
            <AddEmployeeForm onClose={closeAddDialog} onAddSuccess={handleAddEmployee} />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
            </DialogHeader>
            <EditEmployeeForm employee={selectedEmployee} onClose={closeEditDialog} onEditSuccess={handleEditEmployee} />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={closeViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết nhân viên</DialogTitle>
            </DialogHeader>
            <ViewEmployeeDetails employee={selectedEmployee} onClose={closeViewDialog} />
          </DialogContent>
        </Dialog>


        {/* Toggle Status Confirmation Dialog */}
        <AlertDialog open={!!toggleEmployeeStatusConfirmId} onOpenChange={closeToggleStatusConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
              <AlertDialogDescription>
                {employeeToToggle?.isActive
                  ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của nhân viên "${employeeToToggle?.fullName}"? Nhân viên sẽ không thể đăng nhập.`
                  : `Bạn có chắc chắn muốn kích hoạt tài khoản của nhân viên "${employeeToToggle?.fullName}"? Nhân viên sẽ có thể đăng nhập bình thường.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => toggleEmployeeStatusConfirmId && handleToggleStatus(toggleEmployeeStatusConfirmId, employeeToToggle?.isActive)}
                className={employeeToToggle?.isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
              >
                {employeeToToggle?.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}