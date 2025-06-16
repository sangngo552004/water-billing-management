package com.waterbilling.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Owner")
public class Owner {
    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OwnerId")
    private Long ownerId;

    @Column(name = "FullName", nullable = false, length = 100)
    private String fullName;

    @Column(name = "IdentityNumber", nullable = false, length = 20, unique = true)
    private String identityNumber;

    @Column(name = "Email", length = 50, unique = true)
    private String email;

    @Column(name = "PhoneNumber", nullable = false, length = 15, unique = true)
    private String phoneNumber;

    @Column(name = "AccountId", unique = true)
    private Long accountId;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = false; // Changed default as per schema.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy")
    private Employee createdBy;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getIdentityNumber() {
        return identityNumber;
    }

    public void setIdentityNumber(String identityNumber) {
        this.identityNumber = identityNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public Employee getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Employee createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}