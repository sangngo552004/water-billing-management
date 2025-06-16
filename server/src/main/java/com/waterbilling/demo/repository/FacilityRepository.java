package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.Facility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    Page<Facility > findByFullAddressContainingIgnoreCaseAndIsActive (String searchItem, Boolean isActive, Pageable pageable);

    Page<Facility > findByFullAddressContainingIgnoreCase(String searchItem, Pageable pageable);

    Page<Facility> findByIsActive(Boolean isActive, Pageable pageable);

    List<Facility> findByIsActiveFalse();
}
