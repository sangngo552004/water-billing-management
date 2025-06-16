package com.waterbilling.demo.dto.response;

import java.math.BigDecimal;

// DTO cho chi tiết giá nước trong hóa đơn
public class InvoicePricingDetailDTO {
    private Long tierId;
    private BigDecimal minUsage;
    private BigDecimal maxUsage;
    private BigDecimal pricePerM3;
    private BigDecimal usageOfTier;
    private BigDecimal price;

    // Getters and Setters
    public Long getTierId() { return tierId; }
    public void setTierId(Long tierId) { this.tierId = tierId; }
    public BigDecimal getMinUsage() { return minUsage; }
    public void setMinUsage(BigDecimal minUsage) { this.minUsage = minUsage; }
    public BigDecimal getMaxUsage() { return maxUsage; }
    public void setMaxUsage(BigDecimal maxUsage) { this.maxUsage = maxUsage; }
    public BigDecimal getPricePerM3() { return pricePerM3; }
    public void setPricePerM3(BigDecimal pricePerM3) { this.pricePerM3 = pricePerM3; }
    public BigDecimal getUsageOfTier() { return usageOfTier; }
    public void setUsageOfTier(BigDecimal usageOfTier) { this.usageOfTier = usageOfTier; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}