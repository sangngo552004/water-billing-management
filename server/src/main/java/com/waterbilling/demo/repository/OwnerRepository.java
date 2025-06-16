package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.Owner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {

    Optional<Owner> findByEmail(String email);
    Optional<Owner> findByIdentityNumber(String identityNumber);
    Optional<Owner> findByAccountId(Long accountId);
    boolean existsByIdentityNumber(String identityNumber);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    Page<Owner> findByFullNameContainingIgnoreCaseAndIsActive(String searchTerm, Boolean isActive, Pageable pageable);

    Page<Owner> findByFullNameContainingIgnoreCase(String searchTerm, Pageable pageable);

    Page<Owner> findByIsActive(Boolean isActive, Pageable pageable);
}
