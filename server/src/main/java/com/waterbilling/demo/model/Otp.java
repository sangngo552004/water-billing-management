package com.waterbilling.demo.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "otp")
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String email;

    @Column(name = "otp_code", nullable = false)
    String otpCode;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;

}
