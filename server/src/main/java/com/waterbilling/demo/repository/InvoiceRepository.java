package com.waterbilling.demo.repository;

import com.waterbilling.demo.dto.response.RevenueByPeriodDTO;
import com.waterbilling.demo.enums.InvoiceStatus;
import com.waterbilling.demo.model.Contract;
import com.waterbilling.demo.model.Facility;
import com.waterbilling.demo.model.Invoice;


import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    // For Owner:
    @Query("SELECT i FROM Invoice i WHERE i.contractPeriod.contract.contractId = :contractId AND FUNCTION('YEAR', i.createdAt) = :year")
    Page<Invoice> findByContractIdAndYear(@Param("contractId") Long contractId, @Param("year") int year, Pageable pageable);
    Page<Invoice> findByContractPeriod_Contract_ContractIdAndCreatedAt_YearAndContractPeriod_Contract_CustomerCodeContaining(Long contractId, int year, String customerCode, Pageable pageable);

    boolean existsByContractPeriod_ContractPeriodIdAndStatusNot(Long contractPeriodId, InvoiceStatus status);
    @Query("SELECT SUM(i.totalUsage) FROM Invoice i WHERE i.contractPeriod.contract.contractId = :contractId AND YEAR(i.createdAt) = :year AND i.status != 'cancelled'")
    Optional<BigDecimal> sumTotalUsageByContractAndYear(@Param("contractId") Long contractId, @Param("year") int year);

    // Phương thức tìm kiếm hóa đơn cho Admin
    Page<Invoice> findByContractPeriod_BillingPeriod_PeriodIdAndContractPeriod_Contract_CustomerCodeContainingIgnoreCase(
            Long billingPeriodId, String customerCode, Pageable pageable);
    Page<Invoice> findByContractPeriod_BillingPeriod_PeriodId(Long billingPeriodId, Pageable pageable);
    Page<Invoice> findByContractPeriod_Contract_CustomerCodeContainingIgnoreCase(String customerCode, Pageable pageable);

    // Lấy danh sách hóa đơn cần thu (unpaid/overdue) cho kỳ hợp đồng mới nhất của mỗi hợp đồng
    @Query("SELECT i FROM Invoice i " +
            "JOIN i.contractPeriod cp " +
            "JOIN cp.contract c " +
            "JOIN c.owner o " +
            "JOIN cp.billingPeriod p " +
            "WHERE i.status IN ('UNPAID', 'OVERDUE') " +
            "AND cp.contractPeriodId = (SELECT MAX(pc2.contractPeriodId) FROM PeriodContract pc2 WHERE pc2.contract.contractId = cp.contract.contractId) " + // Đảm bảo là kỳ mới nhất
            "AND (:ownerName IS NULL OR o.fullName LIKE %:ownerName%) " +
            "AND (:customerCode IS NULL OR c.customerCode LIKE %:customerCode%) " +
            "ORDER BY p.toDate DESC, p.createdAt DESC")
    Page<Invoice> findLatestInvoicesToCollect(
            @Param("ownerName") String ownerName,
            @Param("customerCode") String customerCode,
            Pageable pageable);

    Optional<Invoice> findTopByContractPeriod_ContractOrderByInvoiceIdDesc(Contract contract);

    List<Invoice> findByStatusAndCreatedAtBeforeAndPaidAtIsNull(InvoiceStatus status, LocalDateTime date);

    Page<Invoice> findByContractPeriod_BillingPeriod_PeriodIdAndContractPeriod_Contract_CustomerCodeContainingIgnoreCaseAndStatus(
            Long periodId, String customerCode, InvoiceStatus status, Pageable pageable);

    Page<Invoice> findByContractPeriod_BillingPeriod_PeriodIdAndStatus(
            Long periodId, InvoiceStatus status, Pageable pageable);

    Page<Invoice> findByContractPeriod_Contract_CustomerCodeContainingIgnoreCaseAndStatus(
            String customerCode, InvoiceStatus status, Pageable pageable);

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    @Query("SELECT new com.waterbilling.demo.dto.response.RevenueByPeriodDTO(" +
            "bp.periodId, bp.periodName, bp.fromDate, bp.toDate, SUM(i.totalPrice)) " +
            "FROM Invoice i JOIN i.contractPeriod pc JOIN pc.billingPeriod bp " +
            "WHERE i.status = 'paid' " +
            "AND (:year IS NULL OR FUNCTION('YEAR', bp.fromDate) = :year) " + // Filter by year
            "GROUP BY bp.periodId, bp.periodName, bp.fromDate, bp.toDate " +
            "ORDER BY bp.fromDate ASC")
    List<RevenueByPeriodDTO> findTotalRevenueByPeriod(Integer year);
}