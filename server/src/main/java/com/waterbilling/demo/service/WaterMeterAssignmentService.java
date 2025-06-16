package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.response.WaterMeterAssignmentDTO;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.WaterMeter;
import com.waterbilling.demo.model.WaterMeterAssignment;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.repository.WaterMeterAssignmentRepository;
import com.waterbilling.demo.repository.WaterMeterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class WaterMeterAssignmentService {

    @Autowired
    private WaterMeterAssignmentRepository waterMeterAssignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private WaterMeterRepository waterMeterRepository;

    @Transactional
    public WaterMeterAssignmentDTO deactivateWaterMeterAssignment(Long assignmentId ) {
        WaterMeterAssignment assignment = waterMeterAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Water Meter Assignment not found with ID: " + assignmentId));

        if (!assignment.getIsActive() && assignment.getWaterMeter().getIsActive()) {
            throw new InvalidRequestException("Đồng hồ bây giờ đang tham gia hợp đồng khác không thể cập nhật trạng thái hoạt động cho nó.");
        }
        boolean currentStatus = assignment.getIsActive();

        assignment.setIsActive(!currentStatus);

        WaterMeter waterMeter = assignment.getWaterMeter();
        waterMeter.setIsActive(!currentStatus);
        waterMeterRepository.save(waterMeter);

        WaterMeterAssignment updatedAssignment = waterMeterAssignmentRepository.save(assignment);
        return convertToWaterMeterAssignmentDTO(updatedAssignment);
    }
    private WaterMeterAssignmentDTO convertToWaterMeterAssignmentDTO(WaterMeterAssignment assignment) {
        WaterMeterAssignmentDTO dto = new WaterMeterAssignmentDTO();
        dto.setAssignmentId(assignment.getAssignmentId());
        dto.setWaterMeterId(assignment.getWaterMeter().getWaterMeterId());
        dto.setSerialNumber(assignment.getWaterMeter().getSerialNumber());
        dto.setCurrentReading(assignment.getCurrentReading());
        dto.setIsActive(assignment.getIsActive());
        // Thêm các thông tin khác nếu cần
        return dto;
    }
}
