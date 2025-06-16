package com.waterbilling.demo.model;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;


// --- Employee ---
@Getter
@Entity
@Table(name = "Employee")
public class Employee {
    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EmployeeId")
    private Long employeeId;

    @Column(name = "FullName", nullable = false, length = 100)
    private String fullName;

    @Column(name = "PhoneNumber", nullable = false, length = 15, unique = true)
    private String phoneNumber;

    @Column(name = "Email", nullable = false, length = 50, unique = true)
    private String email;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AccountId", unique = true)
    private Account account;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;

    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public void setFullName(String fullName) { this.fullName = fullName; }

    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public void setEmail(String email) { this.email = email; }

    public void setAccount(Account account) { this.account = account; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setIsActive(Boolean active) { isActive = active; }
}
