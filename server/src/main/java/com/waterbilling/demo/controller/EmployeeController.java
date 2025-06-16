package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.PaymentInputDTO;
import com.waterbilling.demo.dto.request.WaterMeterReadingRecordRequest;
import com.waterbilling.demo.dto.request.WaterMeterReadingUpdateRequest;
import com.waterbilling.demo.dto.response.InvoiceDetailDTO;
import com.waterbilling.demo.dto.response.InvoiceListDTO;
import com.waterbilling.demo.dto.response.PeriodContractDetailResponse;
import com.waterbilling.demo.dto.response.WaterMeterReadingDTO;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.Invoice;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.service.InvoiceService;
import com.waterbilling.demo.service.PeriodContractService;
import com.waterbilling.demo.service.WaterMeterReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException; // Import exception cho validation
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError; // Dùng để lấy chi tiết lỗi validation

import jakarta.validation.Valid; // Sử dụng jakarta.validation.Valid cho Spring Boot 3.x+
// import javax.validation.Valid; // Sử dụng javax.validation.Valid cho Spring Boot 2.x

import jakarta.persistence.EntityNotFoundException; // Import thêm cho xử lý lỗi

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    @Autowired
    private  PeriodContractService periodContractService;
    @Autowired
    private  InvoiceService invoiceService;
    @Autowired
    private  WaterMeterReadingService waterMeterReadingService; // Inject service mới

    @Autowired
    private EmployeeRepository employeeRepository;

    private Long getCurrentAdminEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName();
        Employee employee = employeeRepository.findByAccount_AccountId(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với ID tài khoản: " + accountId));
        return employee.getEmployeeId();
    }

    // --- Xử lý lỗi Validation tập trung (giữ nguyên) ---
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }


    @GetMapping("/period-contracts/latest-pending")
    public ResponseEntity<Map<String, Object>> getLatestPendingPeriodContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search_owner_name,
            @RequestParam(required = false) String search_address,
            @RequestParam(required = false) String search_customer_code) {

        Pageable pageable = PageRequest.of(page, limit);
        Page<PeriodContractDetailResponse> periodContractsPage = periodContractService.getLatestPendingPeriodContractsDetail(
                search_owner_name, search_address, search_customer_code, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("total_pages", periodContractsPage.getTotalPages());
        response.put("current_page", periodContractsPage.getNumber());
        response.put("total_items", periodContractsPage.getTotalElements());
        response.put("period_contracts", periodContractsPage.getContent());

        return ResponseEntity.ok(response);
    }

    // API 2: Ghi bản ghi nước mới (cho kỳ mới nhất đang PENDING/READING)
    @PostMapping("/water-meter-readings")
    public ResponseEntity<?> recordWaterMeterReading(@Valid @RequestBody WaterMeterReadingRecordRequest request) {
        try {
            // Gọi WaterMeterReadingService
            long employeeId = getCurrentAdminEmployeeId();
            WaterMeterReadingDTO newReadingResponse = waterMeterReadingService.recordWaterMeterReading(
                    request.getAssignmentId(),
                    request.getContractPeriodId(),
                    request.getCurrentReading(),
                    request.getImage(),
                    employeeId
            );
            return new ResponseEntity<>(newReadingResponse, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // API 3: Cập nhật bản ghi nước
    @PutMapping("/water-meter-readings/{readingId}")
    public ResponseEntity<?> updateWaterMeterReading(
            @PathVariable Long readingId,
            @Valid @RequestBody WaterMeterReadingUpdateRequest request) {

        try {
            // Gọi WaterMeterReadingService
            WaterMeterReadingDTO updatedReadingResponse = waterMeterReadingService.updateWaterMeterReading(
                    readingId,
                    request.getCurrentReading(),
                    request.getImage()
            );
            return ResponseEntity.ok(updatedReadingResponse);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // API 4: Lấy danh sách PeriodContract ở trạng thái 'reading' (kỳ mới nhất)
    @GetMapping("/period-contracts/latest-reading")
    public ResponseEntity<Map<String, Object>> getLatestReadingPeriodContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search_owner_name,
            @RequestParam(required = false) String search_address,
            @RequestParam(required = false) String search_customer_code) {

        Pageable pageable = PageRequest.of(page, limit);
        Page<PeriodContractDetailResponse> periodContractsPage = periodContractService.getLatestReadingPeriodContractsDetail(
                search_owner_name, search_address, search_customer_code, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("total_pages", periodContractsPage.getTotalPages());
        response.put("current_page", periodContractsPage.getNumber());
        response.put("total_items", periodContractsPage.getTotalElements());
        response.put("period_contracts", periodContractsPage.getContent());

        return ResponseEntity.ok(response);
    }

    // API 5: Lấy danh sách Invoice để thu tiền (kỳ mới nhất)
    @GetMapping("/invoices/latest-to-collect")
    public ResponseEntity<Map<String, Object>> getLatestInvoicesToCollect(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search_owner_name,
            @RequestParam(required = false) String search_customer_code) {

        Pageable pageable = PageRequest.of(page, limit);
        Page<InvoiceListDTO> invoicesPage = invoiceService.getLatestInvoicesToCollect(
                search_owner_name, search_customer_code, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("total_pages", invoicesPage.getTotalPages());
        response.put("current_page", invoicesPage.getNumber());
        response.put("total_items", invoicesPage.getTotalElements());
        response.put("invoices", invoicesPage.getContent());

        return ResponseEntity.ok(response);
    }
    @PostMapping("/invoices/collect")
    public ResponseEntity<InvoiceDetailDTO> payInvoice(@Valid @RequestBody PaymentInputDTO paymentInput) {
        Long currentAccountId = getCurrentAdminEmployeeId();
        InvoiceDetailDTO paidInvoice = invoiceService.collectInvoicePayment(paymentInput.getInvoiceId(),currentAccountId);
        return ResponseEntity.ok(paidInvoice);
    }
}