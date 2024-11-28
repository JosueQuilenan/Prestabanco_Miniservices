package com.Prestabanco.creditevaluationservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private String businessDescription;
    private String targetMarket;
    private BigInteger projectedRevenue;

    @JsonBackReference(value = "credit-application-business-plan")
    @OneToOne
    @JoinColumn(name = "credit_application_id", nullable = false)
    @EqualsAndHashCode.Exclude
    private CreditApplication creditApplication;

    @JsonManagedReference(value = "business-plan-pdf-files")
    @OneToMany(mappedBy = "businessPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PdfFileCredit> pdfFiles;
}
