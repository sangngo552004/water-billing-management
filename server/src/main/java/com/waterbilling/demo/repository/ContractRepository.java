package com.waterbilling.demo.repository;

import com.waterbilling.demo.enums.ContractStatus;
import com.waterbilling.demo.model.Contract;
import com.waterbilling.demo.model.Facility;
import com.waterbilling.demo.model.Owner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findByOwner(Owner owner);
    boolean existsByFacility_FacilityIdAndStatus(Long facilityId, ContractStatus status);
    boolean existsByOwner_OwnerId(Long ownerId);
    boolean existsByOwner_OwnerIdAndStatus(Long ownerId, ContractStatus status);
    boolean existsByFacility_FacilityId(Long facilityId);
    boolean existsByContractType_TypeId(Long contractTypeId);
    List<Contract> findByStatus(ContractStatus status);
    List<Contract> findByFacility(Facility facility);

    // Tìm kiếm theo tên chủ hộ, mã khách hàng, địa chỉ cơ sở
    @Query("SELECT c FROM Contract c WHERE " +
            "(:ownerName IS NULL OR LOWER(c.owner.fullName) LIKE LOWER(CONCAT('%', :ownerName, '%'))) OR " +
            "(:customerCode IS NULL OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :customerCode, '%'))) OR " +
            "(:facilityAddress IS NULL OR LOWER(c.facility.fullAddress) LIKE LOWER(CONCAT('%', :facilityAddress, '%')))")
    Page<Contract> findByOwner_FullNameContainingIgnoreCaseOrCustomerCodeContainingIgnoreCaseOrFacility_FullAddressContainingIgnoreCase(
            @Param("ownerName") String ownerName,
            @Param("customerCode") String customerCode,
            @Param("facilityAddress") String facilityAddress,
            Pageable pageable);

    // Tìm kiếm kết hợp với trạng thái
    @Query("SELECT c FROM Contract c WHERE " +
            "(:status IS NULL OR c.status = :status) AND (" +
            "(:searchTerm IS NULL OR LOWER(c.owner.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) OR " +
            "(:searchTerm IS NULL OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) OR " +
            "(:searchTerm IS NULL OR LOWER(c.facility.fullAddress) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))")
    Page<Contract> findByStatusAndSearchTerm(
            @Param("status") ContractStatus status,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    Page<Contract> findByStatus(ContractStatus status, Pageable pageable);
}
