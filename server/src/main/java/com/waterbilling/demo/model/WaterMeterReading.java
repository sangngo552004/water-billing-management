package com.waterbilling.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Formula;
import com.fasterxml.jackson.annotation.JsonIgnore;

// --- WaterMeterReading ---
@Entity
@Table(name = "WaterMeterReading")
public class WaterMeterReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReadingId")
    private Long readingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AssignmentId", nullable = false)
    private WaterMeterAssignment assignment;

    @Column(name = "PreviousReading", nullable = false, precision = 10, scale = 2)
    private BigDecimal previousReading;

    @Column(name = "CurrentReading", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentReading;

    @Column(name = "IsConfirm", nullable = false)
    private Boolean isConfirm = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractPeriodId", nullable = false)
    private PeriodContract contractPeriod;

    @Column(name = "Image", nullable = false, columnDefinition = "TEXT")
    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy", nullable = false)
    private Employee createdBy;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ConfirmBy")
    private Employee confirmBy;

    @Column(name = "ConfirmAt")
    private LocalDateTime confirmAt;

    // Getters and Setters
    public Long getReadingId() { return readingId; }
    public void setReadingId(Long readingId) { this.readingId = readingId; }
    public WaterMeterAssignment getAssignment() { return assignment; }
    public void setAssignment(WaterMeterAssignment assignment) { this.assignment = assignment; }
    public BigDecimal getPreviousReading() { return previousReading; }
    public void setPreviousReading(BigDecimal previousReading) { this.previousReading = previousReading; }
    public BigDecimal getCurrentReading() { return currentReading; }
    public void setCurrentReading(BigDecimal currentReading) { this.currentReading = currentReading; }
    public Boolean getIsConfirm() { return isConfirm; }
    public void setIsConfirm(Boolean confirm) { isConfirm = confirm; }
    public PeriodContract getContractPeriod() { return contractPeriod; }
    public void setContractPeriod(PeriodContract contractPeriod) { this.contractPeriod = contractPeriod; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Employee getConfirmBy() { return confirmBy; }
    public void setConfirmBy(Employee confirmBy) { this.confirmBy = confirmBy; }
    public LocalDateTime getConfirmAt() { return confirmAt; }
    public void setConfirmAt(LocalDateTime confirmAt) { this.confirmAt = confirmAt; }
}
