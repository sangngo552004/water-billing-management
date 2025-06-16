package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.BillingPeriodStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BillingPeriodDTO {
    private Long periodId;
    private String periodName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private BillingPeriodStatus status;
    private LocalDateTime createdAt;
    private Long totalContracts;
    private Long readContracts;
    private Long invoicedContracts;
    private Long paidContracts;
    private Long unrecordedContracts;

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
    public Long getTotalContracts() { return totalContracts; }
    public void setTotalContracts(Long totalContracts) { this.totalContracts = totalContracts; }
    public Long getReadContracts() { return readContracts; }
    public void setReadContracts(Long readContracts) { this.readContracts = readContracts; }
    public Long getInvoicedContracts() { return invoicedContracts; }
    public void setInvoicedContracts(Long invoicedContracts) { this.invoicedContracts = invoicedContracts; }
    public Long getPaidContracts() { return paidContracts; }
    public void setPaidContracts(Long paidContracts) { this.paidContracts = paidContracts; }
    public Long getUnrecordedContracts() { return unrecordedContracts; }
    public void setUnrecordedContracts(Long unrecordedContracts) { this.unrecordedContracts = unrecordedContracts; }
}
