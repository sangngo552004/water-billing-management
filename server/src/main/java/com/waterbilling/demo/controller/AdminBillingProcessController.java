package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.response.InvoiceListDTO;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.BillingProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/billing-process")
@PreAuthorize("hasRole('admin')")
public class AdminBillingProcessController {

    @Autowired
    private BillingProcessService billingProcessService;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Long getCurrentAdminEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName(); // Lấy username từ Principal (thường là username)
        Employee employee = employeeRepository.findByAccount_AccountId(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với ID tài khoản: " + accountId));
        return employee.getEmployeeId();
    }

    @PutMapping("/readings/{readingId}/confirm")
    public ResponseEntity<Void> confirmWaterMeterReading(@PathVariable Long readingId) {
        billingProcessService.confirmWaterMeterReading(readingId, getCurrentAdminEmployeeId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invoices/generate/{contractPeriodId}")
    public ResponseEntity<InvoiceListDTO> generateInvoice(@PathVariable Long contractPeriodId) {
        InvoiceListDTO invoice = billingProcessService.generateInvoice(contractPeriodId, getCurrentAdminEmployeeId());
        return new ResponseEntity<>(invoice, HttpStatus.CREATED);
    }
}

