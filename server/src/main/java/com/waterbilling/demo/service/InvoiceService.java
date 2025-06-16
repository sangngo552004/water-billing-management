package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.response.InvoiceDetailDTO;
import com.waterbilling.demo.dto.response.InvoiceListDTO;
import com.waterbilling.demo.dto.response.InvoicePricingDetailDTO;
import com.waterbilling.demo.enums.InvoiceStatus;
import com.waterbilling.demo.enums.PaymentMethod;
import com.waterbilling.demo.enums.PeriodContractStatus;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.Invoice;
import com.waterbilling.demo.model.PeriodContract;
import com.waterbilling.demo.model.WaterMeterReading;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.repository.InvoiceRepository;
import com.waterbilling.demo.repository.PeriodContractRepository;
import com.waterbilling.demo.repository.WaterMeterReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired
    private PeriodContractRepository periodContractRepository;

    @Transactional
    public InvoiceDetailDTO cancelInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.cancelled) {
            throw new InvalidRequestException("Hóa đơn " + invoiceId + " đã được hủy");
        }

        if (invoice.getStatus() == InvoiceStatus.paid) {
            throw new InvalidRequestException("Không thể hủy một hóa đơn đã thanh toán " + invoiceId);
        }

        invoice.setStatus(InvoiceStatus.cancelled);
        invoiceRepository.save(invoice);

        // 2. Cập nhật trạng thái PeriodContract về READING
        PeriodContract periodContract = invoice.getContractPeriod();
        if (periodContract != null) {
            periodContract.setStatus(PeriodContractStatus.reading);
            periodContractRepository.save(periodContract);
        }

        // 3. Đưa các bản ghi WaterMeterReading liên quan về trạng thái chưa xác nhận
        // Các bản ghi chỉ số liên quan đến PeriodContract này
        List<WaterMeterReading> readings = waterMeterReadingRepository.findByContractPeriod(periodContract);
        for (WaterMeterReading reading : readings) {
            if (reading.getIsConfirm()) {
                reading.setIsConfirm(false);
                reading.setConfirmAt(null);
                reading.setConfirmBy(null);
                waterMeterReadingRepository.save(reading);
            }
        }

        return convertToInvoiceDetailDTO(invoice);
    }

    // Hàm chuyển đổi (Nếu bạn chưa có, thêm vào AdminService)
    private InvoiceDetailDTO convertToInvoiceDetailDTO(Invoice invoice) {
        InvoiceDetailDTO dto = new InvoiceDetailDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setCustomerCode(invoice.getContractPeriod().getContract().getCustomerCode());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setTotalPrice(invoice.getTotalPrice());
        dto.setTotalUsage(invoice.getTotalUsage());
        dto.setStatus(invoice.getStatus());
        dto.setPaymentMethod(invoice.getPaymentMethod());
        dto.setPaidAt(invoice.getPaidAt());

        // Lấy danh sách chi tiết giá từ InvoicePricingDetail
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

    public Page<InvoiceListDTO> getInvoicesForAdmin(
            Optional<Long> billingPeriodId,
            Optional<String> customerCode,
            Optional<InvoiceStatus> status, // Add this new parameter
            Pageable pageable) {

        Page<Invoice> invoicesPage;

        if (billingPeriodId.isPresent() && customerCode.isPresent() && !customerCode.get().trim().isEmpty() && status.isPresent() ) {
            invoicesPage = invoiceRepository.findByContractPeriod_BillingPeriod_PeriodIdAndContractPeriod_Contract_CustomerCodeContainingIgnoreCaseAndStatus(
                    billingPeriodId.get(), customerCode.get(), status.get(), pageable);
        } else if (billingPeriodId.isPresent() && customerCode.isPresent() && !customerCode.get().trim().isEmpty()) {
            invoicesPage = invoiceRepository.findByContractPeriod_BillingPeriod_PeriodIdAndContractPeriod_Contract_CustomerCodeContainingIgnoreCase(
                    billingPeriodId.get(), customerCode.get(), pageable);
        } else if (billingPeriodId.isPresent() && status.isPresent() ) {
            invoicesPage = invoiceRepository.findByContractPeriod_BillingPeriod_PeriodIdAndStatus(
                    billingPeriodId.get(), status.get(), pageable);
        } else if (customerCode.isPresent() && !customerCode.get().trim().isEmpty() && status.isPresent()) {
            invoicesPage = invoiceRepository.findByContractPeriod_Contract_CustomerCodeContainingIgnoreCaseAndStatus(
                    customerCode.get(), status.get(), pageable);
        } else if (billingPeriodId.isPresent()) {
            invoicesPage = invoiceRepository.findByContractPeriod_BillingPeriod_PeriodId(billingPeriodId.get(), pageable);
        } else if (customerCode.isPresent() && !customerCode.get().trim().isEmpty()) {
            invoicesPage = invoiceRepository.findByContractPeriod_Contract_CustomerCodeContainingIgnoreCase(customerCode.get(), pageable);
        } else if (status.isPresent() ) {
            invoicesPage = invoiceRepository.findByStatus(status.get(), pageable);
        } else {
            invoicesPage = invoiceRepository.findAll(pageable);
        }

        return invoicesPage.map(invoice -> {
            InvoiceListDTO dto = new InvoiceListDTO();
            dto.setInvoiceId(invoice.getInvoiceId());
            dto.setCustomerCode(invoice.getContractPeriod().getContract().getCustomerCode());
            dto.setPeriodName(invoice.getContractPeriod().getBillingPeriod().getPeriodName());
            dto.setCreatedAt(invoice.getCreatedAt());
            dto.setTotalPrice(invoice.getTotalPrice());
            dto.setTotalUsage(invoice.getTotalUsage());
            dto.setStatus(invoice.getStatus());
            dto.setPaidAt(invoice.getPaidAt());
            return dto;
        });
    }

    @Transactional
    public InvoiceDetailDTO collectInvoicePayment(Long invoiceId, Long collectedByEmployeeId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.paid) {
            throw new InvalidRequestException("Invoice " + invoiceId + " has already been paid.");
        }
        if (invoice.getStatus() == InvoiceStatus.cancelled) {
            throw new InvalidRequestException("Cannot collect payment for a cancelled invoice: " + invoiceId);
        }

        Employee collectedBy = employeeRepository.findById(collectedByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Collecting employee not found."));

        invoice.setStatus(InvoiceStatus.paid);
        invoice.setPaymentMethod(PaymentMethod.TM);
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setCollectedBy(collectedBy);
        invoiceRepository.save(invoice);


        PeriodContract periodContract = invoice.getContractPeriod();
        if (periodContract != null) {
            periodContract.setStatus(PeriodContractStatus.paid);
            periodContractRepository.save(periodContract);
        }

        return convertToInvoiceDetailDTO(invoice);
    }


    @Transactional(readOnly = true)
    public Page<InvoiceListDTO> getLatestInvoicesToCollect(String ownerName, String customerCode, Pageable pageable) {
        Page<Invoice> invoicesPage = invoiceRepository.findLatestInvoicesToCollect(ownerName, customerCode, pageable);
        return invoicesPage.map(invoice -> {
            InvoiceListDTO dto = new InvoiceListDTO();
            dto.setInvoiceId(invoice.getInvoiceId());
            dto.setCustomerCode(invoice.getContractPeriod().getContract().getCustomerCode());
            dto.setPeriodName(invoice.getContractPeriod().getBillingPeriod().getPeriodName());
            dto.setOwnerName(invoice.getContractPeriod().getContract().getOwner().getFullName());
            dto.setCreatedAt(invoice.getCreatedAt());
            dto.setTotalPrice(invoice.getTotalPrice());
            dto.setTotalUsage(invoice.getTotalUsage());
            dto.setStatus(invoice.getStatus());
            dto.setPaidAt(invoice.getPaidAt());
            return dto;
        });
    }

    @Transactional
    public void updateOverdueInvoices() {


        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        List<Invoice> overdueInvoices = invoiceRepository.findByStatusAndCreatedAtBeforeAndPaidAtIsNull(InvoiceStatus.unpaid, sevenDaysAgo);

        for (Invoice invoice : overdueInvoices) {
            invoice.setStatus(InvoiceStatus.overdue);
            invoiceRepository.save(invoice);
        }
    }
}
