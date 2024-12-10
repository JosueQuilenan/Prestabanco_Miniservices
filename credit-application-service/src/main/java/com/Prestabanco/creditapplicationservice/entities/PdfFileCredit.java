package com.Prestabanco.creditapplicationservice.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="pdf_files")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PdfFileCredit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private byte[] PdfFile;

    @JsonBackReference(value = "business-financial-statement-pdf-files")
    @ManyToOne
    @JoinColumn(name = "business_financial_statement_id")
    private BusinessFinancialStatement businessFinancialStatement;

    @JsonBackReference(value = "business-plan-pdf-files")
    @ManyToOne
    @JoinColumn(name = "business_plan_id")
    private BusinessPlan businessPlan;

    @JsonBackReference(value = "first-home-deed-pdf-files")
    @ManyToOne
    @JoinColumn(name = "first_home_deed_id")
    private FirstHomeDeed firstHomeDeed;

    @JsonBackReference(value = "income-proof-pdf-files")
    @ManyToOne
    @JoinColumn(name = "income_proof_id")
    private IncomeProof incomeProof;

    @JsonBackReference(value = "renovation-budget-pdf-files")
    @ManyToOne
    @JoinColumn(name = "renovation_budget_id")
    private RenovationBudget renovationBudget;

    @JsonBackReference(value = "valuation-certificate-pdf-files")
    @ManyToOne
    @JoinColumn(name = "valuation_certificate_id")
    private ValuationCertificate valuationCertificate;
}
