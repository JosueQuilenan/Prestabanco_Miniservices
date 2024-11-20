package com.Prestabanco.loantypeservice.services;

import com.Prestabanco.loantypeservice.entities.LoanType;
import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    // Monthly Payment Calculator
    public double calculateMonthlyPayment(double requestedAmount, int requestedMonths, LoanType loanType) {
        double averageInterestRate = (loanType.getMinInterestRate() + loanType.getMaxInterestRate()) / 2;
        double monthlyInterestRate = averageInterestRate / 12;
        return requestedAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, requestedMonths * 12)) /
                (Math.pow(1 + monthlyInterestRate, requestedMonths * 12) - 1);
    }

    // Total Costs Calculator
    public double calculateTotalLoanCost(double requestedAmount, int requestedMonths, LoanType loanType){
        double monthlyPayment = calculateMonthlyPayment(requestedAmount, requestedMonths, loanType);
        double monthlyFireInsurance = 20000;
        double monthlyDegravamenInsure = requestedAmount * 0.0003;
        double administrationFee = requestedAmount * 0.01;
        double totalMonthlyCost = monthlyDegravamenInsure + monthlyPayment + monthlyFireInsurance;
        int loanDurationMonths = loanType.getMaxTerm() * 12;
        return (totalMonthlyCost * loanDurationMonths) + administrationFee;
    }
}
