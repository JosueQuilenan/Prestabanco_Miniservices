package com.Prestabanco.creditevaluationservice.controllers;

import com.Prestabanco.creditevaluationservice.models.*;
import com.Prestabanco.creditevaluationservice.services.CreditEvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/creditEvaluation/")
public class CreditEvaluationController {

    final CreditEvaluationService creditEvaluationService;

    public CreditEvaluationController(CreditEvaluationService creditEvaluationService) {
        this.creditEvaluationService = creditEvaluationService;
    }

    @PostMapping("/preApprovedDecision")
    public ResponseEntity<Void> preApprovedDecision(@RequestBody CreditApplication creditApplication) {
        creditEvaluationService.preApprovedDecision(creditApplication);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/evaluateSavingCapacity")
    public ResponseEntity<String> evaluateSavingCapacity(@RequestBody CreditApplication creditApplication,
                                                         @RequestParam boolean R72Decision,
                                                         @RequestParam boolean R73Decision,
                                                         @RequestParam boolean R75Decision) {
        String result = creditEvaluationService.evalSavingCapacity(creditApplication, R72Decision, R73Decision, R75Decision);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/evaluateJobStability")
    public ResponseEntity<Boolean> evaluateJobStability(@RequestBody CreditApplication creditApplication,
                                                        @RequestParam Boolean executiveDecision) {
        boolean result = creditEvaluationService.evalJobStability(creditApplication, executiveDecision);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/evaluateCreditHistory")
    public ResponseEntity<Boolean> evaluateCreditHistory(@RequestBody CreditApplication creditApplication) {
        boolean result = creditEvaluationService.evalCreditHistory(creditApplication);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/evaluate")
    public ResponseEntity<CreditApplication> evaluate(@RequestBody CreditApplication creditApplication,
                                                      @RequestParam String comment,
                                                      @RequestParam int state) {
        creditEvaluationService.updateAndAddComment(creditApplication, comment, state);
        return ResponseEntity.ok().build();
    }
}
