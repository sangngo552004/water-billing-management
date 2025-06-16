package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndOtpCode(String email, String otpCode);
}
