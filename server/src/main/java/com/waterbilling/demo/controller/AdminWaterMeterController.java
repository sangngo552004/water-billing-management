package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.WaterMeterCreateUpdateDTO;
import com.waterbilling.demo.dto.response.ContractDTO;
import com.waterbilling.demo.dto.response.FacilityDTO;
import com.waterbilling.demo.dto.response.WaterMeterDTO;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.ContractService;
import com.waterbilling.demo.service.WaterMeterService;
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

@RestController
@RequestMapping("/api/admin/water-meters")
@PreAuthorize("hasRole('admin')")
public class AdminWaterMeterController {

    @Autowired
    private WaterMeterService waterMeterService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ContractService contractService;

    private Long getCurrentAdminEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName(); // Lấy username từ Principal (thường là username)
        Employee employee = employeeRepository.findByAccount_AccountId(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với ID tài khoản: " + accountId));
        return employee.getEmployeeId();
    }

    @PostMapping
    public ResponseEntity<WaterMeterDTO> createWaterMeter(@Valid @RequestBody WaterMeterCreateUpdateDTO request) {
        WaterMeterDTO waterMeter = waterMeterService.createWaterMeter(request, getCurrentAdminEmployeeId());
        return new ResponseEntity<>(waterMeter, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<WaterMeterDTO>> getWaterMeters(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Optional<Boolean> isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serialNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<WaterMeterDTO> waterMeters = waterMeterService.getWaterMeters(searchTerm, isActive, pageable);
        return ResponseEntity.ok(waterMeters);
    }

    @GetMapping("/{waterMeterId}")
    public ResponseEntity<WaterMeterDTO> getWaterMeterById(@PathVariable Long waterMeterId) {
        return ResponseEntity.ok(waterMeterService.getWaterMeterById(waterMeterId));
    }

    @PutMapping("/{waterMeterId}")
    public ResponseEntity<WaterMeterDTO> updateWaterMeter(@PathVariable Long waterMeterId, @Valid @RequestBody WaterMeterCreateUpdateDTO request) {
        return ResponseEntity.ok(waterMeterService.updateWaterMeter(waterMeterId, request));
    }

    @DeleteMapping("/{waterMeterId}")
    public ResponseEntity<Void> deleteWaterMeter(@PathVariable Long waterMeterId) {
        waterMeterService.deleteWaterMeter(waterMeterId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{waterMeterId}/contracts")
    public ResponseEntity<List<ContractDTO>> getActiveContractByWaterMeter(@PathVariable Long waterMeterId) {
        List<ContractDTO> contracts = contractService.getAllContractsByWaterMeter(waterMeterId);
        return ResponseEntity.ok(contracts);
    }
    @GetMapping("/not-active")
    public ResponseEntity<List<WaterMeterDTO>> getListWaterMeterNotInActive () {
        return ResponseEntity.ok(waterMeterService.getListWaterMeterNotInActive());
    }
}
