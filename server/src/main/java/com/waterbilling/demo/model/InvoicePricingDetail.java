package com.waterbilling.demo.model;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
// --- InvoicePricingDetail ---
@Entity
@Table(name = "InvoicePricingDetail")
public class InvoicePricingDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Add a primary key as it's typically a composite key or a surrogate key in JPA.
    @Column(name = "InvoicePricingDetailId")
    private Long invoicePricingDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "InvoiceId", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TierId", nullable = false)
    private PricingTier pricingTier;

    @Column(name = "UsageOfTier", nullable = false, precision = 10, scale = 2)
    private BigDecimal usageOfTier;

    @Column(name = "Price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Getters and Setters
    public Long getInvoicePricingDetailId() { return invoicePricingDetailId; }
    public void setInvoicePricingDetailId(Long invoicePricingDetailId) { this.invoicePricingDetailId = invoicePricingDetailId; }
    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
    public PricingTier getPricingTier() { return pricingTier; }
    public void setPricingTier(PricingTier pricingTier) { this.pricingTier = pricingTier; }
    public BigDecimal getUsageOfTier() { return usageOfTier; }
    public void setUsageOfTier(BigDecimal usageOfTier) { this.usageOfTier = usageOfTier; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
