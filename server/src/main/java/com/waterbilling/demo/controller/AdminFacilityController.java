package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.FacilityCreateUpdateDTO;
import com.waterbilling.demo.dto.response.ContractDTO;
import com.waterbilling.demo.dto.response.FacilityDTO;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.ContractService;
import com.waterbilling.demo.service.FacilityService;
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

// --- Admin Facility Controller ---
@RestController
@RequestMapping("/api/admin/facilities")
@PreAuthorize("hasRole('admin')")
public class AdminFacilityController {

    @Autowired
    private FacilityService facilityService;

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
    public ResponseEntity<FacilityDTO> createFacility(@Valid @RequestBody FacilityCreateUpdateDTO request) {
        FacilityDTO facility = facilityService.createFacility(request, getCurrentAdminEmployeeId());
        return new ResponseEntity<>(facility, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<FacilityDTO>> getFacilities(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Optional<Boolean> isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullAddress") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<FacilityDTO> facilities = facilityService.getFacilities(searchTerm, isActive, pageable);
        return ResponseEntity.ok(facilities);
    }

    @GetMapping("/{facilityId}")
    public ResponseEntity<FacilityDTO> getFacilityById(@PathVariable Long facilityId) {
        return ResponseEntity.ok(facilityService.getFacilityById(facilityId));
    }

    @PutMapping("/{facilityId}")
    public ResponseEntity<FacilityDTO> updateFacility(@PathVariable Long facilityId, @Valid @RequestBody FacilityCreateUpdateDTO request) {
        return ResponseEntity.ok(facilityService.updateFacility(facilityId, request));
    }

    @DeleteMapping("/{facilityId}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long facilityId) {
        facilityService.deleteFacility(facilityId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{facilityId}/contracts")
    public ResponseEntity<List<ContractDTO>> getContractsByFacility(@PathVariable Long facilityId) {
        List<ContractDTO> contracts = contractService.getContractsByFacility(facilityId);
        return ResponseEntity.ok(contracts);
    }
    @GetMapping("/not-active")
    public ResponseEntity<List<FacilityDTO>> getListFacityNotInActive () {
        List<FacilityDTO> facilitesDTO = facilityService.getListFacityNotInActive();
        return ResponseEntity.ok(facilitesDTO);
    }
}
