import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import employeeService from '@/api/employeeService';

export function ViewEmployeeDetails({ employee, onClose }) {
  if (!employee) return null;

  // Function to get role badge based on display text
  const getRoleBadge = (roleId) => {
    const roleText = employeeService.getRoleDisplayText(roleId);
    switch (roleText) {
      case 'Quản lý':
        return <Badge className="bg-red-100 text-red-800">Quản lý</Badge>;
      case 'Nhân viên':
        return <Badge className="bg-blue-100 text-blue-800">Nhân viên</Badge>;
      default:
        return <Badge variant="secondary">{roleText}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">ID</Label>
          <p className="text-sm">{employee.employeeId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Họ tên</Label>
          <p className="text-sm font-medium">{employee.fullName}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Email</Label>
          <p className="text-sm">{employee.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
          <p className="text-sm">{employee.phoneNumber}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Tên đăng nhập</Label>
          <p className="text-sm">{employee.username}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Vai trò</Label>
          {getRoleBadge(employee.roleId)}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
          <Badge variant={employee.isActive ? "default" : "secondary"}>
            {employee.isActive ? "✅ Hoạt động" : "❌ Không hoạt động"}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
          <p className="text-sm">{new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(employee.createdAt))}</p>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
}