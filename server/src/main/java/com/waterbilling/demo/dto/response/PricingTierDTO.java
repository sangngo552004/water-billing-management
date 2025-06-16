package com.waterbilling.demo.dto.response;

import java.math.BigDecimal;

public class PricingTierDTO {
    private Long tierId;
    private BigDecimal minUsage;
    private BigDecimal maxUsage;
    private BigDecimal pricePerM3;

    // Getters and Setters
    public Long getTierId() { return tierId; }
    public void setTierId(Long tierId) { this.tierId = tierId; }
    public BigDecimal getMinUsage() { return minUsage; }
    public void setMinUsage(BigDecimal minUsage) { this.minUsage = minUsage; }
    public BigDecimal getMaxUsage() { return maxUsage; }
    public void setMaxUsage(BigDecimal maxUsage) { this.maxUsage = maxUsage; }
    public BigDecimal getPricePerM3() { return pricePerM3; }
    public void setPricePerM3(BigDecimal pricePerM3) { this.pricePerM3 = pricePerM3; }
}