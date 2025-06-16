package com.waterbilling.demo.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ContractTypeWithPricingDTO {
    private Long typeId;
    private String typeName;
    private String description;
    private List<PricingTierDTO> pricingTiers;
    private LocalDateTime createdAt;
    private String createdBy;

}