package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class ContractCreateRequestDTO {
    @NotNull
    private Long ownerId;
    @NotNull
    private Long facilityId;
    @NotNull
    private Long contractTypeId;

    @NotBlank @Size(max = 255)
    private String image;
    @NotNull
    private LocalDate startDate;

    // Getters and Setters
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public Long getContractTypeId() { return contractTypeId; }
    public void setContractTypeId(Long contractTypeId) { this.contractTypeId = contractTypeId; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
}

