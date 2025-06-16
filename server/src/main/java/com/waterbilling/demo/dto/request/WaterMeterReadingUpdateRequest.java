package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaterMeterReadingUpdateRequest {

    @NotNull(message = "Current reading cannot be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Current reading must be non-negative")
    private BigDecimal currentReading;


    @NotBlank(message = "Image URL cannot be blank if provided")
    private String image;


}