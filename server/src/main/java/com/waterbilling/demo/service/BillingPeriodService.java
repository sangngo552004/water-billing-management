package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.request.BillingPeriodCreateUpdateDTO;
import com.waterbilling.demo.dto.response.BillingPeriodDTO;
import com.waterbilling.demo.dto.response.PeriodContractDetailDTO;
import com.waterbilling.demo.dto.response.PeriodSummaryDTO;
import com.waterbilling.demo.enums.BillingPeriodStatus;
import com.waterbilling.demo.enums.ContractStatus;
import com.waterbilling.demo.enums.PeriodContractStatus;
import com.waterbilling.demo.exception.DuplicateResourceException;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.BillingPeriod;
import com.waterbilling.demo.model.Contract;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.PeriodContract;
import com.waterbilling.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BillingPeriodService {

    @Autowired
    private BillingPeriodRepository billingPeriodRepository;
    @Autowired
    private PeriodContractRepository periodContractRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;
    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private ContractRepository contractRepository;


    @PreAuthorize("hasRole('admin')")
    @Transactional
    public BillingPeriodDTO createBillingPeriod(BillingPeriodCreateUpdateDTO request, Long createdByEmployeeId) {
        // 1. Kiểm tra username đã tồn tại chưa (quan trọng nhất)
        if (billingPeriodRepository.findByPeriodName(request.getPeriodName()).isPresent()) {
            throw new DuplicateResourceException("Kì thanh toán với tên '" + request.getPeriodName() + "' đã tồn tại.");
        }

        Optional<BillingPeriod> lastBillingPeriodOpt = billingPeriodRepository.findTopByOrderByToDateDesc();

        LocalDate fromDate = null;

        if (lastBillingPeriodOpt.isPresent()) {
            BillingPeriod lastPeriod = lastBillingPeriodOpt.get();
            fromDate = lastPeriod.getToDate().plusDays(1);
            if (lastPeriod.getStatus() != BillingPeriodStatus.completed) {
                throw new InvalidRequestException("Không thể tạo một kỳ thanh toán mới. Kỳ ('" + lastPeriod.getPeriodName() + "') vẫn chưa được hoàn thành.");
            }
            if(fromDate.isAfter(request.getToDate())) {
                throw new InvalidRequestException("Ngày kết thúc kỳ mới (" + request.getToDate() + ") phải sau ngày kết thúc kỳ trước (" + fromDate + ")");
            }

        }

        Employee createdBy = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên tạo kỳ không tìm thấy."));
        BillingPeriod billingPeriod = new BillingPeriod();
        billingPeriod.setPeriodName(request.getPeriodName());
        billingPeriod.setFromDate(fromDate);
        billingPeriod.setToDate(request.getToDate());
        billingPeriod.setCreatedBy(createdBy);
        billingPeriodRepository.save(billingPeriod);
        List<Contract> activeContract = contractRepository.findByStatus(ContractStatus.active);
        for(Contract c : activeContract) {
            PeriodContract pc = new PeriodContract();
            pc.setContract(c);
            pc.setBillingPeriod(billingPeriod);
            periodContractRepository.save(pc);
        }

        return convertToBillingPeriodDTO(billingPeriod);
    }

    @PreAuthorize("hasRole('admin')")
    public Page<BillingPeriodDTO> getAllBillingPeriods(Optional<Integer> year, Pageable pageable) {
        Page<BillingPeriod> periodsPage;
        if (year.isPresent()) {
            periodsPage = billingPeriodRepository.findByCreatedAt_Year(year.get(), pageable);
        } else {
            periodsPage = billingPeriodRepository.findAll(pageable);
        }

        return periodsPage.map(period -> {
            BillingPeriodDTO dto = convertToBillingPeriodDTO(period);

            List<PeriodContract> periodContracts = periodContractRepository.findByBillingPeriod_PeriodId(period.getPeriodId());
            dto.setTotalContracts((long) periodContracts.size());
            dto.setReadContracts(periodContracts.stream().filter(pc ->
                    pc.getStatus() == PeriodContractStatus.reading ||
                            pc.getStatus() == PeriodContractStatus.invoiced ||
                            pc.getStatus() == PeriodContractStatus.paid
            ).count());
            dto.setInvoicedContracts(periodContracts.stream().filter(pc ->
                    pc.getStatus() == PeriodContractStatus.invoiced ||
                            pc.getStatus() == PeriodContractStatus.paid
            ).count());
            dto.setPaidContracts(periodContracts.stream().filter(pc ->
                    pc.getStatus() == PeriodContractStatus.paid
            ).count());
            dto.setUnrecordedContracts(periodContracts.stream().filter(pc ->
                    pc.getStatus() == PeriodContractStatus.blocked
            ).count());
            return dto;
        });
    }

    @PreAuthorize("hasRole('admin')")
    public BillingPeriodDTO getBillingPeriodById(Long periodId) {
        BillingPeriod period = billingPeriodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ với ID: " + periodId));
        BillingPeriodDTO dto =  convertToBillingPeriodDTO(period);
        List<PeriodContract> periodContracts = periodContractRepository.findByBillingPeriod_PeriodId(period.getPeriodId());
        dto.setTotalContracts((long) periodContracts.size());
        dto.setReadContracts(periodContracts.stream().filter(pc ->
                pc.getStatus() == PeriodContractStatus.reading ||
                        pc.getStatus() == PeriodContractStatus.invoiced ||
                        pc.getStatus() == PeriodContractStatus.paid
        ).count());
        dto.setInvoicedContracts(periodContracts.stream().filter(pc ->
                pc.getStatus() == PeriodContractStatus.invoiced ||
                        pc.getStatus() == PeriodContractStatus.paid
        ).count());
        dto.setPaidContracts(periodContracts.stream().filter(pc ->
                pc.getStatus() == PeriodContractStatus.paid
        ).count());
        dto.setUnrecordedContracts(periodContracts.stream().filter(pc ->
                pc.getStatus() == PeriodContractStatus.blocked
        ).count());
        return dto;
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public BillingPeriodDTO updateBillingPeriod(Long periodId, BillingPeriodCreateUpdateDTO request) {
        BillingPeriod period = billingPeriodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ với ID: " + periodId));

        boolean hasReadings = waterMeterReadingRepository.existsByContractPeriod_BillingPeriod_PeriodId(periodId);
        if (hasReadings) {
            throw new InvalidRequestException("Không thể cập nhật kỳ vì đã có bản ghi nước đã được ghi");
        }

        period.setPeriodName(request.getPeriodName());
        period.setToDate(request.getToDate());
        billingPeriodRepository.save(period);
        return convertToBillingPeriodDTO(period);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public void deleteBillingPeriod(Long periodId) {
        BillingPeriod period = billingPeriodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ với ID: " + periodId));

        boolean hasReadings = waterMeterReadingRepository.existsByContractPeriod_BillingPeriod_PeriodId(periodId);
        if (hasReadings) {
            throw new InvalidRequestException("Không thể xóa kỳ vì đã có bản ghi nước đã được ghi");
        }

        List<PeriodContract> periodContracts = periodContractRepository.findByBillingPeriod_PeriodId(periodId);
        periodContractRepository.deleteAll(periodContracts);
        billingPeriodRepository.delete(period);
    }


    @PreAuthorize("hasRole('admin')")
    @Transactional
    public PeriodContractDetailDTO updatePeriodContractStatusToBlocked(Long contractPeriodId) {
        PeriodContract periodContract = periodContractRepository.findById(contractPeriodId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ với ID: " + contractPeriodId));

        // Only allow blocking if not already 'invoiced' or 'paid'
        if (periodContract.getStatus() != PeriodContractStatus.pending) {
            throw new InvalidRequestException("Không thể khóa kỳ thu hóa đơn của hợp đồng này vì nó đã được ghi");
        }
        int countWatermeterReading = waterMeterReadingRepository.countByContractPeriod(periodContract);
        if (countWatermeterReading > 0) {
            throw new InvalidRequestException("Khổng thể khóa bởi vì đã có bản ghi được ghi cho kỳ thu hợp đồng này.");
        }
        periodContract.setStatus(PeriodContractStatus.blocked);
        periodContract.setNote("Không thể ghi được");
        periodContractRepository.save(periodContract);

        PeriodContractDetailDTO dto = new PeriodContractDetailDTO();
        dto.setContractPeriodId(periodContract.getContractPeriodId());
        dto.setContractId(periodContract.getContract().getContractId());
        dto.setCustomerCode(periodContract.getContract().getCustomerCode());
        dto.setOwnerFullName(periodContract.getContract().getOwner().getFullName());
        dto.setFacilityAddress(periodContract.getContract().getFacility().getFullAddress());
        dto.setStatus(periodContract.getStatus().name());
        dto.setNote(periodContract.getNote());
        return dto;
    }

    @Transactional
    public BillingPeriodDTO completeBillingPeriod(Long billingPeriodId) {
        BillingPeriod billingPeriod = billingPeriodRepository.findById(billingPeriodId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ với ID: " + billingPeriodId));

        if (billingPeriod.getStatus() == BillingPeriodStatus.completed) {
            throw new InvalidRequestException("Kỳ thu hóa đơn  '" + billingPeriod.getPeriodName() + "' đã hoàn thành.");
        }

        List<PeriodContract> periodContracts = periodContractRepository.findByBillingPeriod(billingPeriod);
        int cnt = 0;
        for (PeriodContract pc : periodContracts) {
            if(pc.getStatus() == PeriodContractStatus.pending || pc.getStatus() == PeriodContractStatus.reading) {
                cnt += 1;
            }
        }
        if (cnt > 0) {
            throw new InvalidRequestException("Không thể cập nhật trạng thái hoàn thành cho kỳ '" + billingPeriod.getPeriodName() + "'. Kỳ này chưa tạo đầy đủ các hóa đơn.");
        }

        billingPeriod.setStatus(BillingPeriodStatus.completed);
        billingPeriodRepository.save(billingPeriod);

        return convertToBillingPeriodDTO(billingPeriod);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional(readOnly = true)
    public Page<PeriodContractDetailDTO> getPeriodContractsByBillingPeriod(
            Long billingPeriodId,
            Optional<String> searchTerm,
            Optional<PeriodContractStatus> status,
            Pageable pageable) {

        BillingPeriod billingPeriod = billingPeriodRepository.findById(billingPeriodId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ với ID: " + billingPeriodId));

        Page<PeriodContract> periodContractsPage;

        if (searchTerm.isPresent() && !searchTerm.get().trim().isEmpty()) {
            String searchPattern = "%" + searchTerm.get().trim().toLowerCase() + "%";
            if (status.isPresent()) {
                periodContractsPage = periodContractRepository.findByBillingPeriodAndStatusAndContract_CustomerCodeContainingIgnoreCase(
                        billingPeriod, status.get(), searchTerm.get(), pageable);
            } else {
                periodContractsPage = periodContractRepository.findByBillingPeriodAndContract_CustomerCodeContainingIgnoreCase(
                        billingPeriod, searchTerm.get(), pageable);
            }
        } else {
            if (status.isPresent()) {
                periodContractsPage = periodContractRepository.findByBillingPeriodAndStatus(
                        billingPeriod, status.get(), pageable);
            } else {
                periodContractsPage = periodContractRepository.findByBillingPeriod(billingPeriod, pageable);
            }
        }

        return periodContractsPage.map(pc -> {
            PeriodContractDetailDTO dto = new PeriodContractDetailDTO();
            dto.setContractPeriodId(pc.getContractPeriodId());
            dto.setContractId(pc.getContract().getContractId());
            dto.setCustomerCode(pc.getContract().getCustomerCode());
            dto.setOwnerFullName(pc.getContract().getOwner().getFullName());
            dto.setFacilityAddress(pc.getContract().getFacility().getFullAddress());
            dto.setStatus(pc.getStatus().name());
            dto.setNote(pc.getNote());
            return dto;
        });
    }

    public List<PeriodSummaryDTO> getAllPeriodSummary(){

        List<BillingPeriod> billingPeriods = billingPeriodRepository.findAll();
        return billingPeriods.stream().map(
                bp -> {
                    PeriodSummaryDTO dto = new PeriodSummaryDTO();
                    dto.setPeriodId(bp.getPeriodId());
                    dto.setPeriodName(bp.getPeriodName());
                    return dto;
                }
        ).toList();
    }

    private BillingPeriodDTO convertToBillingPeriodDTO(BillingPeriod period) {
        BillingPeriodDTO dto = new BillingPeriodDTO();
        dto.setPeriodId(period.getPeriodId());
        dto.setPeriodName(period.getPeriodName());
        dto.setFromDate(period.getFromDate());
        dto.setToDate(period.getToDate());
        dto.setStatus(period.getStatus());
        dto.setCreatedAt(period.getCreatedAt());
        // Additional counts will be calculated in the getAllBillingPeriods method
        return dto;
    }
}