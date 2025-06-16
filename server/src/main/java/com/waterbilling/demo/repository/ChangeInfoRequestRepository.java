package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.ChangeInfoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChangeInfoRequestRepository extends JpaRepository<ChangeInfoRequest, Long> {
    // No specific methods needed beyond JpaRepository for basic CRUD
}