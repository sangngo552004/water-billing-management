package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.NotBlank;

public class RequestStatusUpdateDTO {
    @NotBlank
    private String status; // "approved", "rejected"
    private String note; // Optional note for rejection
}