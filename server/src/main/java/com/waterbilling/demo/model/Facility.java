package com.waterbilling.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;


// --- Facility ---
@Entity
@Table(name = "Facility")
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FacilityId")
    private Long facilityId;

    @Column(name = "FullAddress", nullable = false, length = 255)
    private String fullAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy")
    private Employee createdBy;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = false; // Changed default as per schema.

    // Getters and Setters
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }
    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
    
    
    
    
    
    
    
    

