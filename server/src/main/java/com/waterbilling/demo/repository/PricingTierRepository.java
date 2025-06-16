package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.ContractType;
import com.waterbilling.demo.model.PricingTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricingTierRepository extends JpaRepository<PricingTier, Integer> {

    List<PricingTier> findByContractType_TypeId(Long contractTypeId);
    // You might want to sort these by MinUsage for accurate pricing logic
    List<PricingTier> findByContractType_TypeIdAndIsActiveTrueOrderByMinUsageAsc(Long contractTypeId);
    List<PricingTier> findByContractTypeAndIsActiveTrue(ContractType contractType);
    List<PricingTier> findByContractType(ContractType contractType);
    List<PricingTier> findByContractType_TypeIdAndIsActiveTrue(Long contractTypeId);
}
