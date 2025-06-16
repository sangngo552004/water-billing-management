package com.waterbilling.demo.dto.request;

import jakarta.validation.constraints.NotNull;

public class PaymentInputDTO {

    @NotNull
    private Long invoiceId;

    // Getters and Setters
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

}
