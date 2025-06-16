package com.waterbilling.demo.model;
import com.waterbilling.demo.enums.BillingPeriodStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
// --- BillingPeriod ---
@Entity
@Table(name = "BillingPeriod")
public class BillingPeriod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PeriodId")
    private Long periodId;

    @Column(name = "PeriodName", nullable = false, length = 100)
    private String periodName;

    @Column(name = "FromDate", nullable = false)
    private LocalDate fromDate;

    @Column(name = "ToDate", nullable = false)
    private LocalDate toDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private BillingPeriodStatus status = BillingPeriodStatus.in_progress;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy", nullable = false)
    private Employee createdBy;




    // Getters and Setters
    public Long getPeriodId() { return periodId; }
    public void setPeriodId(Long periodId) { this.periodId = periodId; }
    public String getPeriodName() { return periodName; }
    public void setPeriodName(String periodName) { this.periodName = periodName; }
    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
    public BillingPeriodStatus getStatus() { return status; }
    public void setStatus(BillingPeriodStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }
}
