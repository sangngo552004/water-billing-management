import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { z } from "zod";
import { toast } from 'sonner';

// If you use react-router-dom's navigate hook, uncomment and import it:
// import { useNavigate } from 'react-router-dom';


// Schema validation for registration form
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    citizenId: z.string().min(9, "CCCD phải có ít nhất 9 ký tự"),
    phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"), // Thêm validation cho username
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  // If you use react-router-dom's navigate hook, uncomment and initialize it:
  // const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({}); // State to hold validation and API errors
  // State for general API error message

  const [formData, setFormData] = useState({
    fullName: "",
    citizenId: "", // Sẽ map tới identityNumber
    phone: "",     // Sẽ map tới phoneNumber
    email: "",
    username: "",  // Thêm username vào state
    password: "",
    confirmPassword: "",
  });

  // Handle input changes and clear related validation errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear general API error when user types

  };

  // Validate form data using Zod schema
  const validateForm = () => {
    try {
      registerSchema.parse(formData);
      setErrors({}); // Clear all validation errors if valid

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors); // Set validation errors
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if client-side validation fails
    }

    setIsLoading(true);


    try {
      // Prepare payload according to your API requirements
      const payload = {
        username: formData.username, // Sử dụng username từ form
        password: formData.password,
        fullName: formData.fullName,
        identityNumber: formData.citizenId, // citizenId trong form -> identityNumber trong API
        email: formData.email,
        phoneNumber: formData.phone, // phone trong form -> phoneNumber trong API
      };

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // If response is not OK (e.g., 400, 409, 500 status)
        const errorData = await response.json(); // Attempt to parse error message from API
        // Display a more specific error message if provided by the API
       toast.error(errorData.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        console.error("Registration API error:", errorData);
        return; // Stop execution after handling API error
      }

      // Registration successful
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      // Optionally, redirect to login page after successful registration
      // navigate('/login');

    } catch (error) {
      // Catch network errors or errors from .json() parsing
      console.error("Registration failed:", error);
      toast.error('Có lỗi xảy ra trong quá trình kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Nhập họ và tên"
          required
          value={formData.fullName}
          onChange={handleChange}
        />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="citizenId">Căn cước công dân</Label>
        <Input
          id="citizenId"
          name="citizenId"
          placeholder="Nhập số CCCD"
          required
          value={formData.citizenId}
          onChange={handleChange}
        />
        {errors.citizenId && <p className="text-sm text-red-500">{errors.citizenId}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          name="phone"
          type="tel" // Use type="tel" for phone numbers
          placeholder="Nhập số điện thoại"
          required
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email" // Use type="email" for email input
          placeholder="Nhập địa chỉ email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      
      {/* NEW FIELD: Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Nhập tên đăng nhập"
          required
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
      </Button>

      <div className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-blue-600 hover:text-blue-800">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}