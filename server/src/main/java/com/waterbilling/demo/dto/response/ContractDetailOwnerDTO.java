package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.ContractStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ContractDetailOwnerDTO {
    private Long contractId;
    private String customerCode;
    private LocalDate startDate;
    private ContractStatus status;
    private String facilityAddress;
    private String ownerFullName;
    private String ownerEmail;
    private String ownerPhoneNumber;
    private String identityNumber;
    private String image;
    private String contractTypeName;
    private List<WaterMeterAssignmentDTO> waterMeters;


}