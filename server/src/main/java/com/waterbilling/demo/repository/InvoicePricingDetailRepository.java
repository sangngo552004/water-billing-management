package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.InvoicePricingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoicePricingDetailRepository extends JpaRepository<InvoicePricingDetail, Long> {
    // Optional: Add specific queries if needed
}