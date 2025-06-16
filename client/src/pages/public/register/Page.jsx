import { RegisterForm } from "./RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Quản Lý Tiền Nước</h1>
          <p className="mt-2 text-gray-600">Đăng ký tài khoản mới</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
