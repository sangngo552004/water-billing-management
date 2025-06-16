package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Boolean existsByPhoneNumber(String phoneNumber);
    Boolean existsByEmail(String email);

    Optional<Employee> findByAccount_AccountId(Long accountId);

    Page<Employee> findByFullNameContainingIgnoreCaseAndIsActive(String searchTerm, Boolean isActive, Pageable pageable);

    Page<Employee> findByFullNameContainingIgnoreCase(String searchTerm, Pageable pageable);

    Page<Employee> findByIsActive(Boolean isActive, Pageable pageable);
}
