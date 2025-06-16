package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.request.WaterMeterCreateUpdateDTO;
import com.waterbilling.demo.dto.response.FacilityDTO;
import com.waterbilling.demo.dto.response.WaterMeterDTO;
import com.waterbilling.demo.exception.DuplicateResourceException;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.Facility;
import com.waterbilling.demo.model.WaterMeter;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.repository.WaterMeterAssignmentRepository;
import com.waterbilling.demo.repository.WaterMeterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

// --- WaterMeter Management Service ---
@Service
public class WaterMeterService {

    @Autowired
    private WaterMeterRepository waterMeterRepository;
    @Autowired
    private WaterMeterAssignmentRepository waterMeterAssignmentRepository;
    @Autowired
    private EmployeeRepository employeeRepository;

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public WaterMeterDTO createWaterMeter(WaterMeterCreateUpdateDTO request, Long createdByEmployeeId) {
        if (waterMeterRepository.findBySerialNumber(request.getSerialNumber()).isPresent()) {
            throw new DuplicateResourceException("Đồng hồ nước này đã tồn tại");
        }
        Employee createdBy = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator Employee not found."));

        WaterMeter waterMeter = new WaterMeter();
        waterMeter.setSerialNumber(request.getSerialNumber());
        waterMeter.setCreatedBy(createdBy);
        waterMeterRepository.save(waterMeter);
        return convertToWaterMeterDTO(waterMeter);
    }

    @PreAuthorize("hasRole('admin')")
    public Page<WaterMeterDTO> getWaterMeters(String searchTerm, Optional<Boolean> isActive, Pageable pageable) {
        Page<WaterMeter> waterMetersPage;
        if (searchTerm != null && !searchTerm.trim().isEmpty() && isActive.isPresent()) {
            waterMetersPage = waterMeterRepository.findBySerialNumberContainingIgnoreCaseAndIsActive(searchTerm, isActive.get(), pageable);
        } else if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            waterMetersPage = waterMeterRepository.findBySerialNumberContainingIgnoreCase(searchTerm, pageable);
        } else if (isActive.isPresent()) {
            waterMetersPage = waterMeterRepository.findByIsActive(isActive.get(), pageable);
        } else {
            waterMetersPage = waterMeterRepository.findAll(pageable);
        }
        return waterMetersPage.map(this::convertToWaterMeterDTO);
    }

    @PreAuthorize("hasRole('admin')")
    public WaterMeterDTO getWaterMeterById(Long waterMeterId) {
        WaterMeter waterMeter = waterMeterRepository.findById(waterMeterId)
                .orElseThrow(() -> new ResourceNotFoundException("Water Meter not found with ID: " + waterMeterId));
        return convertToWaterMeterDTO(waterMeter);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public WaterMeterDTO updateWaterMeter(Long waterMeterId, WaterMeterCreateUpdateDTO request) {
        WaterMeter waterMeter = waterMeterRepository.findById(waterMeterId)
                .orElseThrow(() -> new ResourceNotFoundException("Water Meter not found with ID: " + waterMeterId));

        if (!waterMeter.getSerialNumber().equals(request.getSerialNumber()) && waterMeterRepository.findBySerialNumber(request.getSerialNumber()).isPresent()) {
            throw new DuplicateResourceException("Water meter with this serial number already exists.");
        }

        boolean hasAssignments = waterMeterAssignmentRepository.existsByWaterMeter_WaterMeterId(waterMeterId);
        if (hasAssignments) {
            throw new InvalidRequestException("Cannot update/delete a water meter that has been assigned to a contract.");
        }

        waterMeter.setSerialNumber(request.getSerialNumber());
        waterMeterRepository.save(waterMeter);
        return convertToWaterMeterDTO(waterMeter);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public void deleteWaterMeter(Long waterMeterId) {
        WaterMeter waterMeter = waterMeterRepository.findById(waterMeterId)
                .orElseThrow(() -> new ResourceNotFoundException("Water Meter not found with ID: " + waterMeterId));

        boolean hasAssignments = waterMeterAssignmentRepository.existsByWaterMeter_WaterMeterId(waterMeterId);
        if (hasAssignments) {
            throw new InvalidRequestException("Không thể xóa đồng hồ vì đồng hồ đã được gán vào hợp đồng.");
        }

        waterMeterRepository.delete(waterMeter);
    }

    public List<WaterMeterDTO> getListWaterMeterNotInActive() {
        List<WaterMeter> waterMeters = waterMeterRepository.findByIsActiveFalse();
        return waterMeters.stream().map(wm -> {
            WaterMeterDTO dto = new WaterMeterDTO();
                    dto.setWaterMeterId(wm.getWaterMeterId());
                    dto.setSerialNumber(wm.getSerialNumber());
                    return dto;
                }
        ).toList();
    }
    private WaterMeterDTO convertToWaterMeterDTO(WaterMeter waterMeter) {
        WaterMeterDTO dto = new WaterMeterDTO();
        dto.setWaterMeterId(waterMeter.getWaterMeterId());
        dto.setSerialNumber(waterMeter.getSerialNumber());
        dto.setCreatedAt(waterMeter.getCreatedAt());
        dto.setIsActive(waterMeter.getIsActive());
        return dto;
    }
}
