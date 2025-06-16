import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { selectAuthLoading, selectAuthError } from '../redux/auth/authSelector';
import { Link } from "react-router-dom";


export function LoginForm({ formType, formConfig = {} }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formConfig.onSubmit) {
      await formConfig.onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">{formConfig.usernameLabel || "Tên đăng nhập"}</Label>
        <Input
          id="username"
          name="username"
          placeholder={formConfig.usernamePlaceholder || "Nhập tên đăng nhập"}
          required
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        {
          formType === "user" && 
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{formConfig.passwordLabel || "Mật khẩu"}</Label>
          <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Quên mật khẩu?
        </Link>
        </div>
        }
        
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={formConfig.passwordPlaceholder || "Nhập mật khẩu"}
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Hiện/ẩn mật khẩu"
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className={formType === "employee" ?  "w-full bg-green-600 hover:bg-green-700":"w-full bg-blue-600 hover:bg-blue-700"}disabled={loading} >
        {loading ? "Đang đăng nhập..." : formConfig.submitButtonText || "Đăng nhập"} 
      </Button>
    </form>
  );
}