package com.waterbilling.demo.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NewContractTypeRequest {
    @NotBlank(message = "Type name cannot be empty")
    @Size(max = 255, message = "Type name cannot exceed 255 characters")
    private String typeName;

    private String description;

    @NotEmpty(message = "At least one pricing tier must be provided")
    @Valid // Ensures validation is applied to elements within the list
    private List<PricingTierRequest> pricingTiers;

}
