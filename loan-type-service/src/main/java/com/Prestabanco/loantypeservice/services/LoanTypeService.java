package com.Prestabanco.loantypeservice.services;

import com.Prestabanco.loantypeservice.entities.LoanType;
import com.Prestabanco.loantypeservice.repositories.LoanTypeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanTypeService {
    final LoanTypeRepository loanTypeRepository;

    public LoanTypeService(LoanTypeRepository loanTypeRepository) {
        this.loanTypeRepository = loanTypeRepository;
    }

    public List<LoanType> getAllLoanTypes() {
        return loanTypeRepository.findAll();
    }

    public LoanType getLoanTypeById(Long id) {
        return loanTypeRepository.findById(id).orElse(null);
    }

    public LoanType getLoanTypeByLoanTypeName(String loanTypeName) {
        return loanTypeRepository.findByLoanTypeName(loanTypeName);
    }

    public LoanType addLoanType(LoanType loanType) {
        return loanTypeRepository.save(loanType);
    }

    public LoanType updateLoanType(LoanType loanType) {
        return loanTypeRepository.save(loanType);
    }

    public boolean deleteLoanType(Long id) throws Exception {
        if (!loanTypeRepository.existsById(id)) {
            throw new Exception("LoanType with ID " + id + " does not exist.");
        }
        else {
            loanTypeRepository.deleteById(id);
            return true;
        }
    }


    @PostConstruct
    public void init() {
        if (loanTypeRepository.count() == 0) {
            LoanType loanType1 = new LoanType();
            loanType1.setLoanTypeName("First home");
            loanType1.setMaxTerm(30); // 30 years
            loanType1.setMinInterestRate(0.035); // 3.5%
            loanType1.setMaxInterestRate(0.05); // 5%
            loanType1.setMaxAmountFinancing(0.8); // 80%

            LoanType loanType2 = new LoanType();
            loanType2.setLoanTypeName("Second home");
            loanType2.setMaxTerm(20); // 20 years
            loanType2.setMinInterestRate(0.04); // 4%
            loanType2.setMaxInterestRate(0.06); // 6%
            loanType2.setMaxAmountFinancing(0.7); // 70%

            LoanType loanType3 = new LoanType();
            loanType3.setLoanTypeName("Commercial Properties");
            loanType3.setMaxTerm(25); // 25 years
            loanType3.setMinInterestRate(0.05); // 5%
            loanType3.setMaxInterestRate(0.07); // 7%
            loanType3.setMaxAmountFinancing(0.6); // 60%

            LoanType loanType4 = new LoanType();
            loanType4.setLoanTypeName("Remodeling");
            loanType4.setMaxTerm(15); // 15 years
            loanType4.setMinInterestRate(0.045); // 4.5%
            loanType4.setMaxInterestRate(0.06); // 6%
            loanType4.setMaxAmountFinancing(0.5); // 50%

            loanTypeRepository.save(loanType1);
            loanTypeRepository.save(loanType2);
            loanTypeRepository.save(loanType3);
            loanTypeRepository.save(loanType4);

            System.out.println("Types of loans saved on the database dictionary.");
        }
    }
}
