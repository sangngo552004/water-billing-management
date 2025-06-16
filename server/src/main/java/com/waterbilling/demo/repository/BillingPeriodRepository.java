package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.BillingPeriod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingPeriodRepository extends JpaRepository<BillingPeriod, Long> {

    Page<BillingPeriod>  findByCreatedAt_Year(int year, Pageable pageable);
    Optional<BillingPeriod> findByPeriodName(String periodName);
    Optional<BillingPeriod> findTopByOrderByToDateDesc();
}
