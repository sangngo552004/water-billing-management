package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.*;

// --- Water Meter Management DTOs ---
public class WaterMeterCreateUpdateDTO {
    @NotBlank
    @Size(max = 50)
    private String serialNumber;

    // Getters and Setters
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

}

