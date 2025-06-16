package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.StopServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StopServiceRequestRepository extends JpaRepository<StopServiceRequest, Long> {
    // No specific methods needed beyond JpaRepository for basic CRUD
}