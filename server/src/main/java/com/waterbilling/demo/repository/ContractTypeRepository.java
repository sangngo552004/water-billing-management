package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.ContractType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractTypeRepository extends JpaRepository<ContractType, Long> {

    boolean existsByTypeName(String typeName);
}
