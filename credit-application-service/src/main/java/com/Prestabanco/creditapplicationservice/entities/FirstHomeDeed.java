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
@Table(name= "first_home_deeds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstHomeDeed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private BigInteger deedNumber;
    private String propertyAddress;
    private LocalDate registrationDate;

    @JsonBackReference(value = "credit-application-first-home-deed")
    @OneToOne
    @JoinColumn(name = "credit_application_id", nullable = false)
    @EqualsAndHashCode.Exclude
    private CreditApplication creditApplication;

    @JsonManagedReference(value = "first-home-deed-pdf-files")
    @OneToMany(mappedBy = "firstHomeDeed", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PdfFileCredit> pdfFiles;
}
