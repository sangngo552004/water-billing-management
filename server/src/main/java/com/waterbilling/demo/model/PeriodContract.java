package com.waterbilling.demo.model;
import com.waterbilling.demo.enums.PeriodContractStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PeriodContract")
public class PeriodContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ContractPeriodId")
    private Long contractPeriodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractId", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PeriodId", nullable = false)
    private BillingPeriod billingPeriod;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private PeriodContractStatus status = PeriodContractStatus.pending;

    @Column(name = "Note", columnDefinition = "TEXT")
    private String note;



    // Getters and Setters
    public Long getContractPeriodId() { return contractPeriodId; }
    public void setContractPeriodId(Long contractPeriodId) { this.contractPeriodId = contractPeriodId; }
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
    public BillingPeriod getBillingPeriod() { return billingPeriod; }
    public void setBillingPeriod(BillingPeriod billingPeriod) { this.billingPeriod = billingPeriod; }
    public PeriodContractStatus getStatus() { return status; }
    public void setStatus(PeriodContractStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
