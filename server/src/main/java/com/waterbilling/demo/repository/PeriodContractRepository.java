package com.waterbilling.demo.repository;

import com.waterbilling.demo.enums.PeriodContractStatus;
import com.waterbilling.demo.model.BillingPeriod;
import com.waterbilling.demo.model.PeriodContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodContractRepository extends JpaRepository<PeriodContract, Long> {

    List<PeriodContract> findByBillingPeriod_PeriodId(Long periodId);

    Page<PeriodContract> findByBillingPeriod_PeriodId(Long periodId, Pageable pageable);

    List<PeriodContract> findByBillingPeriod(BillingPeriod billingPeriod);

    Page<PeriodContract> findByBillingPeriod(BillingPeriod billingPeriod, Pageable pageable);

    Page<PeriodContract> findByBillingPeriodAndStatusAndContract_CustomerCodeContainingIgnoreCase(
            BillingPeriod billingPeriod, PeriodContractStatus status, String customerCode, Pageable pageable);
    Page<PeriodContract> findByBillingPeriodAndContract_CustomerCodeContainingIgnoreCase(
            BillingPeriod billingPeriod, String customerCode, Pageable pageable);

    Page<PeriodContract> findByBillingPeriodAndStatus(
            BillingPeriod billingPeriod, PeriodContractStatus status, Pageable pageable);

    @Query("SELECT pc FROM PeriodContract pc " +
            "JOIN pc.contract c " +
            "JOIN c.owner o " +
            "JOIN c.facility f " +
            "JOIN pc.billingPeriod p " + // Join với BillingPeriod để sắp xếp theo thời gian
            "WHERE pc.status = 'pending' " +
            "AND pc.billingPeriod.periodId = (SELECT MAX(p2.periodId) FROM PeriodContract pc2 JOIN pc2.billingPeriod p2 WHERE pc2.contract.contractId = pc.contract.contractId) " + // Hoặc MAX(p2.toDate) nếu ToDate là tiêu chí chính
            "AND (:ownerName IS NULL OR o.fullName LIKE %:ownerName%) " +
            "AND (:address IS NULL OR f.fullAddress LIKE %:address%) " +
            "AND (:customerCode IS NULL OR c.customerCode LIKE %:customerCode%) " +
            "ORDER BY p.toDate DESC, p.createdAt DESC") // Sắp xếp để đảm bảo lấy đúng kỳ mới nhất
    Page<PeriodContract> findLatestPendingPeriodContracts(
            @Param("ownerName") String ownerName,
            @Param("address") String address,
            @Param("customerCode") String customerCode,
            Pageable pageable);

    // Tìm PeriodContract theo trạng thái 'reading' và là kỳ mới nhất cho mỗi hợp đồng
    @Query("SELECT pc FROM PeriodContract pc " +
            "JOIN pc.contract c " +
            "JOIN c.owner o " +
            "JOIN c.facility f " +
            "JOIN pc.billingPeriod p " +
            "WHERE pc.status = 'reading' " +
            "AND pc.billingPeriod.periodId = (SELECT MAX(p2.periodId) FROM PeriodContract pc2 JOIN pc2.billingPeriod p2 WHERE pc2.contract.contractId = pc.contract.contractId) " +
            "AND (:ownerName IS NULL OR o.fullName LIKE %:ownerName%) " +
            "AND (:address IS NULL OR f.fullAddress LIKE %:address%) " +
            "AND (:customerCode IS NULL OR c.customerCode IS NULL OR c.customerCode LIKE %:customerCode%) " +
            "ORDER BY p.toDate DESC, p.createdAt DESC")
    Page<PeriodContract> findLatestReadingPeriodContracts(
            @Param("ownerName") String ownerName,
            @Param("address") String address,
            @Param("customerCode") String customerCode,
            Pageable pageable);

    int countByStatus(PeriodContractStatus status);
}
