package com.waterbilling.demo.repository;

import com.waterbilling.demo.enums.RequestStatus;
import com.waterbilling.demo.enums.RequestType;
import com.waterbilling.demo.model.Request;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    // Optional: Add specific queries if needed

    @Query("SELECT r FROM Request r " +
            "LEFT JOIN Contract c ON r.contract.contractId = c.contractId " +
            "LEFT JOIN Owner o ON c.owner.ownerId = o.ownerId " +
            "WHERE (:searchTerm IS NULL OR :searchTerm = '' " +
            "       OR CAST(r.requestId AS string) LIKE CONCAT('%', :searchTerm, '%') " +
            "       OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "       OR LOWER(o.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "      ) " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:requestType IS NULL OR r.requestType = :requestType)")
    Page<Request> searchAndFilterRequests(
            @Param("searchTerm") String searchTerm,
            @Param("status") RequestStatus status,
            @Param("requestType") RequestType requestType,
            Pageable pageable
    );


    int countByStatus(RequestStatus status);
}
