package com.Prestabanco.loantypeservice.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name= "loan_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private String loanTypeName;
    private int maxTerm;
    private double minInterestRate;
    private double maxInterestRate;
    private double maxAmountFinancing;
}
