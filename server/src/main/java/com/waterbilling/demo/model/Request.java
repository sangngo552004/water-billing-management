package com.waterbilling.demo.model;
import com.waterbilling.demo.enums.RequestStatus;
import com.waterbilling.demo.enums.RequestType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
// --- Request ---
@Entity
@Table(name = "Request")
@Inheritance(strategy = InheritanceType.JOINED) // Using JOINED strategy for ChangeInfoRequest and StopServiceRequest
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RequestId")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractId", nullable = false)
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(name = "RequestType", nullable = false)
    private RequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private RequestStatus status = RequestStatus.pending;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "ApprovedAt")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ApprovedBy")
    private Employee approvedBy;

    // Getters and Setters
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
    public RequestType getRequestType() { return requestType; }
    public void setRequestType(RequestType requestType) { this.requestType = requestType; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public Employee getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Employee approvedBy) { this.approvedBy = approvedBy; }
}