package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.ContractCreateRequestDTO;
import com.waterbilling.demo.dto.response.ContractDTO;
import com.waterbilling.demo.dto.response.ContractDetailOwnerDTO;
import com.waterbilling.demo.dto.response.WaterMeterAssignmentDTO;
import com.waterbilling.demo.dto.response.WaterMeterReadingDTO;
import com.waterbilling.demo.enums.ContractStatus;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.ContractService;
import com.waterbilling.demo.service.OwnerService;
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

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/contracts")
@PreAuthorize("hasRole('admin')")
public class AdminContractController {

    @Autowired
    private ContractService contractService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private OwnerService ownerService;

    @PostMapping("/{contractId}/water-meters/{waterMeterId}/assign")
    public ResponseEntity<WaterMeterAssignmentDTO> assignWaterMeterToContract(
            @PathVariable Long contractId,
            @PathVariable Long waterMeterId) {
        Long assignedByEmployeeId = getCurrentAdminEmployeeId();
        WaterMeterAssignmentDTO assignment = contractService.assignWaterMeterToContract(contractId, waterMeterId, assignedByEmployeeId);
        return new ResponseEntity<>(assignment, HttpStatus.CREATED);
    }

    private Long getCurrentAdminEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName(); // Lấy username từ Principal (thường là username)
        Employee employee = employeeRepository.findByAccount_AccountId(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với ID tài khoản: " + accountId));
        return employee.getEmployeeId();
    }

    @PostMapping
    public ResponseEntity<ContractDTO> createContract(@Valid @RequestBody ContractCreateRequestDTO request) {
        ContractDTO contract = contractService.createContract(request, getCurrentAdminEmployeeId());
        return new ResponseEntity<>(contract, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ContractDTO>> getContracts(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Optional<ContractStatus> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<ContractDTO> contracts;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            contracts = contractService.getContracts(searchTerm, status, pageable);
        } else {
            contracts = contractService.getContracts(null, status, pageable);
        }
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<ContractDetailOwnerDTO> getContractDetails(@PathVariable Long contractId) {

        return ResponseEntity.ok(contractService.getContractDetails(contractId));
    }

    @PutMapping("/{contractId}/suspend")
    public ResponseEntity<ContractDTO> suspendContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.suspendContract(contractId));
    }

    @PutMapping("/{contractId}/active")
    public ResponseEntity<ContractDTO> activeContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.activeContract(contractId));
    }

    @PutMapping("/{contractId}/cancel")
    public ResponseEntity<ContractDTO> cancelContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.cancelContract(contractId));
    }

    @GetMapping("/{contractId}/water-meters/{waterMeterId}/readings")
    public ResponseEntity<Page<WaterMeterReadingDTO>> getWaterMeterReadings(
            @PathVariable Long contractId,
            @PathVariable Long waterMeterId,
            @RequestParam Optional<Integer> year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ownerService.getWaterMeterReadingsByWaterMeterAndContract(contractId, waterMeterId, year, pageable));
    }
}
