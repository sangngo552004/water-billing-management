package com.waterbilling.demo.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
// DTO cho kết quả yêu cầu (chung)
public class RequestResponseDTO {
    private Long requestId;
    private String requestType;
    private String status;
    private LocalDateTime createdAt;
    private String ownerFullName;
    private String customerCode;
    private String message;


}