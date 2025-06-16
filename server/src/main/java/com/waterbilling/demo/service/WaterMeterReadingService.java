package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.response.WaterMeterReadingDTO;
import com.waterbilling.demo.enums.PeriodContractStatus;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.PeriodContract;
import com.waterbilling.demo.model.WaterMeterAssignment;
import com.waterbilling.demo.model.WaterMeterReading;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.repository.PeriodContractRepository;
import com.waterbilling.demo.repository.WaterMeterAssignmentRepository;
import com.waterbilling.demo.repository.WaterMeterReadingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Service
public class WaterMeterReadingService {

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;
    @Autowired
    private WaterMeterAssignmentRepository waterMeterAssignmentRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private PeriodContractRepository periodContractRepository;


    @Transactional
    public WaterMeterReadingDTO recordWaterMeterReading(Long assignmentId, Long contractPeriodId, BigDecimal currentReading, String image, Long employeeId) {

        WaterMeterAssignment assignment = waterMeterAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("WaterMeterAssignment not found with ID: " + assignmentId));

        Employee createdBy = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with ID: " + employeeId));

        BigDecimal previousReading = assignment.getCurrentReading();

        PeriodContract periodContract = periodContractRepository.findById(contractPeriodId)
                .orElseThrow(() -> new EntityNotFoundException("PeriodContract not found with ID: " + contractPeriodId));


        if (periodContract.getStatus() != PeriodContractStatus.pending) {
            throw new IllegalStateException("Water meter readings can only be recorded for PeriodContract in PENDING .Current status: " + periodContract.getStatus());
        }

        // 4. Kiểm tra xem đã có bản ghi đọc nước cho assignment này trong kỳ này chưa
        if (waterMeterReadingRepository.existsByAssignment_AssignmentIdAndContractPeriod_ContractPeriodId(assignment.getAssignmentId(),periodContract.getContractPeriodId())) {
            throw new IllegalArgumentException("Water meter reading already exists for this assignment in the current period (" + periodContract.getBillingPeriod().getPeriodName() + ").");
        }

        // 5. Tạo bản ghi WaterMeterReading mới
        WaterMeterReading reading = new WaterMeterReading();
        reading.setAssignment(assignment);
        reading.setPreviousReading(previousReading);
        reading.setCurrentReading(currentReading);
        reading.setImage(image);
        reading.setCreatedBy(createdBy);
        reading.setContractPeriod(periodContract);

        WaterMeterReading savedReading = waterMeterReadingRepository.save(reading);

        assignment.setCurrentReading(currentReading);
        waterMeterAssignmentRepository.save(assignment);

        int totalRecord = waterMeterReadingRepository.countByContractPeriod(periodContract);
        int totalAssignment = waterMeterAssignmentRepository.countByContractAndIsActiveTrue(periodContract.getContract());
        System.out.print(totalRecord + "|||||||" + totalAssignment);
        if (totalRecord == totalAssignment) {
            periodContract.setStatus(PeriodContractStatus.reading);
            periodContractRepository.save(periodContract);
        }

        return convertToWaterMeterReadingDetailResponse(savedReading);
    }


    @Transactional
    public WaterMeterReadingDTO updateWaterMeterReading(Long readingId, BigDecimal newCurrentReading, String newImage) {
        WaterMeterReading existingReading = waterMeterReadingRepository.findById(readingId)
                .orElseThrow(() -> new EntityNotFoundException("WaterMeterReading not found with ID: " + readingId));

        if (existingReading.getIsConfirm()) {
            throw new IllegalStateException("Đồng hồ nước không thể cập nhật vì nó đã được xác nhận.");
        }
        if (newCurrentReading != null && existingReading.getCurrentReading().compareTo(newCurrentReading) != 0) {
            existingReading.setCurrentReading(newCurrentReading);

            WaterMeterAssignment assignment = existingReading.getAssignment();
            assignment.setCurrentReading(newCurrentReading);
            waterMeterAssignmentRepository.save(assignment);
        }

        if (newImage != null && !newImage.isEmpty()) {
            existingReading.setImage(newImage);
        }

        WaterMeterReading updatedReading = waterMeterReadingRepository.save(existingReading);

        return convertToWaterMeterReadingDetailResponse(updatedReading);

    }


    private WaterMeterReadingDTO convertToWaterMeterReadingDetailResponse(WaterMeterReading waterMeterReading) {
        WaterMeterReadingDTO dto = new WaterMeterReadingDTO();
        dto.setReadingId(waterMeterReading.getReadingId());
        dto.setPreviousReading(waterMeterReading.getPreviousReading());
        dto.setCurrentReading(waterMeterReading.getCurrentReading());
        dto.setIsConfirmed(waterMeterReading.getIsConfirm());
        dto.setImageUrl(waterMeterReading.getImage());

        return dto;
    }
}