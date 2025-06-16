package com.waterbilling.demo.repository;

import com.waterbilling.demo.enums.NotificationType;
import com.waterbilling.demo.model.Facility;
import com.waterbilling.demo.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByContract_ContractId(Long contractId, Pageable pageable);
    Page<Notification> findByContract_ContractIdAndNotificationType(Long contractId, NotificationType notificationType, Pageable pageable);

    int countByContract_ContractIdAndIsReadFalse(Long contractId);
}