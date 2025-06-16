package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.InvoiceStatus;
import com.waterbilling.demo.enums.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class InvoiceDetailDTO {
    private Long invoiceId;
    private String customerCode;
    private String ownerName;
    private String facilityAddress;
    private String periodName;
    private LocalDateTime createdAt;
    private BigDecimal totalPrice;
    private BigDecimal totalUsage;
    private InvoiceStatus status;
    private PaymentMethod paymentMethod;
    private LocalDateTime paidAt;
    private List<WaterMeterReadingDTO> waterMeterReadings;
    private List<InvoicePricingDetailDTO> pricingDetails;


}