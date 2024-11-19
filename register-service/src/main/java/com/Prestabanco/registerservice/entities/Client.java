package com.Prestabanco.registerservice.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name= "clients")
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
}
