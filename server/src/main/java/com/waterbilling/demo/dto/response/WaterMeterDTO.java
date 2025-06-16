package com.waterbilling.demo.dto.response;

import java.time.LocalDateTime;

public class WaterMeterDTO { // For returning water meter details
    private Long waterMeterId;
    private String serialNumber;
    private LocalDateTime createdAt;
    private Boolean isActive;

    // Getters and Setters
    public Long getWaterMeterId() { return waterMeterId; }
    public void setWaterMeterId(Long waterMeterId) { this.waterMeterId = waterMeterId; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}