package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByUsername(String username);
}
