package com.waterbilling.demo.dto.response;

import java.time.LocalDateTime;

public class FacilityDTO {
    private Long facilityId;
    private String fullAddress;
    private LocalDateTime createdAt;
    private Boolean isActive;

    // Getters and Setters
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}