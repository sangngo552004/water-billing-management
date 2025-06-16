package com.waterbilling.demo.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

// --- WaterMeter ---
@Entity
@Table(name = "WaterMeter")
public class WaterMeter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WaterMeterId")
    private Long waterMeterId;

    @Column(name = "SerialNumber", nullable = false, length = 50, unique = true)
    private String serialNumber;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = false; // Changed default as per schema.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy")
    private Employee createdBy;

    // Getters and Setters
    public Long getWaterMeterId() { return waterMeterId; }
    public void setWaterMeterId(Long waterMeterId) { this.waterMeterId = waterMeterId; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }
}
