package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.Contract;
import com.waterbilling.demo.model.WaterMeter;
import com.waterbilling.demo.model.WaterMeterAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaterMeterAssignmentRepository extends JpaRepository<WaterMeterAssignment, Long> {
    List<WaterMeterAssignment> findByContract_ContractId(Long contractId);
    List<WaterMeterAssignment> findByContract_ContractIdAndIsActiveTrue(Long contractId);
    Optional<WaterMeterAssignment> findByContract_ContractIdAndWaterMeter_WaterMeterId(Long contractId, Long waterMeterId);
    boolean existsByWaterMeter_WaterMeterId( Long waterMeterId);
    boolean existsByContract_ContractIdAndWaterMeter_WaterMeterId(Long contractId, Long waterMeterId);
    List<WaterMeterAssignment> findByWaterMeter(WaterMeter waterMeter);
    int countByContractAndIsActiveTrue(Contract contract);
}

