package com.waterbilling.demo.dto.response;

import java.time.LocalDateTime;

public class RequestDetailDTO {
    private Long requestId;
    private String requestType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String approvedByEmployee;

    // Thêm các trường mới
    private Long contractId;
    private String customerCode;
    private String ownerFullName;

    private ChangeInfoRequestDTO changeInfoDetails;
    private StopServiceRequestDTO stopServiceDetails;

    // Getters and Setters
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }
    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getapprovedAt() { return approvedAt; }
    public void setapprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getApprovedByEmployee() { return approvedByEmployee; }
    public void setApprovedByEmployee(String approvedByEmployee) { this.approvedByEmployee = approvedByEmployee; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getOwnerFullName() { return ownerFullName; }
    public void setOwnerFullName(String ownerFullName) { this.ownerFullName = ownerFullName; }

    public ChangeInfoRequestDTO getChangeInfoDetails() { return changeInfoDetails; }
    public void setChangeInfoDetails(ChangeInfoRequestDTO changeInfoDetails) { this.changeInfoDetails = changeInfoDetails; }
    public StopServiceRequestDTO getStopServiceDetails() { return stopServiceDetails; }
    public void setStopServiceDetails(StopServiceRequestDTO stopServiceDetails) { this.stopServiceDetails = stopServiceDetails; }
}
