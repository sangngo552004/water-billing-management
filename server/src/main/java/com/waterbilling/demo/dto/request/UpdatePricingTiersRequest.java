package com.waterbilling.demo.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdatePricingTiersRequest {
    @NotEmpty(message = "At least one new pricing tier must be provided")
    @Valid
    private List<PricingTierRequest> newPricingTiers;

}
