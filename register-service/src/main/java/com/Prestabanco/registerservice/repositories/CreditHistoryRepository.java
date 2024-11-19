package com.Prestabanco.registerservice.repositories;

import com.Prestabanco.registerservice.entities.CreditHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CreditHistoryRepository extends JpaRepository<CreditHistory, Long> {
}
