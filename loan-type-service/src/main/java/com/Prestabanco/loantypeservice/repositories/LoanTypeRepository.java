package com.Prestabanco.loantypeservice.repositories;

import com.Prestabanco.loantypeservice.entities.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanTypeRepository extends JpaRepository<LoanType, Long> {
    LoanType findByLoanTypeName(String loanTypeName);
}
