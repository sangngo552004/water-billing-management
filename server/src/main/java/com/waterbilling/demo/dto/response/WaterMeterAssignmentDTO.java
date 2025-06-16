package com.waterbilling.demo.dto.response;

import java.math.BigDecimal;

public class WaterMeterAssignmentDTO {
    private Long assignmentId;
    private Long waterMeterId;
    private String serialNumber;
    private BigDecimal currentReading;
    private Boolean isActive;

    // Getters and Setters
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Long getWaterMeterId() { return waterMeterId; }
    public void setWaterMeterId(Long waterMeterId) { this.waterMeterId = waterMeterId; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public BigDecimal getCurrentReading() { return currentReading; }
    public void setCurrentReading(BigDecimal currentReading) { this.currentReading = currentReading; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}