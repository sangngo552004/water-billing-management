package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.NewContractTypeRequest;
import com.waterbilling.demo.dto.request.UpdateContractTypeNameRequest;
import com.waterbilling.demo.dto.request.UpdatePricingTiersRequest;
import com.waterbilling.demo.dto.response.ContractTypeWithPricingDTO;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.ContractTypeService;
import com.waterbilling.demo.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pricing")
@RequiredArgsConstructor
@PreAuthorize("hasRole('admin')") // Only ADMINs can access these APIs
public class AdminContractTypeController {

    private final ContractTypeService contractTypeService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private OwnerService ownerService;

    private Long getCurrentAdminEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName(); // Lấy username từ Principal (thường là username)
        Employee employee = employeeRepository.findByAccount_AccountId(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với ID tài khoản: " + accountId));
        return employee.getEmployeeId();
    }
    @GetMapping("/type")
    public ResponseEntity<List<ContractTypeWithPricingDTO>> getAllContractTypes() {
        return ResponseEntity.ok(ownerService.getContractTypesWithPricing());
    }
    @PostMapping
    public ResponseEntity<ContractTypeWithPricingDTO> addNewPricing(@Valid @RequestBody NewContractTypeRequest request) {
        Long currentEmployeeId = getCurrentAdminEmployeeId();
        ContractTypeWithPricingDTO response = contractTypeService.addNewPricing(request, currentEmployeeId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/type/{typeId}/name")
    public ResponseEntity<ContractTypeWithPricingDTO> updateContractTypeName(@PathVariable Long typeId,
                                                                       @Valid @RequestBody UpdateContractTypeNameRequest request) {
        ContractTypeWithPricingDTO response = contractTypeService.updateContractTypeName(typeId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/type/{typeId}/tiers")
    public ResponseEntity<ContractTypeWithPricingDTO> updatePricingTiers(@PathVariable Long typeId,
                                                                   @Valid @RequestBody UpdatePricingTiersRequest request) {
        Long currentEmployeeId = getCurrentAdminEmployeeId();
        ContractTypeWithPricingDTO response = contractTypeService.updatePricingTiers(typeId, request, currentEmployeeId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/type/{typeId}")
    public ResponseEntity<Void> deleteContractType(@PathVariable Long typeId) {
        contractTypeService.deleteContractType(typeId);
        return ResponseEntity.noContent().build();
    }
}
