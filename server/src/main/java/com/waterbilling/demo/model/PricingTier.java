package com.waterbilling.demo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "PricingTier")
public class PricingTier {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TierId")
    private Long tierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TypeId", nullable = false)
    private ContractType contractType;

    @Column(name = "MinUsage", nullable = false, precision = 10, scale = 2)
    private BigDecimal minUsage;

    @Column(name = "MaxUsage", precision = 10, scale = 2)
    private BigDecimal maxUsage;

    @Column(name = "PricePerM3", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerM3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy")
    private Employee createdBy;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;


}
