package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.NotNull;

public class WaterMeterReadingConfirmRequestDTO {
    @NotNull
    private Long readingId;
    // No explicit confirmBy/confirmAt needed, will be handled by service
}
