package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.EmployeeCreateRequestDTO;
import com.waterbilling.demo.dto.request.EmployeeUpdateDTO;
import com.waterbilling.demo.dto.response.EmployeeDTO;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Account;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.UserService;
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

// --- Admin Employee Controller ---
@RestController
@RequestMapping("/api/admin/employees")
@PreAuthorize("hasRole('admin')")
public class AdminEmployeeController {

    @Autowired
    private UserService userService; // UserService handles both Owner and Employee

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
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody EmployeeCreateRequestDTO request) {
        EmployeeDTO employee = userService.createEmployee(request);
        return new ResponseEntity<>(employee, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeDTO>> getEmployees(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Optional<Boolean> isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<EmployeeDTO> employees = userService.getEmployees(searchTerm, isActive, pageable);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long employeeId) {
        return ResponseEntity.ok(userService.getEmployeeById(employeeId));
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable Long employeeId, @Valid @RequestBody EmployeeUpdateDTO request) {
        return ResponseEntity.ok(userService.updateEmployee(employeeId, request));
    }

    @PutMapping("/{ownerId}/status")
    public ResponseEntity<Void> updateStatusEmployee(@PathVariable Long ownerId) {
        userService.updateStatusEmployee(ownerId);
        return ResponseEntity.noContent().build();
    }
}
