package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.request.ChangeInfoRequestInputDTO;
import com.waterbilling.demo.dto.request.PaymentInputDTO;
import com.waterbilling.demo.dto.request.StopServiceRequestInputDTO;
import com.waterbilling.demo.dto.response.*;
import com.waterbilling.demo.enums.NotificationType;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Account;
import com.waterbilling.demo.repository.AccountRepository;
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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('owner')") // Đảm bảo chỉ user có role OWNER mới truy cập được các API này
public class OwnerController {

    @Autowired
    private OwnerService ownerService;

    @Autowired
    private AccountRepository accountRepository;

    // Helper to get authenticated account ID
    private Long getCurrentAccountId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String accountId = authentication.getName(); // Lấy username từ Principal (thường là username)
        Account account = accountRepository.findById(Long.valueOf(accountId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + accountId));
        return account.getAccountId();
    }


    // --- Xem chi tiết hợp đồng ---
    @GetMapping("/contracts/{contractId}")
    public ResponseEntity<ContractDetailOwnerDTO> getContractDetails(@PathVariable Long contractId) {
        Long currentAccountId = getCurrentAccountId();
        ContractDetailOwnerDTO contractDetails = ownerService.getContractDetails(contractId, currentAccountId);
        return ResponseEntity.ok(contractDetails);
    }

    // --- Lấy ra danh sách hóa đơn theo năm có thể tìm kiếm theo mã hóa đơn ---
    @GetMapping("/contracts/{contractId}/invoices")
    public ResponseEntity<Page<InvoiceListDTO>> getInvoices(
            @PathVariable Long contractId,
            @RequestParam(required = true) int year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Long currentAccountId = getCurrentAccountId();
        return ResponseEntity.ok(ownerService.getInvoicesByContractAndYear(contractId, year, pageable, currentAccountId));
    }

    // --- Xem chi tiết hóa đơn ---
    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<InvoiceDetailDTO> getInvoiceDetails(@PathVariable Long invoiceId) {

        return ResponseEntity.ok(ownerService.getInvoiceDetails(invoiceId));
    }

    @GetMapping("/contracts/{contractId}/invoices/newest")
    public ResponseEntity<InvoiceDetailDTO> getNewestInvoiceOfContract(@PathVariable Long contractId) {

        return ResponseEntity.ok(ownerService.getNewestInvoice(contractId));
    }

    // --- Lấy ra thông báo theo mã hợp đồng có bộ lọc theo type phân trang limit ---
    @GetMapping("/contracts/{contractId}/notifications")
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @PathVariable Long contractId,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Long currentAccountId = getCurrentAccountId();
        return ResponseEntity.ok(ownerService.getNotificationsByContract(contractId, type, pageable, currentAccountId));
    }
    
    // --- Lấy ra danh sách đồng hồ nước của theo hợp đồng ---
    @GetMapping("/contracts/{contractId}/water-meters")
    public ResponseEntity<List<WaterMeterAssignmentDTO>> getWaterMetersAssignedToContract(@PathVariable Long contractId) {
        Long currentAccountId = getCurrentAccountId();
        return ResponseEntity.ok(ownerService.getWaterMetersAssignedToContract(contractId, currentAccountId));
    }

    // --- Thanh toán hóa đơn ---
    // (Chỉ nếu bạn có cổng thanh toán online hoặc muốn Owner xác nhận đã thanh toán)
    @PostMapping("/invoices/pay")
    public ResponseEntity<InvoiceListDTO> payInvoice(@Valid @RequestBody PaymentInputDTO paymentInput) {
        Long currentAccountId = getCurrentAccountId();
        InvoiceListDTO paidInvoice = ownerService.payInvoice(paymentInput, currentAccountId);
        return ResponseEntity.ok(paidInvoice);
    }

    // --- Gửi yêu cầu thay đổi thông tin ---
    @PostMapping("/requests/change-info")
    public ResponseEntity<RequestResponseDTO> submitChangeInfoRequest(@Valid @RequestBody ChangeInfoRequestInputDTO requestInput) {
        Long currentAccountId = getCurrentAccountId();
        RequestResponseDTO response = ownerService.submitChangeInfoRequest(requestInput, currentAccountId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // --- Gửi yêu cầu dừng dịch vụ ---
    @PostMapping("/requests/stop-service")
    public ResponseEntity<RequestResponseDTO> submitStopServiceRequest(@Valid @RequestBody StopServiceRequestInputDTO requestInput) {
        Long currentAccountId = getCurrentAccountId();
        RequestResponseDTO response = ownerService.submitStopServiceRequest(requestInput, currentAccountId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // --- Lấy ra danh sách bản ghi nước theo đồng hồ nước và mã hợp đồng ---
    @GetMapping("/contracts/{contractId}/water-meters/{waterMeterId}/readings")
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

    @GetMapping("/contract-types-with-pricing")
    public ResponseEntity<List<ContractTypeWithPricingDTO>> getContractTypesWithPricing() {
        List<ContractTypeWithPricingDTO> contractTypes = ownerService.getContractTypesWithPricing();
        return ResponseEntity.ok(contractTypes);
    }

    @GetMapping("/contracts/summary")
    public ResponseEntity<List<OwnerContractSummaryDTO>> getOwnerContractsSummary() {
        Long currentAccountId = getCurrentAccountId();
        List<OwnerContractSummaryDTO> contractsSummary = ownerService.getOwnerContractsSummary(currentAccountId);
        return ResponseEntity.ok(contractsSummary);
    }

    // --- API lấy ra dữ liệu nước để làm biểu đồ ---
    @GetMapping("/contracts/{contractId}/water-usage-chart")
    public ResponseEntity<WaterUsageChartDataDTO> getWaterUsageDataForChart(
            @PathVariable Long contractId,
            @RequestParam int year) {
        Long currentAccountId = getCurrentAccountId();
        WaterUsageChartDataDTO chartData = ownerService.getWaterUsageDataForChart(contractId, year, currentAccountId);
        return ResponseEntity.ok(chartData);
    }

    @GetMapping("/contracts/{contractId}/count-unread-notifications")
    public ResponseEntity<CountUnreadNotificationResponse> countUnreadNotifications(
            @PathVariable Long contractId
            ) {
        return ResponseEntity.ok(ownerService.countUnreadNotifications(contractId));
    }

    // --- API cho owner đánh dấu để đọc thống báo ---
    @PutMapping("/notifications/{notificationId}/mark-as-read")
    public ResponseEntity<NotificationDTO> markNotificationAsRead(@PathVariable Long notificationId) {
        Long currentAccountId = getCurrentAccountId();
        NotificationDTO updatedNotification = ownerService.markNotificationAsRead(notificationId, currentAccountId);
        return ResponseEntity.ok(updatedNotification);
    }

    @GetMapping("/contracts/{contractId}/owner-info")
    public ResponseEntity<OwnerInfoResponse> getOwnerInfo(@PathVariable Long contractId) {
        Long currentAccountId = getCurrentAccountId();
        OwnerInfoResponse ownerInfoResponse = ownerService.getOwnerInfo(contractId, currentAccountId);
        return ResponseEntity.ok(ownerInfoResponse);
    }
}
