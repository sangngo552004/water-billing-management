package com.waterbilling.demo.model;

import com.waterbilling.demo.enums.InvoiceStatus;
import com.waterbilling.demo.enums.PaymentMethod;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


// --- Invoice ---
@Entity
@Table(name = "Invoice")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InvoiceId")
    private Long invoiceId;

    @Column(name = "PaidAt")
    private LocalDateTime paidAt;

    @Column(name = "TotalPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "TotalUsage", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalUsage;

    @Enumerated(EnumType.STRING)
    @Column(name = "PaymentMethod")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private InvoiceStatus status = InvoiceStatus.unpaid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy", nullable = false)
    private Employee createdBy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractPeriodId", nullable = false)
    private PeriodContract contractPeriod;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CollectedBy")
    private Employee collectedBy;

    // Mối quan hệ ONE-TO-MANY với InvoicePricingDetail
    // mappedBy chỉ ra tên trường trong InvoicePricingDetail mà sở hữu mối quan hệ (trường "invoice")
    // CascadeType.ALL: Đảm bảo khi một Invoice được tạo/cập nhật/xóa, các InvoicePricingDetail liên quan cũng được xử lý (persisted/removed)
    // orphanRemoval = true: Khi một InvoicePricingDetail bị gỡ khỏi danh sách invoicePricingDetails, nó sẽ bị xóa khỏi cơ sở dữ liệu
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoicePricingDetail> invoicePricingDetails = new ArrayList<>();


    // Getters and Setters
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getTotalUsage() { return totalUsage; }
    public void setTotalUsage(BigDecimal totalUsage) { this.totalUsage = totalUsage; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }
    public PeriodContract getContractPeriod() { return contractPeriod; }
    public void setContractPeriod(PeriodContract contractPeriod) { this.contractPeriod = contractPeriod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Employee getCollectedBy() { return collectedBy; }
    public void setCollectedBy(Employee collectedBy) { this.collectedBy = collectedBy; }

    // Getters and Setters for invoicePricingDetails
    public List<InvoicePricingDetail> getInvoicePricingDetails() {
        return invoicePricingDetails;
    }

    public void setInvoicePricingDetails(List<InvoicePricingDetail> invoicePricingDetails) {
        // Clear existing and add new to maintain managed relationship
        this.invoicePricingDetails.clear();
        if (invoicePricingDetails != null) {
            this.invoicePricingDetails.addAll(invoicePricingDetails);
            // Ensure bidirectional relationship is set for new items
            for (InvoicePricingDetail detail : invoicePricingDetails) {
                detail.setInvoice(this);
            }
        }
    }
}
