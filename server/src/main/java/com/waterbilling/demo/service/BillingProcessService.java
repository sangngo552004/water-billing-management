package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.response.InvoiceListDTO;
import com.waterbilling.demo.enums.InvoiceStatus;
import com.waterbilling.demo.enums.PeriodContractStatus;
import com.waterbilling.demo.exception.DuplicateResourceException;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.*;
import com.waterbilling.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillingProcessService {

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;
    @Autowired
    private PeriodContractRepository periodContractRepository;
    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private InvoicePricingDetailRepository invoicePricingDetailRepository;
    @Autowired
    private PricingTierRepository pricingTierRepository;
    @Autowired
    private EmployeeRepository employeeRepository;

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public void confirmWaterMeterReading(Long readingId, Long adminEmployeeId) {
        WaterMeterReading reading = waterMeterReadingRepository.findById(readingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bản ghi nước với ID: " + readingId));

        if (reading.getIsConfirm()) {
            throw new InvalidRequestException("Bản ghi nước đã được xác nhận");
        }

        Employee admin = employeeRepository.findById(adminEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên"));

        reading.setIsConfirm(true);
        reading.setConfirmBy(admin);
        reading.setConfirmAt(LocalDateTime.now());
        waterMeterReadingRepository.save(reading);

        //trigger tự động cập nhật periodContract sang reading.
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public InvoiceListDTO generateInvoice(Long contractPeriodId, Long adminEmployeeId) {
        PeriodContract periodContract = periodContractRepository.findById(contractPeriodId)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không được tìm thấy trong kỳ này " + contractPeriodId));

        if (periodContract.getStatus() != PeriodContractStatus.reading) {
            throw new InvalidRequestException("Kỳ thu của hợp đồng này không ở trạng thái đã ghi " + periodContract.getStatus().name());
        }

        // Check if an invoice already exists for this PeriodContract
        if (invoiceRepository.existsByContractPeriod_ContractPeriodIdAndStatusNot(contractPeriodId, InvoiceStatus.cancelled)) {
            throw new DuplicateResourceException("Hóa đơn của hợp đồng này đã được tạo trong kỳ này");
        }

        List<WaterMeterReading> readings = waterMeterReadingRepository.findByContractPeriod_ContractPeriodId(contractPeriodId);
        if (readings.isEmpty() || !readings.stream().allMatch(WaterMeterReading::getIsConfirm)) {
            throw new InvalidRequestException("Tất cả bản ghi nước phải được xác nhận");
        }

        BigDecimal totalUsage = BigDecimal.ZERO;
        for (WaterMeterReading reading : readings) {
            totalUsage = totalUsage.add(reading.getCurrentReading().subtract(reading.getPreviousReading()));
        }

        // Get pricing tiers for the contract type
        Contract contract = periodContract.getContract();
        List<PricingTier> pricingTiers = pricingTierRepository.findByContractType_TypeIdAndIsActiveTrueOrderByMinUsageAsc(contract.getContractType().getTypeId());

        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal remainingUsage = totalUsage;
        List<InvoicePricingDetail> invoiceDetails = new java.util.ArrayList<>();

        for (PricingTier tier : pricingTiers) {
            if (remainingUsage.compareTo(BigDecimal.ZERO) <= 0) break; // No more usage to price

            BigDecimal tierUsage = BigDecimal.ZERO;
            if (tier.getMaxUsage() == null) { // Last tier (no max usage)
                tierUsage = remainingUsage;
            } else {
                BigDecimal tierCapacity = tier.getMaxUsage().subtract(tier.getMinUsage());
                tierUsage = remainingUsage.min(tierCapacity);
            }

            if (tierUsage.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal tierPrice = tierUsage.multiply(tier.getPricePerM3());
                totalPrice = totalPrice.add(tierPrice);
                remainingUsage = remainingUsage.subtract(tierUsage);

                InvoicePricingDetail detail = new InvoicePricingDetail();
                detail.setPricingTier(tier);
                detail.setUsageOfTier(tierUsage);
                detail.setPrice(tierPrice);
                invoiceDetails.add(detail);
            }
        }

        Employee createdBy = employeeRepository.findById(adminEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("không tìm thấy admin"));

        Invoice invoice = new Invoice();
        invoice.setContractPeriod(periodContract);
        invoice.setTotalUsage(totalUsage);
        invoice.setTotalPrice(totalPrice);
        invoice.setStatus(InvoiceStatus.unpaid); // Default to unpaid
        invoice.setCreatedBy(createdBy);
        invoiceRepository.save(invoice);

        // Link pricing details to the newly created invoice
        for (InvoicePricingDetail detail : invoiceDetails) {
            detail.setInvoice(invoice);
        }
        invoicePricingDetailRepository.saveAll(invoiceDetails);


        InvoiceListDTO dto = new InvoiceListDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setCustomerCode(invoice.getContractPeriod().getContract().getCustomerCode());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setTotalPrice(invoice.getTotalPrice());
        dto.setTotalUsage(invoice.getTotalUsage());
        dto.setStatus(invoice.getStatus());
        dto.setPaidAt(invoice.getPaidAt());
        return dto;
    }
}