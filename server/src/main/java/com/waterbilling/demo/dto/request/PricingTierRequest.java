package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PricingTierRequest {
    @NotNull(message = "Min usage cannot be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Min usage must be non-negative")
    private BigDecimal minUsage;

    @DecimalMin(value = "0.0", inclusive = false, message = "Max usage must be positive")
    private BigDecimal maxUsage; // Can be null for the last tier

    @NotNull(message = "Price per M3 cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price per M3 must be positive")
    private BigDecimal pricePerM3;
}