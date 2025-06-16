package com.waterbilling.demo.dto.request;

import com.waterbilling.demo.model.BillingPeriod;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

// --- Billing Period Management DTOs ---
public class BillingPeriodCreateUpdateDTO {
    @NotBlank
    @Size(max = 100)
    private String periodName;
    @NotNull
    private LocalDate toDate;


    // Getters and Setters
    public String getPeriodName() { return periodName; }
    public void setPeriodName(String periodName) { this.periodName = periodName; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

}