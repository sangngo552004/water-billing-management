package com.waterbilling.demo.dto.response;

import java.time.LocalDateTime;

public class OwnerDTO {
    private Long ownerId;
    private String username;
    private String fullName;
    private String identityNumber;
    private String email;
    private String phoneNumber;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getIdentityNumber() { return identityNumber; }
    public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
