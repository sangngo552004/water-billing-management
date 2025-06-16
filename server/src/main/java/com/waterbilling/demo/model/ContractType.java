package com.waterbilling.demo.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ContractType")
public class ContractType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TypeId")
    private Long typeId;

    @Column(name = "TypeName", nullable = false, length = 255)
    private String typeName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy")
    private Employee createdBy;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    // Getters and Setters
    public Long getTypeId() { return typeId; }
    public void setTypeId(Long typeId) { this.typeId = typeId; }
    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }
    public Employee getCreatedBy() { return createdBy; }
    public void setCreatedBy(Employee createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}