package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.ContractStatus;

public class OwnerContractSummaryDTO {
    private Long contractId;
    private String customerCode;
    private ContractStatus status;

    // Getters and Setters
    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }
}