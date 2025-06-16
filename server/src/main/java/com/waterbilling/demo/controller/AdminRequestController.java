package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.response.RequestDetailDTO;
import com.waterbilling.demo.dto.response.RequestResponseDTO;
import com.waterbilling.demo.enums.RequestStatus;
import com.waterbilling.demo.enums.RequestType;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/requests")
@PreAuthorize("hasRole('admin')")
public class AdminRequestController {

    @Autowired
    private RequestService requestService; // This is the common RequestService now

    @Autowired
    private EmployeeRepository employeeRepository;

    private Long getCurrentAdminEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName(); // Lấy username từ Principal (thường là username)
        Employee employee = employeeRepository.findByAccount_AccountId(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với ID tài khoản: " + accountId));
        return employee.getEmployeeId();
    }

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Page<RequestResponseDTO>> getAllRequests(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) RequestType requestType,
            @PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) // Cài đặt mặc định
            Pageable pageable) {
        Page<RequestResponseDTO> requestsPage = requestService.getAllRequests(searchTerm, status, requestType, pageable);
        return ResponseEntity.ok(requestsPage);
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<RequestDetailDTO> getRequestDetails(@PathVariable Long requestId) {
        RequestDetailDTO request = requestService.getRequestDetails(requestId);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<RequestResponseDTO> approveRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(requestService.approveRequest(requestId, getCurrentAdminEmployeeId()));
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<RequestResponseDTO> rejectRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(requestService.rejectRequest(requestId, getCurrentAdminEmployeeId()));
    }
}
