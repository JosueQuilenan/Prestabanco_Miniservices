package com.Prestabanco.credifollowupservice.controllers;

import com.Prestabanco.credifollowupservice.models.*;
import com.Prestabanco.credifollowupservice.services.CreditFollowUpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/creditFollowUp/")
public class CreditFollowUpController {

    final CreditFollowUpService creditFollowUpService;

    public CreditFollowUpController(CreditFollowUpService creditFollowUpService) {
        this.creditFollowUpService = creditFollowUpService;
    }

    @PutMapping("/cancelApplication/{id}")
    public ResponseEntity<Void> cancelApplication(@PathVariable Long id) {
        creditFollowUpService.cancelApplication(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/finalApprove/{id}")
    public ResponseEntity<CreditApplication> finalApproveApplication(@PathVariable Long id) {
        creditFollowUpService.finalApprobation(id);
        return ResponseEntity.ok().build();
    }
}
