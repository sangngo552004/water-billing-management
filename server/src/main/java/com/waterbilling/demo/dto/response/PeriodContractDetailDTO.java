package com.waterbilling.demo.dto.response;

public class PeriodContractDetailDTO {
    private Long contractPeriodId;
    private Long contractId;
    private String customerCode;
    private String ownerFullName;
    private String facilityAddress;
    private String status;
    private String note;

    // Getters and Setters
    public Long getContractPeriodId() { return contractPeriodId; }
    public void setContractPeriodId(Long contractPeriodId) { this.contractPeriodId = contractPeriodId; }
    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getOwnerFullName() { return ownerFullName; }
    public void setOwnerFullName(String ownerFullName) { this.ownerFullName = ownerFullName; }
    public String getFacilityAddress() { return facilityAddress; }
    public void setFacilityAddress(String facilityAddress) { this.facilityAddress = facilityAddress; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
