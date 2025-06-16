package com.waterbilling.demo.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class WaterMeterReadingDTO {

    private Long readingId;
    private Long waterMeterId;
    private String serialNumber;
    private String periodName;
    private BigDecimal previousReading;
    private BigDecimal currentReading;
    private BigDecimal usage; // Calculated: current - previous
    private Boolean isConfirmed;
    private LocalDateTime createdAt;
    private String imageUrl; // For the 'Image' field

    // Getters and Setters

}
