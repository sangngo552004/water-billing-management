package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.response.PeriodContractDetailResponse;
import com.waterbilling.demo.dto.response.WaterMeterAssignmentDTO;
import com.waterbilling.demo.dto.response.WaterMeterReadingDTO;
import com.waterbilling.demo.model.PeriodContract;
import com.waterbilling.demo.model.WaterMeterAssignment;
import com.waterbilling.demo.model.WaterMeterReading;
import com.waterbilling.demo.repository.PeriodContractRepository;
import com.waterbilling.demo.repository.WaterMeterAssignmentRepository;
import com.waterbilling.demo.repository.WaterMeterReadingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest; // Thêm import
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal; // Thêm import
import java.time.LocalDateTime; // Thêm import
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PeriodContractService {

    @Autowired
    private PeriodContractRepository periodContractRepository;

    @Autowired
    private WaterMeterAssignmentRepository waterMeterAssignmentRepository;
    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;



    @Transactional(readOnly = true)
    public Page<PeriodContractDetailResponse> getLatestPendingPeriodContractsDetail(String ownerName, String address, String customerCode, Pageable pageable) {
        Page<PeriodContract> periodContractsPage = periodContractRepository.findLatestPendingPeriodContracts(ownerName, address, customerCode, pageable);
        System.out.println(periodContractsPage);
        return periodContractsPage.map(this::convertToPeriodContractDetailResponseForPending);
    }

    /**
     * Lấy danh sách PeriodContract ở trạng thái 'reading' và là kỳ mới nhất cho mỗi hợp đồng.
     * Trả về PeriodContractDetailResponse, chứa danh sách WaterMeterReading.
     */
    @Transactional(readOnly = true)
    public Page<PeriodContractDetailResponse> getLatestReadingPeriodContractsDetail(String ownerName, String address, String customerCode, Pageable pageable) {
        Page<PeriodContract> periodContractsPage = periodContractRepository.findLatestReadingPeriodContracts(ownerName, address, customerCode, pageable);
        // Ánh xạ thủ công sang Page<PeriodContractDetailResponse> với danh sách WaterMeterReading
        return periodContractsPage.map(this::convertToPeriodContractDetailResponseForReading);
    }



    // --- Phương thức ánh xạ thủ công mới cho PENDING PeriodContract ---
    private PeriodContractDetailResponse convertToPeriodContractDetailResponseForPending(PeriodContract periodContract) {
        PeriodContractDetailResponse dto = new PeriodContractDetailResponse();
        dto.setContractPeriodId(periodContract.getContractPeriodId());
        dto.setPeriodId(periodContract.getBillingPeriod().getPeriodId());
        dto.setPeriodName(periodContract.getBillingPeriod().getPeriodName());
        dto.setContractId(periodContract.getContract().getContractId());
        dto.setCustomerCode(periodContract.getContract().getCustomerCode());
        dto.setOwnerFullName(periodContract.getContract().getOwner().getFullName());
        dto.setFacilityAddress(periodContract.getContract().getFacility().getFullAddress());
        dto.setStatus(periodContract.getStatus());
        dto.setNote(periodContract.getNote());

        List<WaterMeterAssignment> waterMeterAssignments = waterMeterAssignmentRepository.findByContract_ContractIdAndIsActiveTrue(periodContract.getContract().getContractId());
        // Đối với trạng thái PENDING, trả về danh sách WaterMeterAssignment
        List<WaterMeterAssignmentDTO> assignmentDTOs = waterMeterAssignments.stream()
                .map(this::convertToWaterMeterAssignmentDetailResponse)
                .collect(Collectors.toList());
        dto.setWaterMeterAssignments(assignmentDTOs);
        dto.setWaterMeterReadings(List.of());
        return dto;
    }

    // --- Phương thức ánh xạ thủ công cho READING PeriodContract (giữ nguyên từ trước) ---
    private PeriodContractDetailResponse convertToPeriodContractDetailResponseForReading(PeriodContract periodContract) {
        PeriodContractDetailResponse dto = new PeriodContractDetailResponse();
        dto.setContractPeriodId(periodContract.getContractPeriodId());
        dto.setPeriodId(periodContract.getBillingPeriod().getPeriodId());
        dto.setPeriodName(periodContract.getBillingPeriod().getPeriodName());
        dto.setContractId(periodContract.getContract().getContractId());
        dto.setCustomerCode(periodContract.getContract().getCustomerCode());
        dto.setOwnerFullName(periodContract.getContract().getOwner().getFullName());
        dto.setFacilityAddress(periodContract.getContract().getFacility().getFullAddress());
        dto.setStatus(periodContract.getStatus());
        dto.setNote(periodContract.getNote());

        // Đối với trạng thái READING, trả về danh sách WaterMeterReading
        List<WaterMeterReading> waterMeterReadings = waterMeterReadingRepository.findByContractPeriod_ContractPeriodId(periodContract.getContractPeriodId());
        List<WaterMeterReadingDTO> readingDTOs = waterMeterReadings.stream()
                .map(this::convertToWaterMeterReadingDetailResponse)
                .collect(Collectors.toList());
        dto.setWaterMeterReadings(readingDTOs);
        dto.setWaterMeterAssignments(List.of());

        return dto;
    }

    // --- Các phương thức ánh xạ phụ trợ (giữ nguyên) ---
    private WaterMeterAssignmentDTO convertToWaterMeterAssignmentDetailResponse(WaterMeterAssignment assignment) {
        WaterMeterAssignmentDTO dto = new WaterMeterAssignmentDTO();
        dto.setWaterMeterId(assignment.getWaterMeter().getWaterMeterId());
        dto.setAssignmentId(assignment.getAssignmentId());
        dto.setSerialNumber(assignment.getWaterMeter().getSerialNumber());
        dto.setCurrentReading(assignment.getCurrentReading());
        dto.setIsActive(assignment.getIsActive());
        return dto;
    }


    private WaterMeterReadingDTO convertToWaterMeterReadingDetailResponse(WaterMeterReading waterMeterReading) {
        WaterMeterReadingDTO dto = new WaterMeterReadingDTO();
        dto.setReadingId(waterMeterReading.getReadingId());
        dto.setPreviousReading(waterMeterReading.getPreviousReading());
        dto.setCurrentReading(waterMeterReading.getCurrentReading());
        dto.setUsage(waterMeterReading.getCurrentReading().subtract(waterMeterReading.getPreviousReading()));
        dto.setSerialNumber(waterMeterReading.getAssignment().getWaterMeter().getSerialNumber());
        dto.setIsConfirmed(waterMeterReading.getIsConfirm());
        dto.setImageUrl(waterMeterReading.getImage());
        dto.setCreatedAt(waterMeterReading.getCreatedAt());

        return dto;
    }
}
