package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.ContractStatus;

import java.time.LocalDate;

public class ContractDTO { // For listing/viewing contracts
    private Long contractId;
    private String ownerFullName;
    private String facilityAddress;
    private String contractTypeName;
    private String customerCode;
    private LocalDate startDate;
    private ContractStatus status;

    // Getters and Setters
    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public String getOwnerFullName() { return ownerFullName; }
    public void setOwnerFullName(String ownerFullName) { this.ownerFullName = ownerFullName; }
    public String getFacilityAddress() { return facilityAddress; }
    public void setFacilityAddress(String facilityAddress) { this.facilityAddress = facilityAddress; }
    public String getContractTypeName() { return contractTypeName; }
    public void setContractTypeName(String contractTypeName) { this.contractTypeName = contractTypeName; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public ContractStatus getStatus() { return status; }
    public void setStatus(ContractStatus status) { this.status = status; }
}