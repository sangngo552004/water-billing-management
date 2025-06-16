package com.waterbilling.demo.controller;


import com.waterbilling.demo.dto.response.InvoiceDetailDTO;
import com.waterbilling.demo.dto.response.InvoiceListDTO;
import com.waterbilling.demo.enums.InvoiceStatus;
import com.waterbilling.demo.service.InvoiceService;
import com.waterbilling.demo.service.OwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/invoices")
@PreAuthorize("hasRole('admin')")
public class AdminInvoiceController {

    @Autowired
    private InvoiceService invoiceService;
    @Autowired
    private OwnerService ownerService;


    // --- Invoice API ---
    @PutMapping("/{invoiceId}/cancel")
    public ResponseEntity<InvoiceDetailDTO> cancelInvoice(@PathVariable Long invoiceId) {
        InvoiceDetailDTO cancelledInvoice = invoiceService.cancelInvoice(invoiceId);
        return ResponseEntity.ok(cancelledInvoice);
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceListDTO>> getInvoicesForAdmin(
            @RequestParam(required = false) Optional<Long> billingPeriodId,
            @RequestParam(required = false) Optional<String> searchTerm,
            @RequestParam(required = false) Optional<InvoiceStatus> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<InvoiceListDTO> invoices = invoiceService.getInvoicesForAdmin(billingPeriodId, searchTerm, status, pageable);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceDetailDTO> getInvoiceDetail(@PathVariable Long invoiceId) {
        InvoiceDetailDTO cancelledInvoice = ownerService.getInvoiceDetails(invoiceId);
        return ResponseEntity.ok(cancelledInvoice);
    }
}
