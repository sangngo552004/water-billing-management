package com.waterbilling.demo.controller;

import com.waterbilling.demo.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/demo")
public class DemoController {

    private final InvoiceService invoiceService;

    public DemoController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/run-overdue-check")
    public ResponseEntity<String> runOverdueCheck() {
        invoiceService.updateOverdueInvoices();
        return ResponseEntity.ok("Đã chạy kiểm tra hóa đơn quá hạn!");
    }
}
