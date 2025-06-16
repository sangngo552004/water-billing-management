import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { z } from "zod"; // Import Zod để validation frontend

// Zod schemas for frontend validation
const emailSchema = z.string().email("Email không hợp lệ").min(1, "Email không được để trống");
const otpSchema = z.string().length(6, "Mã OTP phải có 6 chữ số").regex(/^\d+$/, "Mã OTP chỉ chứa số");
const passwordSchema = z.object({
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 88 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Array of 6 empty strings for 6 digits
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // For successful actions

  // --- API Calls ---

  // Handle sending OTP (Step 1 submit or Resend OTP)
  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      emailSchema.parse(email); // Validate email using Zod
    } catch (validationError) {
      setError(validationError.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể gửi OTP. Vui lòng thử lại.');
      }

      const data = await response.json();
      setSuccessMessage(data.result || "OTP đã được gửi đến email của bạn.");
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi OTP.');
      console.error("Generate OTP failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification (Step 2 submit)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const fullOtp = otp.join("");
    try {
      otpSchema.parse(fullOtp); // Validate OTP using Zod
    } catch (validationError) {
      setError(validationError.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/otp/verify-otp', { // API mới để verify OTP
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mã OTP không hợp lệ. Vui lòng kiểm tra lại.');
      }

      const data = await response.json();
      setSuccessMessage(data.result || "Mã OTP hợp lệ.");
      setStep(3); // Move to password reset step
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xác nhận OTP.');
      console.error("Verify OTP failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset (Step 3 submit)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      passwordSchema.parse({ newPassword, confirmPassword }); // Validate passwords using Zod
    } catch (validationError) {
      setError(validationError.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/otp/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }), // Gửi email, OTP và mật khẩu mới
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }

      const data = await response.json();
      setSuccessMessage(data.result || "Đặt lại mật khẩu thành công!");
      // Optionally redirect to login page after success
      setTimeout(() => navigate("/login"), 2000); // Redirect after a short delay
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
      console.error("Change password failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- UI Handlers ---

  const handleOtpChange = (index, value) => {
    // Only allow numeric input and max 1 character
    const cleanedValue = value.replace(/[^0-9]/g, ''); 
    if (cleanedValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = cleanedValue;
      setOtp(newOtp);

      // Auto focus next input
      if (cleanedValue && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      } else if (!cleanedValue && index > 0) { // Auto focus previous input on backspace/delete
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
                setError(null); // Clear errors when going back
                setSuccessMessage(null); // Clear success message when going back
              } else {
                navigate("/login");
              }
            }}
            className="mr-2"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-2xl font-bold">
            {step === 1 && "Quên mật khẩu"}
            {step === 2 && "Xác nhận OTP"}
            {step === 3 && "Đặt lại mật khẩu"}
          </h1>
        </div>

        {/* Display Error and Success Messages */}
        {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}
        {successMessage && <p className="text-sm text-green-600 mb-4 text-center">{successMessage}</p>}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <p className="text-gray-600 mb-6">
              Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi mã OTP để xác nhận tài khoản.
            </p>
            <form onSubmit={handleGenerateOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </Button>
            </form>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi mã OTP đến email <span className="font-medium text-blue-600">{email}</span>. Vui lòng kiểm tra và nhập mã xác nhận.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Mã xác nhận</Label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center text-lg"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      required
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-blue-600"
                  onClick={handleGenerateOtp} // Call generate OTP again to resend
                  disabled={loading}
                >
                  {loading ? "Đang gửi lại..." : "Gửi lại mã"}
                </Button>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Đang xác nhận..." : "Xác nhận"}
              </Button>
            </form>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <>
            <p className="text-gray-600 mb-6">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Quay lại{" "}
            <Link to="/login" className="text-blue-600 hover:underline"> {/* Changed href to to for react-router-dom Link */}
              đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}