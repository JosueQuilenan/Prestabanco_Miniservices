package com.Prestabanco.loantypeservice.controllers;

import com.Prestabanco.loantypeservice.entities.LoanType;
import com.Prestabanco.loantypeservice.services.LoanTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-type")

public class LoanTypeController {
    final LoanTypeService loanTypeService;
    public LoanTypeController(LoanTypeService loanTypeService) {
        this.loanTypeService = loanTypeService;
    }
    @GetMapping("/{id}")
    public ResponseEntity<LoanType> getLoanType(@PathVariable Long id) {
        return ResponseEntity.ok(loanTypeService.getLoanTypeById(id));
    }

    @GetMapping("/byLoanType")
    public ResponseEntity<LoanType> getLoanTypeByLoanTypeName(@RequestParam String loanTypeName){
        return ResponseEntity.ok(loanTypeService.getLoanTypeByLoanTypeName(loanTypeName));
    }

    @GetMapping("/")
    public ResponseEntity<List<LoanType>> getAllLoanTypes() {
        return ResponseEntity.ok(loanTypeService.getAllLoanTypes());
    }

    @PostMapping("/add")
    public ResponseEntity<LoanType> addLoanType(@RequestBody LoanType loanType) {
        return ResponseEntity.ok(loanTypeService.addLoanType(loanType));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<LoanType> updateLoanTypeById(@PathVariable Long id, @RequestBody LoanType loanType){
        loanType.setId(id);
        LoanType updatedLoanType = loanTypeService.updateLoanType(loanType);
        return ResponseEntity.ok(loanTypeService.updateLoanType(updatedLoanType));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteLoanType(@PathVariable Long id){
        try {
            boolean isDeleted = loanTypeService.deleteLoanType(id);
            if (isDeleted) {
                return ResponseEntity.ok("Loan Type " + id + " deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete loan type " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting loan type: " + e.getMessage());
        }
    }
}
