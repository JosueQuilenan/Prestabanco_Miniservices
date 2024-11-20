package com.Prestabanco.creditapplicationservice.repositories;

import com.Prestabanco.creditapplicationservice.entities.CreditApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditApplicationRepository extends JpaRepository<CreditApplication, Long> {
    List<CreditApplication> getByClientId(Long clientId);
}
