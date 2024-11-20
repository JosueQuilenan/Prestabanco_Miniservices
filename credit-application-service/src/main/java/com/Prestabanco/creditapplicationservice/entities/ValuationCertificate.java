package com.Prestabanco.creditapplicationservice.entities;

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

@Entity
@Table(name= "valuation_certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValuationCertificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private BigInteger propertyValue;
    private LocalDate valuationDate;
    private String appraiser;

    @JsonBackReference(value = "credit-application-valuation-certificate")
    @OneToOne
    @JoinColumn(name = "credit_application_id", nullable = false)
    @EqualsAndHashCode.Exclude
    private CreditApplication creditApplication;

    @JsonManagedReference(value = "valuation-certificate-pdf-files")
    @OneToMany(mappedBy = "valuationCertificate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PdfFileCredit> pdfFiles;
}
