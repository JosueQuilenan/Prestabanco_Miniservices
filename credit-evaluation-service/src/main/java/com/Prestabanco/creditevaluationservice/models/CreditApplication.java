package com.Prestabanco.creditevaluationservice.models;

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
    // 0 -> E1 = Initial Revision
    // 1 -> E2 = Pending Documents
    // 2 -> E3 = In evaluation
    // 3 -> E4 = Pre-Approved
    // 4 -> E5 = Final Approval
    // 5 -> E6 = Approved
    // 6 -> E7 = Rejected
    // 7 -> E8 = Cancelled
    // 8 -> E9 = Payout

    private double requestedAmount;
    private LocalDate applicationDate;
    private String comment;

    // Agregar años que quiere (seleccionar entre el rango de loanType)
    private int requiredMonths;

    @JsonBackReference(value = "client-credit-applications")
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

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
