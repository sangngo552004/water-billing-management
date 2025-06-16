package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.InvoiceStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
public class InvoiceListDTO {
    private Long invoiceId;
    private String customerCode;
    private String periodName;
    private LocalDateTime createdAt;
    private BigDecimal totalPrice;
    private BigDecimal totalUsage;
    private InvoiceStatus status;
    private LocalDateTime paidAt;
    private String ownerName;

}
