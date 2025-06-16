package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ChangeInfoRequestInputDTO {
    @NotNull
    private Long contractId;
    @NotBlank
    @Size(max = 100)
    private String newFullName;
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", message = "Invalid email format")
    @Size(max = 100)
    private String newEmail;
    @NotBlank
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Invalid phone number format")
    @Size(max = 15)
    private String newPhoneNumber;

    // Getters and Setters
    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public String getNewFullName() { return newFullName; }
    public void setNewFullName(String newFullName) { this.newFullName = newFullName; }
    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }
    public String getNewPhoneNumber() { return newPhoneNumber; }
    public void setNewPhoneNumber(String newPhoneNumber) { this.newPhoneNumber = newPhoneNumber; }
}
