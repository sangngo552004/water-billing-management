package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class OwnerRegisterInputDTO {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Size(min = 6, max = 20)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @NotBlank
    @Size(min = 9, max = 20)
    private String identityNumber;

    @NotBlank
    @Email
    @Size(max = 50)
    private String email;

    @NotBlank
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$")
    @Size(max = 15)
    private String phoneNumber;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getIdentityNumber() { return identityNumber; }
    public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}