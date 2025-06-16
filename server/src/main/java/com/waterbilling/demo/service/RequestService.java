package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.response.ChangeInfoRequestDTO;
import com.waterbilling.demo.dto.response.RequestDetailDTO;
import com.waterbilling.demo.dto.response.RequestResponseDTO;
import com.waterbilling.demo.dto.response.StopServiceRequestDTO;
import com.waterbilling.demo.enums.RequestStatus;
import com.waterbilling.demo.enums.RequestType;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.ChangeInfoRequest;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.Request;
import com.waterbilling.demo.model.StopServiceRequest;
import com.waterbilling.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

// --- Request Management Service (admin side of Request) ---
@Service
public class RequestService { // This service will handle common Request logic and admin approval

    @Autowired
    private RequestRepository requestRepository;
    @Autowired
    private ChangeInfoRequestRepository changeInfoRequestRepository;
    @Autowired
    private StopServiceRequestRepository stopServiceRequestRepository;
    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private ContractRepository contractRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private FacilityRepository facilityRepository;
    @Autowired
    private WaterMeterAssignmentRepository waterMeterAssignmentRepository;
    @Autowired
    private WaterMeterRepository waterMeterRepository;

    @Transactional(readOnly = true)
    public Page<RequestResponseDTO> getAllRequests(
            String searchTerm,
            RequestStatus status,
            RequestType requestType,
            Pageable pageable) {

        Page<Request> requests;

        // Sử dụng phương thức searchAndFilterRequests linh hoạt
        requests = requestRepository.searchAndFilterRequests(searchTerm, status, requestType, pageable);


        return requests.map(this::convertToRequestResponseDTO);
    }

    @PreAuthorize("hasRole('admin')")
    public RequestResponseDTO getRequestById(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));
        return convertToRequestResponseDTO(request);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public RequestResponseDTO approveRequest(Long requestId, Long adminEmployeeId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.pending) {
            throw new InvalidRequestException("Request is not in pending status.");
        }

        Employee admin = employeeRepository.findById(adminEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("admin Employee not found."));

        request.setStatus(RequestStatus.approved);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedBy(admin);
        requestRepository.save(request);

        return convertToRequestResponseDTO(request);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public RequestResponseDTO rejectRequest(Long requestId, Long adminEmployeeId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.pending) {
            throw new InvalidRequestException("Request is not in pending status.");
        }

        Employee admin = employeeRepository.findById(adminEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("admin Employee not found."));

        request.setStatus(RequestStatus.rejected);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedBy(admin);
        requestRepository.save(request);
        return convertToRequestResponseDTO(request);
    }

    @Transactional(readOnly = true)
    public RequestDetailDTO getRequestDetails(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        RequestDetailDTO dto = new RequestDetailDTO();
        dto.setRequestId(request.getRequestId());
        dto.setRequestType(request.getRequestType().name());
        dto.setStatus(request.getStatus().name());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setApprovedByEmployee(request.getApprovedBy() != null ? request.getApprovedBy().getFullName() : null);

        // Thêm thông tin Contract và Owner
        if (request.getContract() != null) {
            dto.setContractId(request.getContract().getContractId());
            dto.setCustomerCode(request.getContract().getCustomerCode());
            if (request.getContract().getOwner() != null) {
                dto.setOwnerFullName(request.getContract().getOwner().getFullName());
            }
        }

        if (request instanceof ChangeInfoRequest changeInfoRequest) {
            ChangeInfoRequestDTO changeInfoDto = new ChangeInfoRequestDTO();
            changeInfoDto.setOldFullName(changeInfoRequest.getOldFullName());
            changeInfoDto.setOldEmail(changeInfoRequest.getOldEmail());
            changeInfoDto.setOldPhoneNumber(changeInfoRequest.getOldPhoneNumber());
            changeInfoDto.setNewFullName(changeInfoRequest.getNewFullName());
            changeInfoDto.setNewEmail(changeInfoRequest.getNewEmail());
            changeInfoDto.setNewPhoneNumber(changeInfoRequest.getNewPhoneNumber());
            dto.setChangeInfoDetails(changeInfoDto);
        } else if (request instanceof StopServiceRequest stopServiceRequest) {
            StopServiceRequestDTO stopServiceDto = new StopServiceRequestDTO();
            stopServiceDto.setReason(stopServiceRequest.getReason());
            dto.setStopServiceDetails(stopServiceDto);
        }

        return dto;
    }

    private RequestResponseDTO convertToRequestResponseDTO(Request request) {
        RequestResponseDTO dto = new RequestResponseDTO();
        dto.setRequestId(request.getRequestId());
        dto.setRequestType(request.getRequestType().name());
        dto.setStatus(request.getStatus().name());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setOwnerFullName(request.getContract().getOwner().getFullName());
        dto.setCustomerCode(request.getContract().getCustomerCode());
        return dto;
    }
}
