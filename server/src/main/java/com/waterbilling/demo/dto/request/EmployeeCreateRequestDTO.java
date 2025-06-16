package com.waterbilling.demo.dto.request;


import jakarta.validation.constraints.*;

public class EmployeeCreateRequestDTO {
    @NotBlank @Size(max = 50)
    private String username;
    @NotBlank @Size(min = 6, max = 255)
    private String password;
    @NotBlank @Size(max = 100)
    private String fullName;
    @NotBlank @Size(max = 15) @Pattern(regexp = "^[0-9]{10,15}$")
    private String phoneNumber;
    @NotBlank @Email @Size(max = 50)
    private String email;
    @NotNull
    private Long roleId;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
}
