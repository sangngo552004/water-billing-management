package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.request.ChangeInfoRequestInputDTO;
import com.waterbilling.demo.dto.request.OwnerRegisterInputDTO;
import com.waterbilling.demo.dto.request.PaymentInputDTO;
import com.waterbilling.demo.dto.request.StopServiceRequestInputDTO;
import com.waterbilling.demo.dto.response.*;
import com.waterbilling.demo.enums.*;
import com.waterbilling.demo.exception.DuplicateResourceException;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.exception.UnauthorizedAccessException;
import com.waterbilling.demo.model.*;
import com.waterbilling.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OwnerService { // Đổi tên thành CustomerService nếu bạn muốn

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ContractTypeRepository contractTypeRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ContractRepository contractRepository;
    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private WaterMeterAssignmentRepository waterMeterAssignmentRepository;
    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;
    @Autowired
    private PricingTierRepository pricingTierRepository;
    @Autowired
    private RequestRepository requestRepository;
    @Autowired
    private ChangeInfoRequestRepository changeInfoRequestRepository;
    @Autowired
    private StopServiceRequestRepository stopServiceRequestRepository;
    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private PeriodContractRepository periodContractRepository;


    // --- Helper for Authorization ---
    private void authorizeOwnerAccessToContract(Long contractId, Long currentAccountId) {
        // Find the owner associated with the currentAccountId
        Owner currentOwner = ownerRepository.findByAccountId(currentAccountId)
                .orElseThrow(() -> new UnauthorizedAccessException("Owner not found for the authenticated account."));

        // Find the contract
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        // Check if the current owner is indeed the owner of this contract
        if (!contract.getOwner().getOwnerId().equals(currentOwner.getOwnerId())) {
            throw new UnauthorizedAccessException("You are not authorized to access this contract.");
        }
    }

    // --- Xem chi tiết hợp đồng ---
    public ContractDetailOwnerDTO getContractDetails(Long contractId, Long currentAccountId) {
        authorizeOwnerAccessToContract(contractId, currentAccountId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        ContractDetailOwnerDTO dto = new ContractDetailOwnerDTO();
        dto.setContractId(contract.getContractId());
        dto.setCustomerCode(contract.getCustomerCode());
        dto.setStartDate(contract.getStartDate());
        dto.setStatus(contract.getStatus());
        dto.setFacilityAddress(contract.getFacility() != null ? contract.getFacility().getFullAddress() : null);
        dto.setOwnerFullName(contract.getOwner() != null ? contract.getOwner().getFullName() : null);
        dto.setOwnerEmail(contract.getOwner() != null ? contract.getOwner().getEmail() : null);
        dto.setOwnerPhoneNumber(contract.getOwner() != null ? contract.getOwner().getPhoneNumber() : null);
        dto.setIdentityNumber(contract.getOwner() != null ? contract.getOwner().getIdentityNumber() : null);

        // Lấy danh sách đồng hồ nước gắn với hợp đồng
        List<WaterMeterAssignment> assignments = waterMeterAssignmentRepository.findByContract_ContractId(contractId);
        List<WaterMeterAssignmentDTO> waterMeterDTOs = assignments.stream()
                .map(assignment -> {
                    WaterMeterAssignmentDTO wmDto = new WaterMeterAssignmentDTO();
                    wmDto.setAssignmentId(assignment.getAssignmentId());
                    wmDto.setWaterMeterId(assignment.getWaterMeter().getWaterMeterId());
                    wmDto.setSerialNumber(assignment.getWaterMeter().getSerialNumber());
                    wmDto.setCurrentReading(assignment.getCurrentReading());
                    wmDto.setIsActive(assignment.getIsActive());
                    return wmDto;
                })
                .collect(Collectors.toList());
        dto.setWaterMeters(waterMeterDTOs);

        return dto;
    }

    // --- Lấy ra danh sách hóa đơn theo năm có thể tìm kiếm theo mã hóa đơn ---
    public Page<InvoiceListDTO> getInvoicesByContractAndYear(Long contractId, int year, Pageable pageable, Long currentAccountId) {
        authorizeOwnerAccessToContract(contractId, currentAccountId);

        // For simplicity, assuming invoiceCode search means customerCode or part of it.
        // You might need a more complex query if invoiceCode is a specific generated ID
        Page<Invoice> invoicesPage;

        invoicesPage = invoiceRepository.findByContractIdAndYear(contractId, year, pageable);


        return invoicesPage.map(invoice -> {
            InvoiceListDTO dto = new InvoiceListDTO();
            dto.setInvoiceId(invoice.getInvoiceId());
            dto.setPeriodName(invoice.getContractPeriod().getBillingPeriod().getPeriodName());
            dto.setCreatedAt(invoice.getCreatedAt());
            dto.setTotalPrice(invoice.getTotalPrice());
            dto.setTotalUsage(invoice.getTotalUsage());
            dto.setStatus(invoice.getStatus());
            dto.setPaidAt(invoice.getPaidAt());
            return dto;
        });
    }

    // --- Xem chi tiết hóa đơn ---
    public InvoiceDetailDTO getInvoiceDetails(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));


        InvoiceDetailDTO dto = new InvoiceDetailDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setCustomerCode(invoice.getContractPeriod().getContract().getCustomerCode());
        dto.setPeriodName(invoice.getContractPeriod().getBillingPeriod().getPeriodName());
        dto.setOwnerName(invoice.getContractPeriod().getContract().getOwner().getFullName());
        dto.setFacilityAddress(invoice.getContractPeriod().getContract().getFacility().getFullAddress());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setTotalPrice(invoice.getTotalPrice());
        dto.setTotalUsage(invoice.getTotalUsage());
        dto.setStatus(invoice.getStatus());
        dto.setPaymentMethod(invoice.getPaymentMethod());
        dto.setPaidAt(invoice.getPaidAt());

        List<WaterMeterReading> waterMeterReadings = waterMeterReadingRepository.findByContractPeriod(invoice.getContractPeriod());
        List<WaterMeterReadingDTO> waterMeterReadingDTOS = waterMeterReadings.stream()
                .map(reading -> {
                    WaterMeterReadingDTO wtrDto = new WaterMeterReadingDTO();
                    wtrDto.setSerialNumber(reading.getAssignment().getWaterMeter().getSerialNumber());
                    wtrDto.setPreviousReading(reading.getPreviousReading());
                    wtrDto.setCurrentReading(reading.getCurrentReading());
                    wtrDto.setUsage(reading.getCurrentReading().subtract(reading.getPreviousReading()));
                    return wtrDto;
                })
                .toList();
        dto.setWaterMeterReadings(waterMeterReadingDTOS);
        List<InvoicePricingDetailDTO> pricingDetails = invoice.getInvoicePricingDetails().stream()
                .map(detail -> {
                    InvoicePricingDetailDTO detailDto = new InvoicePricingDetailDTO();
                    detailDto.setTierId(detail.getPricingTier().getTierId());
                    detailDto.setMinUsage(detail.getPricingTier().getMinUsage());
                    detailDto.setMaxUsage(detail.getPricingTier().getMaxUsage());
                    detailDto.setPricePerM3(detail.getPricingTier().getPricePerM3());
                    detailDto.setUsageOfTier(detail.getUsageOfTier());
                    detailDto.setPrice(detail.getPrice());
                    return detailDto;
                })
                .collect(Collectors.toList());
        dto.setPricingDetails(pricingDetails);

        return dto;
    }

    public InvoiceDetailDTO getNewestInvoice(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));
        Invoice invoice = invoiceRepository.findTopByContractPeriod_ContractOrderByInvoiceIdDesc(contract)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng chưa có hóa đơn "));


        InvoiceDetailDTO dto = new InvoiceDetailDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setCustomerCode(invoice.getContractPeriod().getContract().getCustomerCode());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setTotalPrice(invoice.getTotalPrice());
        dto.setPeriodName(invoice.getContractPeriod().getBillingPeriod().getPeriodName());
        dto.setTotalUsage(invoice.getTotalUsage());
        dto.setStatus(invoice.getStatus());
        dto.setPaymentMethod(invoice.getPaymentMethod());
        dto.setPaidAt(invoice.getPaidAt());

        List<WaterMeterReading> waterMeterReadings = waterMeterReadingRepository.findByContractPeriod(invoice.getContractPeriod());
        List<WaterMeterReadingDTO> waterMeterReadingDTOS = waterMeterReadings.stream()
                .map(reading -> {
                    WaterMeterReadingDTO wtrDto = new WaterMeterReadingDTO();
                    wtrDto.setSerialNumber(reading.getAssignment().getWaterMeter().getSerialNumber());
                    wtrDto.setPreviousReading(reading.getPreviousReading());
                    wtrDto.setCurrentReading(reading.getCurrentReading());
                    wtrDto.setUsage(reading.getCurrentReading().subtract(reading.getPreviousReading()));
                    return wtrDto;
                })
                .toList();
        dto.setWaterMeterReadings(waterMeterReadingDTOS);
        List<InvoicePricingDetailDTO> pricingDetails = invoice.getInvoicePricingDetails().stream()
                .map(detail -> {
                    InvoicePricingDetailDTO detailDto = new InvoicePricingDetailDTO();
                    detailDto.setTierId(detail.getPricingTier().getTierId());
                    detailDto.setMinUsage(detail.getPricingTier().getMinUsage());
                    detailDto.setMaxUsage(detail.getPricingTier().getMaxUsage());
                    detailDto.setPricePerM3(detail.getPricingTier().getPricePerM3());
                    detailDto.setUsageOfTier(detail.getUsageOfTier());
                    detailDto.setPrice(detail.getPrice());
                    return detailDto;
                })
                .collect(Collectors.toList());
        dto.setPricingDetails(pricingDetails);

        return dto;
    }
    // --- Lấy ra thông báo theo mã hợp đồng có bộ lọc theo type phân trang limit ---
    public Page<NotificationDTO> getNotificationsByContract(Long contractId, NotificationType type, Pageable pageable, Long currentAccountId) {
        authorizeOwnerAccessToContract(contractId, currentAccountId);

        Page<Notification> notificationsPage;
        if (type != null) {
            notificationsPage = notificationRepository.findByContract_ContractIdAndNotificationType(contractId, type, pageable);
        } else {
            notificationsPage = notificationRepository.findByContract_ContractId(contractId, pageable);
        }

        return notificationsPage.map(notification -> {
            NotificationDTO dto = new NotificationDTO();
            dto.setNotificationId(notification.getNotificationId());
            dto.setTitle(notification.getTitle());
            dto.setContent(notification.getContent());
            dto.setNotificationType(notification.getNotificationType());
            dto.setCreatedAt(notification.getCreatedAt());
            dto.setIsRead(notification.getIsRead());
            return dto;
        });
    }

    // --- Lấy ra danh sách đồng hồ nước của theo hợp đồng ---
    public List<WaterMeterAssignmentDTO> getWaterMetersAssignedToContract(Long contractId, Long currentAccountId) {
        authorizeOwnerAccessToContract(contractId, currentAccountId);

        List<WaterMeterAssignment> assignments = waterMeterAssignmentRepository.findByContract_ContractId(contractId);

        return assignments.stream()
                .map(assignment -> {
                    WaterMeterAssignmentDTO dto = new WaterMeterAssignmentDTO();
                    dto.setAssignmentId(assignment.getAssignmentId());
                    dto.setWaterMeterId(assignment.getWaterMeter().getWaterMeterId());
                    dto.setSerialNumber(assignment.getWaterMeter().getSerialNumber());
                    dto.setCurrentReading(assignment.getCurrentReading());
                    dto.setIsActive(assignment.getIsActive());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    // --- Thanh toán hóa đơn (chức năng này thường được gọi từ Admin/Employee sau khi thu tiền, Owner chỉ xem trạng thái) ---
    // Tuy nhiên, nếu có cổng thanh toán online, Owner có thể tự thanh toán.
    // Giả sử đây là một API để Owner xác nhận đã thanh toán qua một cổng khác.

    @Transactional
    public InvoiceListDTO payInvoice(PaymentInputDTO paymentInput, Long currentAccountId) {
        Invoice invoice = invoiceRepository.findById(paymentInput.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + paymentInput.getInvoiceId()));

        authorizeOwnerAccessToContract(invoice.getContractPeriod().getContract().getContractId(), currentAccountId);

        if (invoice.getStatus() != InvoiceStatus.unpaid && invoice.getStatus() != InvoiceStatus.overdue) {
            throw new InvalidRequestException("Invoice cannot be paid. Current status: " + invoice.getStatus());
        }

        invoice.setStatus(InvoiceStatus.paid);
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setPaymentMethod(PaymentMethod.CK);

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        // Update PeriodContract status to 'paid'
        PeriodContract periodContract = updatedInvoice.getContractPeriod();
        if (periodContract != null) {
            periodContract.setStatus(PeriodContractStatus.paid);
            periodContractRepository.save(periodContract);
        }

        InvoiceListDTO dto = new InvoiceListDTO();
        dto.setInvoiceId(updatedInvoice.getInvoiceId());
        dto.setCustomerCode(updatedInvoice.getContractPeriod().getContract().getCustomerCode());
        dto.setCreatedAt(updatedInvoice.getCreatedAt());
        dto.setTotalPrice(updatedInvoice.getTotalPrice());
        dto.setTotalUsage(updatedInvoice.getTotalUsage());
        dto.setStatus(updatedInvoice.getStatus());
        dto.setPaidAt(updatedInvoice.getPaidAt());
        return dto;
    }

    // --- Gửi yêu cầu thay đổi thông tin ---
    @Transactional
    public RequestResponseDTO submitChangeInfoRequest(ChangeInfoRequestInputDTO requestInput, Long currentAccountId) {
        authorizeOwnerAccessToContract(requestInput.getContractId(), currentAccountId);

        Contract contract = contractRepository.findById(requestInput.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + requestInput.getContractId()));

        if (contract.getStatus() != ContractStatus.active) {
            throw new InvalidRequestException("Không thể gửi yêu cầu vì hợp đồng đang không hoạt động");
        }

        // Get current owner info
        Owner currentOwner = contract.getOwner();

        ChangeInfoRequest changeRequest = new ChangeInfoRequest();
        changeRequest.setContract(contract);
        changeRequest.setRequestType(RequestType.ChangeInfo);
        changeRequest.setOldFullName(currentOwner.getFullName());
        changeRequest.setOldEmail(currentOwner.getEmail());
        changeRequest.setOldPhoneNumber(currentOwner.getPhoneNumber());
        changeRequest.setNewFullName(requestInput.getNewFullName());
        changeRequest.setNewEmail(requestInput.getNewEmail());
        changeRequest.setNewPhoneNumber(requestInput.getNewPhoneNumber());

        changeInfoRequestRepository.save(changeRequest); // Saves both Request and ChangeInfoRequest

        RequestResponseDTO response = new RequestResponseDTO();
        response.setRequestId(changeRequest.getRequestId());
        response.setRequestType(changeRequest.getRequestType().name());
        response.setStatus(changeRequest.getStatus().name());
        response.setCreatedAt(changeRequest.getCreatedAt());
        response.setMessage("Change information request submitted successfully. Awaiting admin approval.");
        return response;
    }

    // --- Gửi yêu cầu dừng dịch vụ ---
    @Transactional
    public RequestResponseDTO submitStopServiceRequest(StopServiceRequestInputDTO requestInput, Long currentAccountId) {
        authorizeOwnerAccessToContract(requestInput.getContractId(), currentAccountId);

        Contract contract = contractRepository.findById(requestInput.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + requestInput.getContractId()));

        if (contract.getStatus() != ContractStatus.active) {
            throw new InvalidRequestException("Không thể gửi yêu cầu vì hợp đồng đang không hoạt động.");
        }

        StopServiceRequest stopRequest = new StopServiceRequest();
        stopRequest.setContract(contract);
        stopRequest.setRequestType(RequestType.StopService);
        stopRequest.setReason(requestInput.getReason());

        stopServiceRequestRepository.save(stopRequest); // Saves both Request and StopServiceRequest

        RequestResponseDTO response = new RequestResponseDTO();
        response.setRequestId(stopRequest.getRequestId());
        response.setRequestType(stopRequest.getRequestType().name());
        response.setStatus(stopRequest.getStatus().name());
        response.setCreatedAt(stopRequest.getCreatedAt());
        response.setMessage("Stop service request submitted successfully. Awaiting admin approval.");
        return response;
    }

    // --- Lấy ra danh sách bản ghi nước theo đồng hồ nước và mã hợp đồng có bộ lọc theo năm ---
    public Page<WaterMeterReadingDTO> getWaterMeterReadingsByWaterMeterAndContract(
            Long contractId, Long waterMeterId, Optional<Integer> year, Pageable pageable) {


        // Verify waterMeterId belongs to the specified contract
        WaterMeterAssignment assignment = waterMeterAssignmentRepository
                .findByContract_ContractIdAndWaterMeter_WaterMeterId(contractId, waterMeterId)
                .orElseThrow(() -> new ResourceNotFoundException("Water meter " + waterMeterId + " is not assigned to contract " + contractId));

        Page<WaterMeterReading> readingsPage;
        if (year.isPresent()) {
            readingsPage = waterMeterReadingRepository.findByAssignment_AssignmentIdAndCreatedAt_Year(
                    assignment.getAssignmentId(), year.get(), pageable);
        } else {
            readingsPage = waterMeterReadingRepository.findByAssignment_AssignmentId(
                    assignment.getAssignmentId(), pageable);
        }

        return readingsPage.map(reading -> {
            WaterMeterReadingDTO dto = new WaterMeterReadingDTO();
            dto.setReadingId(reading.getReadingId());
            dto.setPeriodName(reading.getContractPeriod().getBillingPeriod().getPeriodName());
            dto.setWaterMeterId(reading.getAssignment().getWaterMeter().getWaterMeterId());
            dto.setSerialNumber(reading.getAssignment().getWaterMeter().getSerialNumber());
            dto.setPreviousReading(reading.getPreviousReading());
            dto.setCurrentReading(reading.getCurrentReading());
            dto.setUsage(reading.getCurrentReading().subtract(reading.getPreviousReading()));
            dto.setIsConfirmed(reading.getIsConfirm());
            dto.setCreatedAt(reading.getCreatedAt());
            dto.setImageUrl(reading.getImage());
            return dto;
        });
    }

    // --- Đăng ký tài khoản Owner mới ---
    @Transactional
    public OwnerRegisterResponseDTO registerOwner(OwnerRegisterInputDTO registerDTO) {

        if (accountRepository.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Tên đăng nhập '" + registerDTO.getUsername() + "' đã tồn tại.");
        }

        Optional<Owner> existingOwnerOpt = ownerRepository.findByIdentityNumber(registerDTO.getIdentityNumber());

        if (existingOwnerOpt.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin với CCCD " + registerDTO.getIdentityNumber() );
        }

        Owner existingOwner = existingOwnerOpt.get();


        if (existingOwner.getAccountId() != null) {
            throw new DuplicateResourceException("Khách hàng đã có tài khoản");
        }

        if (!existingOwner.getFullName().equalsIgnoreCase(registerDTO.getFullName()) ||
                !existingOwner.getEmail().equalsIgnoreCase(registerDTO.getEmail()) ||
                !existingOwner.getPhoneNumber().equals(registerDTO.getPhoneNumber())) {
            throw new InvalidRequestException("Các thông tin khác như (Tên, Email, SDT) không phù hợp với khách hàng đã đăng ký ban đầu");
        }

        // 5. Tạo Account mới
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        Account newAccount = new Account();
        newAccount.setUsername(registerDTO.getUsername());
        newAccount.setPassword(passwordEncoder.encode(registerDTO.getPassword())); // Mã hóa mật khẩu
        Role ownerRole = roleRepository.findByRoleName("OWNER")
                .orElseThrow(() -> new ResourceNotFoundException("Role 'OWNER' not found. Ensure the role exists in the database."));
        newAccount.setRole(ownerRole);
        newAccount.setIsActive(true);

        Account savedAccount = accountRepository.save(newAccount);

        existingOwner.setAccountId(savedAccount.getAccountId());
        existingOwner.setActive(true);

        Owner updatedOwner = ownerRepository.save(existingOwner);

        OwnerRegisterResponseDTO responseDTO = new OwnerRegisterResponseDTO();
        responseDTO.setOwnerId(updatedOwner.getOwnerId());
        responseDTO.setUsername(savedAccount.getUsername());
        responseDTO.setFullName(updatedOwner.getFullName());
        responseDTO.setEmail(updatedOwner.getEmail());
        responseDTO.setPhoneNumber(updatedOwner.getPhoneNumber());
        responseDTO.setMessage("Owner account registered successfully. You can now login.");
        return responseDTO;
    }

    // --- Lấy ra danh sách các loại hợp đồng và giá của từng loại ---
    public List<ContractTypeWithPricingDTO> getContractTypesWithPricing() {
        List<ContractType> contractTypes = contractTypeRepository.findAll();

        return contractTypes.stream()
                .map(contractType -> {
                    ContractTypeWithPricingDTO dto = new ContractTypeWithPricingDTO();
                    dto.setTypeId(contractType.getTypeId());
                    dto.setTypeName(contractType.getTypeName());
                    dto.setDescription(contractType.getDescription());

                    List<PricingTier> activeTiers = pricingTierRepository.findByContractTypeAndIsActiveTrue(contractType);

                    List<PricingTierDTO> pricingTierDTOs = activeTiers.stream()
                            .map(tier -> {
                                PricingTierDTO tierDto = new PricingTierDTO();
                                tierDto.setTierId(tier.getTierId());
                                tierDto.setMinUsage(tier.getMinUsage());
                                tierDto.setMaxUsage(tier.getMaxUsage());
                                tierDto.setPricePerM3(tier.getPricePerM3());
                                return tierDto;
                            })
                            .collect(Collectors.toList());
                    dto.setPricingTiers(pricingTierDTOs);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<OwnerContractSummaryDTO> getOwnerContractsSummary(Long currentAccountId) {

        Owner currentOwner = ownerRepository.findByAccountId(currentAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found for the authenticated account."));

        List<Contract> contracts = contractRepository.findByOwner(currentOwner);

        // Chuyển đổi sang DTO và trả về
        return contracts.stream()
                .map(contract -> {
                    OwnerContractSummaryDTO dto = new OwnerContractSummaryDTO();
                    dto.setContractId(contract.getContractId());
                    dto.setCustomerCode(contract.getCustomerCode());
                    dto.setStatus(contract.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public NotificationDTO markNotificationAsRead(Long notificationId, Long currentAccountId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        authorizeOwnerAccessToContract(notification.getContract().getContractId(), currentAccountId);

        if (notification.getIsRead()) {
            throw new InvalidRequestException("Notification " + notificationId + " is already marked as read.");
        }

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);

        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(updatedNotification.getNotificationId());
        dto.setTitle(updatedNotification.getTitle());
        dto.setContent(updatedNotification.getContent());
        dto.setNotificationType(updatedNotification.getNotificationType());
        dto.setCreatedAt(updatedNotification.getCreatedAt());
        dto.setIsRead(updatedNotification.getIsRead());
        return dto;
    }

    @Transactional(readOnly = true)
    public WaterUsageChartDataDTO getWaterUsageDataForChart(Long contractId, int year, Long currentAccountId) {
        authorizeOwnerAccessToContract(contractId, currentAccountId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        WaterUsageChartDataDTO chartData = new WaterUsageChartDataDTO();
        chartData.setYear(year);

        BigDecimal totalUsageYear = invoiceRepository.sumTotalUsageByContractAndYear(contractId, year)
                .orElse(BigDecimal.ZERO);
        chartData.setTotalUsageForYear(totalUsageYear);

        List<Invoice> invoicesInYear = invoiceRepository.findByContractIdAndYear(contractId, year, PageRequest.of(0, Integer.MAX_VALUE)).getContent();

        List<WaterUsageByPeriodDTO> usageByPeriods = invoicesInYear.stream()
                .map(invoice -> {
                    WaterUsageByPeriodDTO periodDto = new WaterUsageByPeriodDTO();
                    periodDto.setBillingPeriodName(invoice.getContractPeriod().getBillingPeriod().getPeriodName());
                    periodDto.setTotalUsage(invoice.getTotalUsage());
                    periodDto.setInvoiceId(invoice.getInvoiceId());
                    return periodDto;
                })
                .collect(Collectors.toList());
        chartData.setUsageByPeriods(usageByPeriods);

        return chartData;
    }

    public CountUnreadNotificationResponse countUnreadNotifications(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        int numberOfUnreadNotifications = notificationRepository.countByContract_ContractIdAndIsReadFalse(contractId);
        return CountUnreadNotificationResponse.builder().count(numberOfUnreadNotifications).build();
    }

    public OwnerInfoResponse getOwnerInfo(Long contractId, Long currentAccountId) {
        authorizeOwnerAccessToContract(contractId, currentAccountId);
        Owner owner = ownerRepository.findByAccountId(currentAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found for the authenticated account."));
        return OwnerInfoResponse.builder()
                .ownerEmail(owner.getEmail())
                .ownerName(owner.getFullName())
                .ownerPhone(owner.getPhoneNumber())
                .build();
    }
}