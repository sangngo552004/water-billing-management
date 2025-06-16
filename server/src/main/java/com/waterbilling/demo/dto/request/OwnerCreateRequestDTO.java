package com.waterbilling.demo.dto.request;
import jakarta.validation.constraints.*;

public class OwnerCreateRequestDTO {

    @NotBlank @Size(max = 100)
    private String fullName;
    @NotBlank @Size(max = 20) @Pattern(regexp = "^[0-9]{9,12}$")
    private String identityNumber;
    @Email @Size(max = 50)
    private String email;
    @NotBlank @Size(max = 15) @Pattern(regexp = "^[0-9]{9,15}$")
    private String phoneNumber;


    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getIdentityNumber() { return identityNumber; }
    public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
