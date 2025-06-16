package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// --- Facility Management DTOs ---
public class FacilityCreateUpdateDTO {
    @NotBlank
    @Size(max = 255)
    private String fullAddress;

    // Getters and Setters
    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }

}