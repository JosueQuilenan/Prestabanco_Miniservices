package com.Prestabanco.registerservice.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditApplication {
    private Long id;
    /* 0 -> E1 = Initial Revision
     1 -> E2 = Pending Documents
     2 -> E3 = In evaluation
     3 -> E4 = Pre-Approved
     4 -> E5 = Final Approval
     5 -> E6 = Approved
     6 -> E7 = Rejected
     7 -> E8 = Cancelled
     8 -> E9 = Payout*/
    private int applicationState;
    private double requestedAmount;
    private int requiredMonths;
    private LocalDate applicationDate;
    private String comment;
    private Long clientId;
    private String loanTypeName;
}
