package com.Prestabanco.creditevaluationservice.models;

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
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private String name;
    private String lastName;
    private String rut;
    private String email;
    private String phone;
    private LocalDate registrationDate;
    private LocalDate birthDate;
    private boolean isIndependentWorker;


    @JsonManagedReference(value = "client-credit-history")
    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL)
    private CreditHistory creditHistory;

    @JsonManagedReference(value = "client-savings-account")
    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL)
    private SavingsAccount savingsAccount;

    public Client(String name, String lastName, String rut, String mail, String number, LocalDate regDate, LocalDate birthDate, boolean indWork) {
        this.name = name;
        this.lastName = lastName;
        this.rut = rut;
        this.email = mail;
        this.phone = number;
        this.registrationDate = regDate;
        this.birthDate = birthDate;
        this.isIndependentWorker = indWork;
    }
}
