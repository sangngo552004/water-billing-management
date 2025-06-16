package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.Facility;
import com.waterbilling.demo.model.WaterMeter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaterMeterRepository extends JpaRepository<WaterMeter, Long> {

    Optional<WaterMeter> findBySerialNumber(String serialNumber);

    Page<WaterMeter> findBySerialNumberContainingIgnoreCaseAndIsActive(String searchTerm, Boolean isActive, Pageable pageable);

    Page<WaterMeter> findBySerialNumberContainingIgnoreCase(String searchTerm, Pageable pageable);

    Page<WaterMeter> findByIsActive(Boolean isActive, Pageable pageable);

    List<WaterMeter> findByIsActiveFalse();


}
