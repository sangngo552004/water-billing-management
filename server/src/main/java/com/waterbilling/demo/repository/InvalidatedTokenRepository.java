package com.waterbilling.demo.repository;

import com.waterbilling.demo.model.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
