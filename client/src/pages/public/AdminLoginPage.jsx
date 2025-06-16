import { LoginForm } from "../../components/LoginForm";
import { login } from '../../redux/auth/authService';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAdminSubmit = async (formData) => {
    const resultAction = await dispatch(login(formData));
    if (login.fulfilled.match(resultAction)) {
      if (resultAction.payload.role === "admin") {
        navigate(`/admin/dashboard`);
      } else {
        navigate("/unauthorized");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Quản Lý Hệ Thống</h1>
          <p className="mt-2 text-gray-600">Đăng nhập với tài khoản quản trị</p>
        </div>
        <LoginForm
          formType={"admin"}
          formConfig={{
            usernameLabel: "Tên đăng nhập",
            usernamePlaceholder: "Nhập tên đăng nhập ",
            passwordLabel: "Mật khẩu",
            passwordPlaceholder: "Nhập mật khẩu ",
            submitButtonText: "Đăng nhập ",
            onSubmit: handleAdminSubmit,
          }}
        />
      </div>
    </div>
  );
}