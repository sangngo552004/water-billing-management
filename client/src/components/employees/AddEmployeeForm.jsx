import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import employeeService from '@/api/employeeService'; // To get role options

export function AddEmployeeForm({ onClose, onAddSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // 'Quản lý' or 'Nhân viên'
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

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
    if (!password.trim()) newErrors.password = 'Mật khẩu không được để trống.';
    if (!role) newErrors.role = 'Vai trò không được để trống.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const newEmployeeData = {
      fullName,
      email,
      phoneNumber,
      username,
      password,
      role, 
      isActive,
    };

    try {
      await onAddSuccess(newEmployeeData); // Call the hook's add function
      onClose();
    } catch (error) {
      // Error handled by toast in service/hook
      console.error("Failed to add employee via form:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName" className="mb-2">Họ tên *</Label>
          <Input id="fullName" placeholder="Nhập họ tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="mb-2">Email *</Label>
          <Input id="email" type="email" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phoneNumber" className="mb-2">Số điện thoại *</Label>
          <Input id="phoneNumber" placeholder="Nhập số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>
        <div>
          <Label htmlFor="username" className="mb-2">Tên đăng nhập *</Label>
          <Input id="username" placeholder="Nhập tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password" className="mb-2">Mật khẩu *</Label>
          <Input id="password" type="password" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <Label htmlFor="role" className="mb-2">Vai trò *</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
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
        <Checkbox id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive">Kích hoạt tài khoản</Label>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>Lưu</Button>
      </div>
    </div>
  );
}