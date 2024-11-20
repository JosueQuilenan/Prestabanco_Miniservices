package com.Prestabanco.creditapplicationservice.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.List;

@Entity
@Table(name= "business_financial_statements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessFinancialStatement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private BigInteger totalAssets;
    private BigInteger totalLiabilities;
    private BigInteger netIncome;

    @JsonBackReference(value = "credit-application-business-financial-statement")
    @OneToOne
    @JoinColumn(name = "credit_application_id", nullable = false)
    @EqualsAndHashCode.Exclude
    private CreditApplication creditApplication;

    @JsonManagedReference(value = "business-financial-statement-pdf-files")
    @OneToMany(mappedBy = "businessFinancialStatement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PdfFileCredit> pdfFiles;
}
