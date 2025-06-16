package com.waterbilling.demo.model;
import jakarta.persistence.*;

import java.math.BigDecimal;

// --- WaterMeterAssignment ---
@Entity
@Table(name = "WaterMeterAssignment")
public class WaterMeterAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AssignmentId")
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WaterMeterId")
    private WaterMeter waterMeter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractId")
    private Contract contract;

    @Column(name = "CurrentReading", precision = 10, scale = 2)
    private BigDecimal currentReading;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;

    // Getters and Setters
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public WaterMeter getWaterMeter() { return waterMeter; }
    public void setWaterMeter(WaterMeter waterMeter) { this.waterMeter = waterMeter; }
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
    public BigDecimal getCurrentReading() { return currentReading; }
    public void setCurrentReading(BigDecimal currentReading) { this.currentReading = currentReading; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}

