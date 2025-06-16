package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StopServiceRequestInputDTO {
    @NotNull
    private Long contractId;
    @NotBlank
    private String reason;

    // Getters and Setters
    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
