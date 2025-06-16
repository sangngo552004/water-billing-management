package com.waterbilling.demo.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateContractTypeNameRequest {
    @NotBlank(message = "New type name cannot be empty")
    @Size(max = 255, message = "New type name cannot exceed 255 characters")
    private String newTypeName;
}