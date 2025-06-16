package com.waterbilling.demo.dto.response;

import lombok.Builder;

@lombok.Getter
@lombok.Setter
@Builder
public class OwnerInfoResponse {

    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
}
