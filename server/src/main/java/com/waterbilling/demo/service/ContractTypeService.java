package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.request.NewContractTypeRequest;
import com.waterbilling.demo.dto.request.PricingTierRequest;
import com.waterbilling.demo.dto.request.UpdateContractTypeNameRequest;
import com.waterbilling.demo.dto.request.UpdatePricingTiersRequest;
import com.waterbilling.demo.dto.response.ContractTypeWithPricingDTO;
import com.waterbilling.demo.dto.response.PricingTierDTO;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.ContractType;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.PricingTier;
import com.waterbilling.demo.repository.ContractRepository;
import com.waterbilling.demo.repository.ContractTypeRepository;
import com.waterbilling.demo.repository.EmployeeRepository;
import com.waterbilling.demo.repository.PricingTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContractTypeService {

    @Autowired
    private ContractTypeRepository contractTypeRepository;

    @Autowired
    private PricingTierRepository pricingTierRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // Helper method to map Entity to Response DTO
    private ContractTypeWithPricingDTO mapToContractTypeResponse(ContractType contractType) {
        ContractTypeWithPricingDTO response = new ContractTypeWithPricingDTO();
        response.setTypeId(contractType.getTypeId());
        response.setTypeName(contractType.getTypeName());
        response.setDescription(contractType.getDescription());
        response.setCreatedAt(contractType.getCreatedAt());
        response.setCreatedBy(contractType.getCreatedBy().getFullName());

        List<PricingTier> activeTiers = pricingTierRepository.findByContractType(contractType);
        List<PricingTierDTO> pricingTierDTOs = activeTiers.stream()
                .map(tier -> {
                    PricingTierDTO tierDto = new PricingTierDTO();
                    tierDto.setTierId(tier.getTierId());
                    tierDto.setMinUsage(tier.getMinUsage());
                    tierDto.setMaxUsage(tier.getMaxUsage());
                    tierDto.setPricePerM3(tier.getPricePerM3());
                    return tierDto;
                })
                .collect(Collectors.toList());
        response.setPricingTiers(pricingTierDTOs);
        return response;
    }



    @Transactional
    public ContractTypeWithPricingDTO addNewPricing(NewContractTypeRequest request , Long createdByEmployeeId) {
        if (contractTypeRepository.existsByTypeName(request.getTypeName())) {
            throw new InvalidRequestException("Loại hợp đồng '" + request.getTypeName() + "' đã tồn tại.");
        }
        Employee employee = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new InvalidRequestException("Invalid Employee ID."));

        List<PricingTierRequest> tiers = request.getPricingTiers();

        if (tiers == null || tiers.isEmpty()) {
            throw new InvalidRequestException("Phải có ít nhất một bậc giá.");
        }

        tiers.sort(Comparator.comparing(PricingTierRequest::getMinUsage));

        if (tiers.get(0).getMinUsage().compareTo(BigDecimal.ZERO) != 0) {
            throw new InvalidRequestException("Bậc giá đầu tiên phải có minUsage là 0.");
        }
        if (tiers.get(tiers.size() - 1).getMaxUsage() != null) {
            throw new InvalidRequestException("Bậc giá cuối cùng phải có max là null");
        }
        for (int i = 0; i < tiers.size(); i++) {
            PricingTierRequest current = tiers.get(i);

            if (current.getMaxUsage() != null &&
                    current.getMinUsage().compareTo(current.getMaxUsage()) >= 0) {
                throw new InvalidRequestException("MinUsage phải nhỏ hơn MaxUsage ở bậc thứ " + (i + 1));
            }

            if (i > 0) {
                PricingTierRequest previous = tiers.get(i - 1);
                if (previous.getMaxUsage() == null ||
                        current.getMinUsage().compareTo(previous.getMaxUsage()) != 0) {
                    throw new InvalidRequestException("MinUsage của bậc thứ " + (i + 1) +
                            " phải bằng MaxUsage của bậc thứ " + i);
                }
            }

            if (current.getMaxUsage() == null && i != tiers.size() - 1) {
                throw new InvalidRequestException("Chỉ bậc cuối cùng mới được có maxUsage = null.");
            }
        }

        ContractType contractType = new ContractType();
        contractType.setTypeName(request.getTypeName());
        contractType.setDescription(request.getDescription());
        contractType.setCreatedBy(employee);


        contractType = contractTypeRepository.save(contractType);

        for (PricingTierRequest tierRequest : request.getPricingTiers()) {
            PricingTier pricingTier = new PricingTier();
            pricingTier.setContractType(contractType);
            pricingTier.setMinUsage(tierRequest.getMinUsage());
            pricingTier.setMaxUsage(tierRequest.getMaxUsage());
            pricingTier.setPricePerM3(tierRequest.getPricePerM3());
            pricingTier.setCreatedBy(employee);
            pricingTierRepository.save(pricingTier);
        }

        return mapToContractTypeResponse(contractType);
    }

    /**
     * Cập nhật tên ContractType. Chỉ được phép nếu chưa tham gia hợp đồng nào.
     */
    @Transactional
    public ContractTypeWithPricingDTO updateContractTypeName(Long typeId, UpdateContractTypeNameRequest request) {
        ContractType contractType = contractTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("ContractType not found with ID: " + typeId));

        if (contractRepository.existsByContractType_TypeId(typeId)) {
            throw new InvalidRequestException("Không thể cập nhật tên loại hợp đồng, vì đã có hợp đồng tồn tại trong loại này.");
        }
        if (contractTypeRepository.existsByTypeName(request.getNewTypeName()) &&
                !contractType.getTypeName().equalsIgnoreCase(request.getNewTypeName())) {
            throw new InvalidRequestException("Loại hợp đồng với tên '" + request.getNewTypeName() + "' đã tồn tại.");
        }

        contractType.setTypeName(request.getNewTypeName());
        return mapToContractTypeResponse(contractTypeRepository.save(contractType));
    }


    @Transactional
    public ContractTypeWithPricingDTO updatePricingTiers(Long typeId, UpdatePricingTiersRequest request, Long createdByEmployeeId) {
        ContractType contractType = contractTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("ContractType not found with ID: " + typeId));

        List<PricingTierRequest> tiers = request.getNewPricingTiers();

        if (tiers == null || tiers.isEmpty()) {
            throw new InvalidRequestException("Phải có ít nhất một bậc giá.");
        }

        tiers.sort(Comparator.comparing(PricingTierRequest::getMinUsage));

        if (tiers.get(0).getMinUsage().compareTo(BigDecimal.ZERO) != 0) {
            throw new InvalidRequestException("Bậc giá đầu tiên phải có min là 0.");
        }
        if (tiers.get(tiers.size() - 1).getMaxUsage() != null) {
            throw new InvalidRequestException("Bậc giá cuối cùng phải có max là null");
        }

        for (int i = 0; i < tiers.size(); i++) {
            PricingTierRequest current = tiers.get(i);

            if (current.getMaxUsage() != null &&
                    current.getMinUsage().compareTo(current.getMaxUsage()) >= 0) {
                throw new InvalidRequestException("MinUsage phải nhỏ hơn MaxUsage ở bậc thứ " + (i + 1));
            }

            if (i > 0) {
                PricingTierRequest previous = tiers.get(i - 1);
                if (previous.getMaxUsage() == null ||
                        current.getMinUsage().compareTo(previous.getMaxUsage()) != 0) {
                    throw new InvalidRequestException("MinUsage của bậc thứ " + (i + 1) +
                            " phải bằng MaxUsage của bậc thứ " + i);
                }
            }

            if (current.getMaxUsage() == null && i != tiers.size() - 1) {
                throw new InvalidRequestException("Chỉ bậc cuối cùng mới được có maxUsage = null.");
            }
        }

        List<PricingTier> existingActiveTiers = pricingTierRepository.findByContractType_TypeIdAndIsActiveTrue(typeId);
        for (PricingTier tier : existingActiveTiers) {
            tier.setIsActive(false);
            pricingTierRepository.save(tier);
        }
        Employee employee = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new InvalidRequestException("Invalid Employee ID."));
        // 2. Thêm các tầng giá mới
        for (PricingTierRequest tierRequest : request.getNewPricingTiers()) {
            PricingTier newTier = new PricingTier();
            newTier.setContractType(contractType);
            newTier.setMinUsage(tierRequest.getMinUsage());
            newTier.setMaxUsage(tierRequest.getMaxUsage());
            newTier.setPricePerM3(tierRequest.getPricePerM3());
            newTier.setCreatedBy(employee); // Use updatedBy for auditing
            // isActive is true by default via @PrePersist
            pricingTierRepository.save(newTier);
        }



        return mapToContractTypeResponse(contractType);
    }


    @Transactional
    public void deleteContractType(Long typeId) {
        ContractType contractType = contractTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("ContractType not found with ID: " + typeId));

        if (contractRepository.existsByContractType_TypeId(typeId)) {
            throw new InvalidRequestException("Không thể xóa loại hợp đồng này, vì đã có hợp đồng tồn tại trong loại hợp đồng này");
        }

        List<PricingTier> tiersToDelete = pricingTierRepository.findByContractType_TypeId(typeId);
        pricingTierRepository.deleteAll(tiersToDelete);

        contractTypeRepository.delete(contractType);
    }
}
