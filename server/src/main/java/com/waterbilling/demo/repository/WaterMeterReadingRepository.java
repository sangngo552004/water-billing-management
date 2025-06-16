package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.PeriodContract;
import com.waterbilling.demo.model.WaterMeterReading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface WaterMeterReadingRepository extends JpaRepository<WaterMeterReading, Long> {
    // For Owner:
    Page<WaterMeterReading> findByAssignment_AssignmentIdAndCreatedAt_Year(Long assignmentId, int year, Pageable pageable);
    Page<WaterMeterReading> findByAssignment_AssignmentId(Long assignmentId, Pageable pageable);
    boolean existsByContractPeriod_BillingPeriod_PeriodId(Long periodId);
    // For Employee:
    List<WaterMeterReading> findByContractPeriod_ContractPeriodId(Long contractPeriodId);
    List<WaterMeterReading> findByContractPeriod(PeriodContract contract);

    boolean existsByAssignment_AssignmentIdAndContractPeriod_ContractPeriodId(Long assignmentId, Long contractPeriodId);
    int countByIsConfirmFalse();
    int countByContractPeriod(PeriodContract contract);

}
