package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.request.ContractCreateRequestDTO;
import com.waterbilling.demo.dto.response.ContractDTO;
import com.waterbilling.demo.dto.response.ContractDetailOwnerDTO;
import com.waterbilling.demo.dto.response.WaterMeterAssignmentDTO;
import com.waterbilling.demo.enums.ContractStatus;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.*;
import com.waterbilling.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;
    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private FacilityRepository facilityRepository;
    @Autowired
    private ContractTypeRepository contractTypeRepository;
    @Autowired
    private WaterMeterAssignmentRepository waterMeterAssignmentRepository;
    @Autowired
    private WaterMeterRepository waterMeterRepository;
    @Autowired
    private EmployeeRepository employeeRepository;

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public ContractDTO createContract(ContractCreateRequestDTO request, Long createdByEmployeeId) {
        Owner owner = ownerRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + request.getOwnerId()));
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + request.getFacilityId()));
        ContractType contractType = contractTypeRepository.findById(request.getContractTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract Type not found with ID: " + request.getContractTypeId()));
        Employee createdBy = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator Employee not found."));


        boolean ownerHasSuspendedContract = contractRepository.existsByOwner_OwnerIdAndStatus(request.getOwnerId(), ContractStatus.suspended);
        if (ownerHasSuspendedContract) {
            throw new InvalidRequestException("Khách hàng đang có một hợp đồng đang tạm ngừng không thể tạo hợp đồng mới.");
        }

        boolean facilityHasActiveContract = contractRepository.existsByFacility_FacilityIdAndStatus(request.getFacilityId(), ContractStatus.active);
        if (facilityHasActiveContract) {
            throw new InvalidRequestException("Facility is already assigned to an active contract.");
        }

        Contract contract = new Contract();
        contract.setOwner(owner);
        contract.setFacility(facility);
        contract.setContractType(contractType);
        contract.setImage(request.getImage());
        contract.setStartDate(request.getStartDate());
        contract.setStatus(ContractStatus.active); // New contract starts active
        contract.setCreatedBy(createdBy);

        if (!facility.getIsActive()) {
            facility.setIsActive(true);
            facilityRepository.save(facility);
        }

        contractRepository.save(contract);
        return convertToContractDTO(contract);
    }

    @Transactional
    public WaterMeterAssignmentDTO assignWaterMeterToContract(Long contractId, Long waterMeterId, Long assignedByEmployeeId) {

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        WaterMeter waterMeter = waterMeterRepository.findById(waterMeterId)
                .orElseThrow(() -> new ResourceNotFoundException("Water Meter not found with ID: " + waterMeterId));

        Employee assignedBy = employeeRepository.findById(assignedByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + assignedByEmployeeId));


        if (waterMeter.getIsActive()) {
            throw new InvalidRequestException("Đồng hồ nước " + waterMeter.getSerialNumber() + " đang được sử dụng ở một hợp đồng khác. ");
        }
        // kiểm tra đã tồn tại waterMeterAssignment này chưa
        if (waterMeterAssignmentRepository.existsByContract_ContractIdAndWaterMeter_WaterMeterId(contractId, waterMeterId)) {
            throw new InvalidRequestException("Đồng hồ nước " + waterMeter.getSerialNumber() + " đã được gán cho hợp đồng: " + contractId);
        }

        BigDecimal initialCurrentReading = BigDecimal.ZERO;
        List<WaterMeterAssignment> previousAssignments = waterMeterAssignmentRepository.findByWaterMeter(waterMeter);
        if (!previousAssignments.isEmpty()) {
            // Get the current reading from the most recent previous assignment
            initialCurrentReading = previousAssignments.get(previousAssignments.size() - 1).getCurrentReading();
        }


        WaterMeterAssignment assignment = new WaterMeterAssignment();
        assignment.setContract(contract);
        assignment.setWaterMeter(waterMeter);
        assignment.setCurrentReading(initialCurrentReading); // Set initial reading

        WaterMeterAssignment savedAssignment = waterMeterAssignmentRepository.save(assignment);

        if (!waterMeter.getIsActive()) {
            waterMeter.setIsActive(true);
            waterMeterRepository.save(waterMeter);
        }

        return convertToWaterMeterAssignmentDTO(savedAssignment);
    }

    @PreAuthorize("hasRole('admin')")
    public Page<ContractDTO> getContracts(String searchTerm, Optional<ContractStatus> status, Pageable pageable) {
        Page<Contract> contractsPage;

        if (searchTerm != null && !searchTerm.trim().isEmpty()) {

            if (status.isPresent()) {
                contractsPage = contractRepository.findByStatusAndSearchTerm(status.get(), searchTerm, pageable); // Need a custom query here
            } else {
                contractsPage = contractRepository.findByOwner_FullNameContainingIgnoreCaseOrCustomerCodeContainingIgnoreCaseOrFacility_FullAddressContainingIgnoreCase(
                        searchTerm, searchTerm, searchTerm, pageable);
            }
        } else {
            if (status.isPresent()) {
                contractsPage = contractRepository.findByStatus(status.get(), pageable);
            } else {
                contractsPage = contractRepository.findAll(pageable);
            }
        }
        return contractsPage.map(this::convertToContractDTO);
    }

    @PreAuthorize("hasAnyRole('admin', 'owner')")
    public ContractDetailOwnerDTO getContractDetails(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));
        return convertToContractDetailOwnerDTO(contract);
    }


    @PreAuthorize("hasRole('admin')")
    @Transactional
    public ContractDTO suspendContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        if (contract.getStatus() == ContractStatus.cancelled) {
            throw new InvalidRequestException("Không thể tạm dừng một hợp đồng đã hủy.");
        }
        contract.setStatus(ContractStatus.suspended);
        contractRepository.save(contract);
        return convertToContractDTO(contract);
    }
    @PreAuthorize("hasRole('admin')")
    @Transactional
    public ContractDTO activeContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        if (contract.getStatus() != ContractStatus.suspended) {
            throw new InvalidRequestException("Không thể active cho một hợp đồng đã hủy");
        }
        contract.setStatus(ContractStatus.active);
        contractRepository.save(contract);
        return convertToContractDTO(contract);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public ContractDTO cancelContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with ID: " + contractId));

        if (contract.getStatus() != ContractStatus.active) {
            throw new InvalidRequestException("Hợp đồng đang không hoạt động, không thể hủy.");
        }
        contract.setStatus(ContractStatus.cancelled);

        Facility facility = contract.getFacility();
        if (facility != null) {
            facility.setIsActive(false);
            facilityRepository.save(facility);
        }

        List<WaterMeterAssignment> assignments = waterMeterAssignmentRepository.findByContract_ContractId(contractId);
        for (WaterMeterAssignment assignment : assignments) {
            if (assignment.getWaterMeter() != null) {
                assignment.getWaterMeter().setIsActive(false);
                waterMeterRepository.save(assignment.getWaterMeter());
            }
            assignment.setIsActive(false);
            waterMeterAssignmentRepository.save(assignment);
        }

        contractRepository.save(contract);
        return convertToContractDTO(contract);
    }


    @Transactional(readOnly = true)
    public List<ContractDTO> getContractsByFacility(Long facilityId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + facilityId));
        List<Contract> contracts = contractRepository.findByFacility(facility);
        return contracts.stream().map(this::convertToContractDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContractDTO> getAllContractsByWaterMeter(Long waterMeterId) {
        WaterMeter waterMeter = waterMeterRepository.findById(waterMeterId)
                .orElseThrow(() -> new ResourceNotFoundException("Water Meter not found with ID: " + waterMeterId));
        List<WaterMeterAssignment> assignments = waterMeterAssignmentRepository.findByWaterMeter(waterMeter);
        return assignments.stream()
                .map(assignment -> convertToContractDTO(assignment.getContract()))
                .distinct() // Loại bỏ trùng lặp nếu 1 hợp đồng có nhiều assignment với cùng 1 đồng hồ (ít xảy ra)
                .collect(Collectors.toList());
    }
    // AdminService.java (Thêm vào)
    @Transactional(readOnly = true)
    public List<ContractDTO> getContractsByOwner(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + ownerId));
        List<Contract> contracts = contractRepository.findByOwner(owner);
        return contracts.stream().map(this::convertToContractDTO).collect(Collectors.toList());
    }
    // Helper convert (Nếu chưa có)
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
    private ContractDTO convertToContractDTO(Contract contract) {
        ContractDTO dto = new ContractDTO();
        dto.setContractId(contract.getContractId());
        dto.setCustomerCode(contract.getCustomerCode());
        dto.setStartDate(contract.getStartDate());
        dto.setStatus(contract.getStatus());
        dto.setOwnerFullName(contract.getOwner() != null ? contract.getOwner().getFullName() : null);
        dto.setFacilityAddress(contract.getFacility() != null ? contract.getFacility().getFullAddress() : null);
        dto.setContractTypeName(contract.getContractType() != null ? contract.getContractType().getTypeName() : null);
        return dto;
    }
    // Reuse Owner's DTO for detailed view, but mapping from entity
    private ContractDetailOwnerDTO convertToContractDetailOwnerDTO(Contract contract) {
        ContractDetailOwnerDTO dto = new ContractDetailOwnerDTO();
        dto.setContractId(contract.getContractId());
        dto.setCustomerCode(contract.getCustomerCode());
        dto.setStartDate(contract.getStartDate());
        dto.setStatus(contract.getStatus());
        dto.setFacilityAddress(contract.getFacility() != null ? contract.getFacility().getFullAddress() : null);
        dto.setOwnerFullName(contract.getOwner() != null ? contract.getOwner().getFullName() : null);
        dto.setOwnerEmail(contract.getOwner() != null ? contract.getOwner().getEmail() : null);
        dto.setOwnerPhoneNumber(contract.getOwner() != null ? contract.getOwner().getPhoneNumber() : null);
        dto.setImage(contract.getImage());
        dto.setContractTypeName(contract.getContractType().getTypeName());

        List<WaterMeterAssignment> assignments = waterMeterAssignmentRepository.findByContract_ContractId(contract.getContractId());
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
}
