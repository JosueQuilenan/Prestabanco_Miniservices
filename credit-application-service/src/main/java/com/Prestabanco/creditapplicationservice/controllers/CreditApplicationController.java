package com.Prestabanco.creditapplicationservice.controllers;

import com.Prestabanco.creditapplicationservice.entities.CreditApplication;
import com.Prestabanco.creditapplicationservice.services.CreditApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/application")

public class CreditApplicationController {

    final CreditApplicationService creditApplicationService;

    public CreditApplicationController(CreditApplicationService creditApplicationService) {
        this.creditApplicationService = creditApplicationService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditApplication> getCreditApplication(@PathVariable Long id) {
        return ResponseEntity.ok(creditApplicationService.getCreditApplicationById(id));
    }

    @GetMapping("/byClient")
    public ResponseEntity<List<CreditApplication>> getCreditApplicationsByClientId(@RequestParam Long clientId){
        return ResponseEntity.ok(creditApplicationService.getCreditApplicationsByClientId(clientId));
    }

    @GetMapping("/")
    public ResponseEntity<List<CreditApplication>> getCreditApplications() {
        return ResponseEntity.ok(creditApplicationService.getAllCreditApplications());
    }

    @PostMapping("/add")
    public ResponseEntity<CreditApplication> addCreditApplication(@RequestBody CreditApplication creditApplication) {
        return ResponseEntity.ok(creditApplicationService.saveCreditApplication(creditApplication));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CreditApplication> updateCreditApplicationById(@PathVariable Long id, @RequestBody CreditApplication creditApplication){
        creditApplication.setId(id);
        CreditApplication updatedCreditApplication = creditApplicationService.updateCreditApplication(creditApplication);
        return ResponseEntity.ok(creditApplicationService.updateCreditApplication(updatedCreditApplication));
    }

    @PutMapping("/updateState/{id}")
    public ResponseEntity<CreditApplication> updateApplicationState(@PathVariable Long id, @RequestParam int state) {
        CreditApplication creditApplication = creditApplicationService.getCreditApplicationById(id);
        creditApplicationService.updateCreditApplicationState(creditApplication, state);
        return ResponseEntity.ok(creditApplication);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteCreditApplicationById(@PathVariable Long id){
        try {
            boolean isDeleted = creditApplicationService.deleteCreditApplication(id);
            if (isDeleted) {
                return ResponseEntity.ok("Credit application " + id + " deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete credit application " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting credit application: " + e.getMessage());
        }
    }
}
