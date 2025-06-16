package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.response.DashboardSummaryDTO;
import com.waterbilling.demo.dto.response.RevenueByPeriodDTO;
import com.waterbilling.demo.enums.PeriodContractStatus;
import com.waterbilling.demo.enums.RequestStatus;
import com.waterbilling.demo.model.BillingPeriod;
import com.waterbilling.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    @Autowired
    private  RequestRepository requestRepository;
    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;
    @Autowired
    private BillingPeriodRepository billingPeriodRepository;
    @Autowired
    private PeriodContractRepository periodContractRepository; // Inject cái này
    @Autowired
    private InvoiceRepository invoiceRepository;

    public DashboardSummaryDTO getDashboardSummary(Integer year) { // Add year parameter
        long pendingRequests = requestRepository.countByStatus(RequestStatus.pending);
        long unconfirmedReadings = waterMeterReadingRepository.countByIsConfirmFalse();
        long pendingInvoiceCreation = periodContractRepository.countByStatus(PeriodContractStatus.reading);

        // 4. Kỳ thu mới nhất
        String latestPeriodName = null;
        String latestPeriodStatus = null;
        String latestPeriodFromDate = null;
        String latestPeriodToDate = null;

        Optional<BillingPeriod> latestPeriodOptional = billingPeriodRepository.findTopByOrderByToDateDesc();

        if (latestPeriodOptional.isPresent()) {
            BillingPeriod latestPeriod = latestPeriodOptional.get();
            latestPeriodName = latestPeriod.getPeriodName();
            latestPeriodStatus = latestPeriod.getStatus().name();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            latestPeriodFromDate = latestPeriod.getFromDate().format(formatter);
            latestPeriodToDate = latestPeriod.getToDate().format(formatter);
        }

        // 5. Lấy dữ liệu doanh thu theo kỳ, truyền tham số năm vào
        List<RevenueByPeriodDTO> revenueData = invoiceRepository.findTotalRevenueByPeriod(year);

        return DashboardSummaryDTO.builder()
                .pendingInvoiceCreationCount(pendingInvoiceCreation)
                .unconfirmedWaterReadingsCount(unconfirmedReadings)
                .pendingRequestsCount(pendingRequests)
                .latestBillingPeriodToDate(latestPeriodToDate)
                .latestBillingPeriodStatus(latestPeriodStatus)
                .latestBillingPeriodFromDate(latestPeriodFromDate)
                .latestBillingPeriodName(latestPeriodName)
                .revenueByPeriods(revenueData) // Thêm dữ liệu doanh thu vào DTO
                .build();
    }
}
