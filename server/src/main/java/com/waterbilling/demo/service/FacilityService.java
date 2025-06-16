package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.request.FacilityCreateUpdateDTO;
import com.waterbilling.demo.dto.response.ContractDTO;
import com.waterbilling.demo.dto.response.FacilityDTO;
import com.waterbilling.demo.enums.ContractStatus;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Contract;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.Facility;
import com.waterbilling.demo.repository.ContractRepository;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

// --- Facility Management Service ---
@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;
    @Autowired
    private ContractRepository contractRepository;
    @Autowired
    private EmployeeRepository employeeRepository;

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public FacilityDTO createFacility(FacilityCreateUpdateDTO request, Long createdByEmployeeId) {
        Employee createdBy = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator Employee not found."));

        Facility facility = new Facility();
        facility.setFullAddress(request.getFullAddress());
        facility.setCreatedBy(createdBy);
        facilityRepository.save(facility);
        return convertToFacilityDTO(facility);
    }

    @PreAuthorize("hasRole('admin')")
    public Page<FacilityDTO> getFacilities(String searchTerm, Optional<Boolean> isActive, Pageable pageable) {
        Page<Facility> facilitiesPage;
        if (searchTerm != null && !searchTerm.trim().isEmpty() && isActive.isPresent()) {
            facilitiesPage = facilityRepository.findByFullAddressContainingIgnoreCaseAndIsActive(searchTerm, isActive.get(), pageable);
        } else if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            facilitiesPage = facilityRepository.findByFullAddressContainingIgnoreCase(searchTerm, pageable);
        } else if (isActive.isPresent()) {
            facilitiesPage = facilityRepository.findByIsActive(isActive.get(), pageable);
        } else {
            facilitiesPage = facilityRepository.findAll(pageable);
        }
        return facilitiesPage.map(this::convertToFacilityDTO);
    }

    @PreAuthorize("hasRole('admin')")
    public FacilityDTO getFacilityById(Long facilityId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + facilityId));
        return convertToFacilityDTO(facility);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public FacilityDTO updateFacility(Long facilityId, FacilityCreateUpdateDTO request) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + facilityId));

        boolean hasActiveContract = contractRepository.existsByFacility_FacilityIdAndStatus(facilityId, ContractStatus.active);
        if (hasActiveContract) {
            throw new InvalidRequestException("không thể cập nhật cho cơ cơ này, cơ sở này đã được sử dụng bởi một hợp đồng");
        }

        facility.setFullAddress(request.getFullAddress());
        facilityRepository.save(facility);
        return convertToFacilityDTO(facility);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public void deleteFacility(Long facilityId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + facilityId));

        // Check if the facility is assigned to any contract (active or not)
        boolean hasAnyContract = contractRepository.existsByFacility_FacilityId(facilityId);
        if (hasAnyContract) {
            throw new InvalidRequestException("Không thể xóa cơ sở này, cơ sở này đã được gán vào một hợp đồng");
        }

        facilityRepository.delete(facility);
    }

    public List<FacilityDTO> getListFacityNotInActive() {
        List<Facility> facilities = facilityRepository.findByIsActiveFalse();
        return facilities.stream().map(f -> {
                    FacilityDTO dto = new FacilityDTO();
                    dto.setFullAddress(f.getFullAddress());
                    dto.setFacilityId(f.getFacilityId());
                    return dto;
                }
                ).toList();
    }
    private FacilityDTO convertToFacilityDTO(Facility facility) {
        FacilityDTO dto = new FacilityDTO();
        dto.setFacilityId(facility.getFacilityId());
        dto.setFullAddress(facility.getFullAddress());
        dto.setCreatedAt(facility.getCreatedAt());
        dto.setIsActive(facility.getIsActive());
        return dto;
    }
}
