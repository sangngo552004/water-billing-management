import { LoginForm } from "../../components/LoginForm";
import { Link } from "react-router-dom";
import { login } from '../../redux/auth/authService';
import { fetchContracts } from '../../redux/contract/contractService'; // Đảm bảo import đúng
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCustomerSubmit = async (formData) => {
    const resultAction = await dispatch(login(formData));

    if (login.fulfilled.match(resultAction)) {
      const { role } = resultAction.payload; 
      if (role === "owner") {
        const contractsResult = await dispatch(fetchContracts());
        const contracts = contractsResult.payload;
        
        const latestContract = contracts[0]; 
        navigate(`/${latestContract.contractId}/`);
      } else {
        navigate("/unauthorized");
      }
    } else if (login.rejected.match(resultAction)) {
      console.error("Đăng nhập thất bại:", resultAction.error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Quản Lý Tiền Nước</h1>
          <p className="mt-2 text-gray-600">Đăng nhập để tiếp tục</p>
        </div>
        <LoginForm
        formType={"user"}
          formConfig={{
            usernameLabel: "Tên đăng nhập ",
            usernamePlaceholder: "Nhập tên đăng nhập của bạn",
            passwordLabel: "Mật khẩu",
            passwordPlaceholder: "Nhập mật khẩu của bạn",
            submitButtonText: "Đăng nhập",
            onSubmit: handleCustomerSubmit,
          }}
        />
        <div className="text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
