import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import employeeService from '@/api/employeeService';

export function EditEmployeeForm({ employee, onClose, onEditSuccess }) {
  const [fullName, setFullName] = useState(employee?.fullName || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(employee?.phoneNumber || '');
  const [username, setUsername] = useState(employee?.username || '');
  const [password, setPassword] = useState(''); // New password, keep empty if not changing
  const [role, setRole] = useState(employeeService.getRoleDisplayText(employee?.roleId) || ''); 
  const [isActive, setIsActive] = useState(employee?.isActive);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName);
      setEmail(employee.email);
      setPhoneNumber(employee.phoneNumber);
      setRole(employeeService.getRoleDisplayText(employee.roleId));
      setIsActive(employee.isActive);
    }
  }, [employee]);

  if (!employee) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Họ tên không được để trống.';
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ.';
    }
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Số điện thoại không được để trống.';
    if (!username.trim()) newErrors.username = 'Tên đăng nhập không được để trống.';
    if (!role) newErrors.role = 'Vai trò không được để trống.';
    if (password && password.length < 8) newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const updatedEmployeeData = {
      fullName,
      email,
      phoneNumber,
      role, 
      isActive,
      newPassword: (password) ? password : undefined,
    };

    try {
      await onEditSuccess(employee.employeeId, updatedEmployeeData); // Call the hook's edit function
      onClose();
    } catch (error) {
      // Error handled by toast in service/hook
      console.error("Failed to update employee via form:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editFullName" className="mb-2">Họ tên *</Label>
          <Input id="editFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="editEmail" className="mb-2">Email *</Label>
          <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editPhoneNumber" className="mb-2">Số điện thoại *</Label>
          <Input id="editPhoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>
        <div>
          <Label htmlFor="editUsername" className="mb-2">Tên đăng nhập *</Label>
          <Input id="editUsername" value={username} onChange={(e) => setUsername(e.target.value)} disabled/>
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
        </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editPassword" className="mb-2">Mật khẩu mới</Label>
          <Input
            id="editPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Để trống nếu không đổi mật khẩu"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <Label htmlFor="editRole" className="mb-2">Vai trò *</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employeeService.getRoleOptions().map(opt => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>
        </div>

      

      <div className="flex items-center space-x-2">
        <Checkbox id="editIsActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="editIsActive">Kích hoạt tài khoản</Label>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>Cập nhật</Button>
      </div>
    </div>
  );
}