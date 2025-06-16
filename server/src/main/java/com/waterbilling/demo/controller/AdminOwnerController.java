package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.OwnerCreateRequestDTO;
import com.waterbilling.demo.dto.request.OwnerUpdateDTO;
import com.waterbilling.demo.dto.response.ContractDTO;
import com.waterbilling.demo.dto.response.OwnerDTO;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.ContractService;
import com.waterbilling.demo.service.UserService;
import jakarta.validation.Valid;
import org.apache.catalina.User;
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
@RequestMapping("/api/admin/owners")
@PreAuthorize("hasRole('admin')")
public class AdminOwnerController {

    @Autowired
    private UserService userService;

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
    public ResponseEntity<OwnerDTO> createOwner(@Valid @RequestBody OwnerCreateRequestDTO request) {
        OwnerDTO owner = userService.createOwner(request, getCurrentAdminEmployeeId());
        return new ResponseEntity<>(owner, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<OwnerDTO>> getOwners(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Optional<Boolean> isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<OwnerDTO> owners = userService.getOwners(searchTerm, isActive, pageable);
        return ResponseEntity.ok(owners);
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<OwnerDTO> getOwnerById(@PathVariable Long ownerId) {
        return ResponseEntity.ok(userService.getOwnerById(ownerId));
    }

    @PutMapping("/{ownerId}")
    public ResponseEntity<OwnerDTO> updateOwner(@PathVariable Long ownerId, @Valid @RequestBody OwnerUpdateDTO request) {
        return ResponseEntity.ok(userService.updateOwner(ownerId, request));
    }

    @DeleteMapping("/{ownerId}")
    public ResponseEntity<Void> deleteOwner(@PathVariable Long ownerId) {
        userService.deleteOwner(ownerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ownerId}/contracts")
    public ResponseEntity<List<ContractDTO>> getContractsByOwner(@PathVariable Long ownerId) {
        List<ContractDTO> contracts = contractService.getContractsByOwner(ownerId);
        return ResponseEntity.ok(contracts);
    }

    @PutMapping("/{ownerId}/status")
    public ResponseEntity<Void> updateStatusOwner(@PathVariable Long ownerId) {
        userService.updateStatusOwner(ownerId);
        return ResponseEntity.noContent().build();
    }
}