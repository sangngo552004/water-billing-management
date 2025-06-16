package com.waterbilling.demo.dto.response;

import java.math.BigDecimal;

public class WaterUsageByPeriodDTO {

    private String billingPeriodName;
    private BigDecimal totalUsage;

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    private Long invoiceId;

    // Getters and Setters

    public String getBillingPeriodName() { return billingPeriodName; }
    public void setBillingPeriodName(String billingPeriodName) { this.billingPeriodName = billingPeriodName; }
    public BigDecimal getTotalUsage() { return totalUsage; }
    public void setTotalUsage(BigDecimal totalUsage) { this.totalUsage = totalUsage; }

}
