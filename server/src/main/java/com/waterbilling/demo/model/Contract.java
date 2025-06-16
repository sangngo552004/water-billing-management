package com.waterbilling.demo.model;
import com.waterbilling.demo.enums.ContractStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Contract")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ContractId")
    private Long contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OwnerId", nullable = false)
    private Owner owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FacilityId", nullable = false)
    private Facility facility;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractTypeId", nullable = false)
    private ContractType contractType;

    @Column(name = "CustomerCode", nullable = false, length = 50, unique = true)
    private String customerCode;

    @Column(name = "Image", nullable = false, length = 255)
    private String image;

    @Column(name = "StartDate", nullable = false)
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private ContractStatus status = ContractStatus.active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy")
    private Employee createdBy;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Enum for ContractStatus

    // Getters and Setters
    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public Owner getOwner() { return owner; }
    public void setOwner(Owner owner) { this.owner = owner; }
    public Facility getFacility() { return facility; }
    public void setFacility(Facility facility) { this.facility = facility; }
    public ContractType getContractType() { return contractType; }
    public void setContractType(ContractType contractType) { this.contractType = contractType; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public ContractStatus getStatus() { return status; }
    public void setStatus(ContractStatus status) { this.status = status; }
    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
