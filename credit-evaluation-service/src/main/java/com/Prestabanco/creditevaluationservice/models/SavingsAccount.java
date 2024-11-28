package com.Prestabanco.creditevaluationservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavingsAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double balance;
    private LocalDate accountOpeningDate;

    @JsonBackReference(value = "client-savings-account")
    @OneToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @JsonManagedReference(value = "savings-account-pdf-files")
    @OneToMany(mappedBy = "savingsAccount", cascade = CascadeType.ALL)
    private List<PdfFileClient> pdfFiles;
}