package com.Prestabanco.credifollowupservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenovationBudget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private BigInteger estimatedCost;
    private LocalDate expectedCompletionDate;

    @JsonBackReference(value = "credit-application-renovation-budget")
    @OneToOne
    @JoinColumn(name = "credit_application_id", nullable = false)
    @EqualsAndHashCode.Exclude
    private CreditApplication creditApplication;

    @JsonManagedReference(value = "renovation-budget-pdf-files")
    @OneToMany(mappedBy = "renovationBudget", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PdfFileCredit> pdfFiles;
}
