package com.Prestabanco.loan_type_service.repositories;

import com.Prestabanco.loan_type_service.entities.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanTypeRepository extends JpaRepository<LoanType, Long> {
    LoanType findByLoanTypeName(String loanTypeName);
}
