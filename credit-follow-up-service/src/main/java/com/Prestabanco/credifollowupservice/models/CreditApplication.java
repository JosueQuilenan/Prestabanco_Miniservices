package com.Prestabanco.credifollowupservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private int applicationState;

    private double requestedAmount;
    private LocalDate applicationDate;
    private String comment;
    private double interestRate;
    private int requiredMonths;

    @JsonBackReference(value = "client-credit-applications")
    private Long clientId;

    @ManyToOne
    @JoinColumn(name = "loan_type_id")
    private LoanType loanType;

    @JsonManagedReference(value = "credit-application-business-financial-statement")
    @OneToOne(mappedBy = "creditApplication", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    private BusinessFinancialStatement businessFinancialStatement;

    @JsonManagedReference(value = "credit-application-business-plan")
    @OneToOne(mappedBy = "creditApplication", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    private BusinessPlan businessPlan;

    @JsonManagedReference(value = "credit-application-first-home-deed")
    @OneToOne(mappedBy = "creditApplication", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    private FirstHomeDeed firstHomeDeed;

    @JsonManagedReference(value = "credit-application-income-proof")
    @OneToOne(mappedBy = "creditApplication", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    private IncomeProof incomeProof;

    @JsonManagedReference(value = "credit-application-renovation-budget")
    @OneToOne(mappedBy = "creditApplication", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    private RenovationBudget renovationBudget;

    @JsonManagedReference(value = "credit-application-valuation-certificate")
    @OneToOne(mappedBy = "creditApplication", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    private ValuationCertificate valuationCertificate;
}
