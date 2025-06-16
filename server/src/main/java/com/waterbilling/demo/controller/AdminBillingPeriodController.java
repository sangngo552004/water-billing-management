package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.BillingPeriodCreateUpdateDTO;
import com.waterbilling.demo.dto.response.BillingPeriodDTO;
import com.waterbilling.demo.dto.response.PeriodContractDetailDTO;
import com.waterbilling.demo.dto.response.PeriodSummaryDTO;
import com.waterbilling.demo.enums.PeriodContractStatus;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.BillingPeriodService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// --- Admin Billing Period Controller ---
@RestController
@RequestMapping("/api/admin/billing-periods")
@PreAuthorize("hasRole('admin')")
public class AdminBillingPeriodController {

    @Autowired
    private BillingPeriodService billingPeriodService;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Long getCurrentAdminEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName(); // Lấy username từ Principal (thường là username)
        Employee employee = employeeRepository.findByAccount_AccountId(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với ID tài khoản: " + accountId));
        return employee.getEmployeeId();
    }

    @PostMapping
    public ResponseEntity<BillingPeriodDTO> createBillingPeriod(@Valid @RequestBody BillingPeriodCreateUpdateDTO request) {
        BillingPeriodDTO billingPeriod = billingPeriodService.createBillingPeriod(request, getCurrentAdminEmployeeId());
        return new ResponseEntity<>(billingPeriod, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<BillingPeriodDTO>> getAllBillingPeriods(
            @RequestParam Optional<Integer> year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(billingPeriodService.getAllBillingPeriods(year, pageable));
    }

    @GetMapping("/{periodId}")
    public ResponseEntity<BillingPeriodDTO> getBillingPeriodById(@PathVariable Long periodId) {
        return ResponseEntity.ok(billingPeriodService.getBillingPeriodById(periodId));
    }

    @PutMapping("/{periodId}")
    public ResponseEntity<BillingPeriodDTO> updateBillingPeriod(@PathVariable Long periodId, @Valid @RequestBody BillingPeriodCreateUpdateDTO request) {
        return ResponseEntity.ok(billingPeriodService.updateBillingPeriod(periodId, request));
    }

    @DeleteMapping("/{periodId}")
    public ResponseEntity<Void> deleteBillingPeriod(@PathVariable Long periodId) {
        billingPeriodService.deleteBillingPeriod(periodId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<List<PeriodSummaryDTO>> getSummaryBillingPeriod() {
        return ResponseEntity.ok(billingPeriodService.getAllPeriodSummary());
    }
    @GetMapping("/{billingPeriodId}/period-contracts")
    public ResponseEntity<Page<PeriodContractDetailDTO>> getPeriodContractsByBillingPeriod(
            @PathVariable Long billingPeriodId,
            @RequestParam(required = false) Optional<String> searchTerm,
            @RequestParam(required = false) Optional<PeriodContractStatus> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "contractPeriodId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<PeriodContractDetailDTO> periodContracts = billingPeriodService.getPeriodContractsByBillingPeriod(
                billingPeriodId, searchTerm, status, pageable);
        return ResponseEntity.ok(periodContracts);
    }

    @PutMapping("/period-contracts/{contractPeriodId}/block")
    public ResponseEntity<PeriodContractDetailDTO> updatePeriodContractStatusToBlocked(@PathVariable Long contractPeriodId) {
        return ResponseEntity.ok(billingPeriodService.updatePeriodContractStatusToBlocked(contractPeriodId));
    }

    @PutMapping("/{billingPeriodId}/completed")
    public ResponseEntity<BillingPeriodDTO> completeBillingPeriod(@PathVariable Long billingPeriodId) {
        return ResponseEntity.ok(billingPeriodService.completeBillingPeriod(billingPeriodId));
    }
}
