package com.Prestabanco.creditevaluationservice.services;

import com.Prestabanco.creditevaluationservice.entities.Evaluation;
import com.Prestabanco.creditevaluationservice.models.*;
import com.Prestabanco.creditevaluationservice.repositories.EvaluationRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;

@Service
public class CreditEvaluationService {

    private final RestTemplate restTemplate;
    private final EvaluationRepository evaluationRepository;

    public CreditEvaluationService(RestTemplate restTemplate, EvaluationRepository evaluationRepository) {
        this.restTemplate = restTemplate;
        this.evaluationRepository = evaluationRepository;
    }

    // R1 Client Fee to Income ratio ( Required )
    private boolean evalFeeToIncome(CreditApplication creditApplication) {
        double clientIncome = creditApplication.getIncomeProof().getAverageIncomeAmount();
        int requestedAmount = (int) creditApplication.getRequestedAmount();
        BigDecimal monthlyPayment = fetchMonthlyPayment(requestedAmount, creditApplication.getRequiredMonths(), creditApplication.getInterestRate());
        BigDecimal clientIncomeBD = BigDecimal.valueOf(clientIncome);
        BigDecimal percentage = monthlyPayment
                .multiply(BigDecimal.valueOf(100)) // Multiplicar por 100
                .divide(clientIncomeBD, 2, RoundingMode.HALF_UP); // Dividir por ingresos con 2 decimales

        return percentage.compareTo(BigDecimal.valueOf(35.00)) <= 0;
    }

    // R2 Client credit History
    public boolean evalCreditHistory(CreditApplication creditApplication){
        Client client = fetchClient(creditApplication.getClientId());
        CreditHistory creditHistory = client.getCreditHistory();
        if (creditHistory == null ) {
            return false;
        }
        return !creditHistory.getCreditRating().equalsIgnoreCase("E") &&
                !creditHistory.getCreditRating().equalsIgnoreCase("F") &&
                !creditHistory.getCreditRating().equalsIgnoreCase("D");
    }

    // R3 Client Job Stability ( Required )
    public boolean evalJobStability(CreditApplication creditApplication, Boolean executiveDecision){
        Client client = fetchClient(creditApplication.getClientId());
        IncomeProof incomeProof = creditApplication.getIncomeProof();
        if (client.isIndependentWorker() && incomeProof.getPdfFiles() != null){
            return executiveDecision;
        }
        else{
            LocalDate startDate = incomeProof.getStartDate();
            Period period = Period.between(startDate, LocalDate.now());
            return period.toTotalMonths() >= 18;
        }
    }

    // R4 Client Debt to Income Ratio ( Required )
    private boolean evalDebtToIncome(CreditApplication creditApplication, Client client){
        IncomeProof incomeProof = creditApplication.getIncomeProof();
        double clientIncome = incomeProof.getAverageIncomeAmount();
        CreditHistory creditHistory = client.getCreditHistory();
        if (creditHistory == null) return false;
        int totalDebt = creditHistory.getPendingAmount();
        BigDecimal monthlyPayment = fetchMonthlyPayment(totalDebt, creditApplication.getRequiredMonths(), creditApplication.getInterestRate());
        BigDecimal totalMonthlyDebt = BigDecimal.valueOf(totalDebt).add(monthlyPayment);

        double debtToIncomeRatio = totalMonthlyDebt.doubleValue() / clientIncome;
        return debtToIncomeRatio <= 0.50;
    }

    // R5 Max Financing Amount ( Required )
    private boolean evalMaxFinancingAmount(CreditApplication creditApplication){
        LoanType loanType = fetchLoanType(creditApplication.getLoanTypeName());
        return creditApplication.getRequestedAmount() <= creditApplication.getValuationCertificate().getPropertyValue().doubleValue() * (loanType.getMaxAmountFinancing());
    }

    // R6 Client Age ( Required )
    private boolean evalAge(CreditApplication creditApplication, Client client){
        LoanType loanType = fetchLoanType(creditApplication.getLoanTypeName());
        if (client.getBirthDate() == null){
            return false;
        }
        int age = Period.between(client.getBirthDate(), LocalDate.now()).getYears();

        if (age < 18 || age >= 75) {
            return false;
        }
        return (age + loanType.getMaxTerm()) < 75;
    }

    // R7.1 Min Income Required
    private int evalMinIncomeRequired(SavingsAccount savingsAccount, double requestedAmount){
        if (savingsAccount.getBalance() >= requestedAmount * 0.10) return 1;
        else return 0;
    }
    // R7.2 Consistent Savings History
    private int evalConsistentSavingsHistory(boolean executiveDecision){
        return executiveDecision ? 1 : 0;
    }

    // R7.3 Periodic Deposits
    private int evalPeriodicDeposits(boolean executiveDecision) {
        return executiveDecision ? 1 : 0;
    }

    // R7.4 Income to Age Ratio
    private int evalSavingsToAccountAgeRatio(SavingsAccount savingsAccount, double requestedAmount) {
        int accountAgeYears = Period.between(savingsAccount.getAccountOpeningDate(), LocalDate.now()).getYears();
        double requiredBalancePercentage = (accountAgeYears < 2) ? 0.20 : 0.10;
        if (savingsAccount.getBalance() >= requestedAmount * requiredBalancePercentage) return 1;
        else return 0;
    }

    // R7.5 Recent Withdrawals
    private int evalRecentWithdrawals(boolean executiveDecision) {
        return executiveDecision ? 1 : 0;
    }

    // R7 Saving capacity
    public String evalSavingCapacity(CreditApplication creditApplication, boolean R72Decision, boolean R73Decision, boolean R75Decision){
        Client client = fetchClient(creditApplication.getClientId());
        SavingsAccount savingsAccount = client.getSavingsAccount();
        double requestedAmount = creditApplication.getRequestedAmount();
        int positiveEvaluations =
                evalMinIncomeRequired(savingsAccount, requestedAmount) +
                        evalConsistentSavingsHistory(R72Decision) +
                        evalPeriodicDeposits(R73Decision) +
                        evalSavingsToAccountAgeRatio(savingsAccount, requestedAmount) +
                        evalRecentWithdrawals(R75Decision);
        if (positiveEvaluations >= 5){
            return "Sólida";
        } else if (positiveEvaluations >= 3){
            return "Moderada";
        }
        else{
            return "Insuficiente";
        }
    }

    // Initial Decision (E3)
    public void preApprovedDecision(CreditApplication creditApplication){
        Client client = fetchClient(creditApplication.getClientId());

        if( evalFeeToIncome(creditApplication) &&
                evalDebtToIncome(creditApplication, client) &&
                evalMaxFinancingAmount(creditApplication) &&
                evalAge(creditApplication, client)){
            creditApplication.setApplicationState(2);
            updateCreditApplication(creditApplication);
        }
        else{
            creditApplication.setApplicationState(6);
            updateCreditApplication(creditApplication);
        }
    }

    private BigDecimal fetchMonthlyPayment(int reqAmount, int reqMonths, double interestRate){
        String url =  "http://loan-type-service/api/loanType/calculateMonthlyPayment?requestedAmount=" + reqAmount + "&requestedMonths="+reqMonths+"&interestRate="+ interestRate;
        BigDecimal monthlyPayment;
        try{
            ResponseEntity<BigDecimal> response = restTemplate.postForEntity(url,null, BigDecimal.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                monthlyPayment = response.getBody();
            }
            else{
                throw new RuntimeException("Failed to fetch calculated monthly payment");
            }
        }catch (Exception e){
            throw new RuntimeException("Error while calling LoanTypeService: " + e.getMessage(), e);
        }
        return monthlyPayment;
    }

    private Client fetchClient(Long clientId){
        String url= "http://register-service/api/client/" + clientId;
        Client client;

        try{
            ResponseEntity<Client> response = restTemplate.getForEntity(url, Client.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                client = response.getBody();
            }
            else{
                throw new RuntimeException("Failed to fetch client " + clientId);
            }
        }catch (Exception e){
            throw new RuntimeException("Error while calling ClientService: " + e.getMessage(), e);
        }
        return client;
    }

    private void updateCreditApplication(CreditApplication creditApplication) {
        String url = "http://credit-application-service/api/application/update/" + creditApplication.getId();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CreditApplication> requestEntity = new HttpEntity<>(creditApplication, headers);

        try {
            ResponseEntity<CreditApplication> response = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, CreditApplication.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("El estado se cambió exitosamente huehue");
                String actionDescription = "";
                if (creditApplication.getApplicationState() == 2) actionDescription = "In evaluation, by automated system";
                else if (creditApplication.getApplicationState() == 6) actionDescription = "Rejected, by automated system";

                Evaluation evaluation = new Evaluation();
                evaluation.setIdCreditApplication(creditApplication.getId());
                evaluation.setAction(actionDescription);
                evaluation.setActionDate(LocalDate.now());
                evaluationRepository.save(evaluation);

            } else {
                throw new RuntimeException("Fallo al cambiar el estado: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al llamar a CreditApplicationService: " + e.getMessage(), e);
        }
    }

    private LoanType fetchLoanType(String loanTypeName){
        String url= "http://loan-type-service/api/loanType/byLoanType?loanTypeName=" + loanTypeName;
        LoanType loanType;

        try{
            ResponseEntity<LoanType> response = restTemplate.getForEntity(url, LoanType.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                loanType= response.getBody();
            }
            else{
                throw new RuntimeException("Failed to fetch loan Type " + loanTypeName);
            }
        }catch (Exception e){
            throw new RuntimeException("Error while calling LoanTypeService: " + e.getMessage(), e);
        }
        return loanType;
    }

    private CreditApplication fetchCreditApplication(long id){
        String url= "http://credit-application-service/api/application/" + id;
        CreditApplication creditApplication;

        try{
            ResponseEntity<CreditApplication> response = restTemplate.getForEntity(url, CreditApplication.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                creditApplication= response.getBody();
            }
            else{
                throw new RuntimeException("Failed to fetch credit application");
            }
        }catch (Exception e){
            throw new RuntimeException("Error while calling credit application Service: " + e.getMessage(), e);
        }
        return creditApplication;
    }

    public void updateAndAddComment(CreditApplication creditApplication, String comment, int state){
        creditApplication.setComment(comment);
        creditApplication.setApplicationState(state);
        updateCreditApplication(creditApplication);
    }
}
