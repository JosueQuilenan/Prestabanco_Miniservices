package com.Prestabanco.creditevaluationservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreditHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private int totalAmount;
    private int pendingAmount;
    private LocalDate lastCreditDate;
    private String creditRating;

    @JsonBackReference(value = "client-credit-history")
    @OneToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
}
