package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaterMeterReadingRecordRequest {

    @NotNull(message = "Assignment ID cannot be null")
    @Min(value = 1, message = "Assignment ID must be a positive number")
    private Long assignmentId;


    @NotNull(message = "Contract Period ID cannot be null")
    @Min(value = 1, message = "Contract Period ID must be a positive number")
    private Long contractPeriodId;

    @NotNull(message = "Current reading cannot be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Current reading must be non-negative")
    private BigDecimal currentReading;

    @NotBlank(message = "Image URL cannot be blank") // Đảm bảo không null và không rỗng (sau khi trim)
    private String image;


}