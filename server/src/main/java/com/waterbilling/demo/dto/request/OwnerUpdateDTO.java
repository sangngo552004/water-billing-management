package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.*;

public class OwnerUpdateDTO {
    @NotBlank
    @Size(max = 100)
    private String fullName;
    @Email @Size(max = 50)
    private String email;
    @NotBlank @Size(max = 15) @Pattern(regexp = "^[0-9]{10,15}$")
    private String phoneNumber;

    private Boolean isActive;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}