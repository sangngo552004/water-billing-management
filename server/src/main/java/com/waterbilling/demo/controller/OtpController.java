package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.ChangePasswordOtpRequest;
import com.waterbilling.demo.dto.request.OtpRequest;
import com.waterbilling.demo.dto.request.VerifyOtpRequest;
import com.waterbilling.demo.dto.response.ApiResponse;
import com.waterbilling.demo.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/otp")
public class OtpController {

    @Autowired
    private OtpService otpService;

    @PostMapping("/generate")
    public ApiResponse<String> generateOtp(@Valid @RequestBody OtpRequest request) {
        otpService.generateAndSendOtp(request);
        return ApiResponse.<String>builder()
                .result("OTP đã được gửi đến email của bạn.")
                .build();
    }
    @PostMapping("/verify-otp")
    public ApiResponse<String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp());
        return ApiResponse.<String>builder()
                .result("Mã OTP hợp lệ. Bạn có thể đặt mật khẩu mới.")
                .build();
    }
    @PostMapping("/change-password")
    public ApiResponse<String> changePasswordWithOtp(@Valid  @RequestBody ChangePasswordOtpRequest request) {
        otpService.changePasswordWithOtp(request);
        return ApiResponse.<String>builder()
                .result("Đổi mật khẩu thành công")
                .build();
    }

}
