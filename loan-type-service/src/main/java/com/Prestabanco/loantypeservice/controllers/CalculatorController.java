package com.Prestabanco.loantypeservice.controllers;

import com.Prestabanco.loantypeservice.entities.LoanType;
import com.Prestabanco.loantypeservice.services.CalculatorService;
import com.Prestabanco.loantypeservice.services.LoanTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calculator")
public class CalculatorController {
    final CalculatorService calculatorService;
    private final LoanTypeService loanTypeService;
    public CalculatorController(CalculatorService calculatorService,LoanTypeService loanTypeService) {
        this.calculatorService = calculatorService;
        this.loanTypeService = loanTypeService;
    }

    @PostMapping("/calculateMonthlyPayment")
    public ResponseEntity<Double> calculateMonthlyPayment(@RequestParam double requestedAmount,
                                                          @RequestParam int requestedMonths,
                                                          @RequestParam String loanTypeName) {
        LoanType loanType = loanTypeService.getLoanTypeByLoanTypeName(loanTypeName);
        double monthlyPayment = calculatorService.calculateMonthlyPayment(requestedAmount, requestedMonths,loanType);
        return ResponseEntity.ok(monthlyPayment);
    }

    @PostMapping("/calculateTotalLoanCost")
    public ResponseEntity<Double> calculateTotalLoanCost(@RequestParam double requestedAmount,
                                                         @RequestParam int requestedMonths,
                                                         @RequestParam String loanTypeName) {
        LoanType loanType = loanTypeService.getLoanTypeByLoanTypeName(loanTypeName);
        double totalCost = calculatorService.calculateTotalLoanCost(requestedAmount, requestedMonths,loanType);
        return ResponseEntity.ok(totalCost);
    }
}
