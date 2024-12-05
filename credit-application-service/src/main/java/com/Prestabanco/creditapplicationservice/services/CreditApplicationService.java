package com.Prestabanco.creditapplicationservice.services;

import com.Prestabanco.creditapplicationservice.entities.CreditApplication;
import com.Prestabanco.creditapplicationservice.models.Client;
import com.Prestabanco.creditapplicationservice.repositories.CreditApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class CreditApplicationService {

    final CreditApplicationRepository creditApplicationRepository;
    private final RestTemplate restTemplate;

    public CreditApplicationService(CreditApplicationRepository creditApplicationRepository, RestTemplate restTemplate) {
        this.creditApplicationRepository = creditApplicationRepository;
        this.restTemplate = restTemplate;
    }

    public List<CreditApplication> getAllCreditApplications() {
        return creditApplicationRepository.findAll();
    }

    public CreditApplication getCreditApplicationById(Long id) {
        return creditApplicationRepository.findById(id).orElse(null);
    }

    public List<CreditApplication> getCreditApplicationsByClientId(Long clientId){
        return creditApplicationRepository.getByClientId(clientId);
    }

    public CreditApplication saveCreditApplication(CreditApplication creditApplication) {
        CreditApplication updatedApplication = creditApplicationRepository.save(creditApplication);
        checkAndUpdateDocumentationStatus(updatedApplication, updatedApplication.getApplicationState());
        return creditApplicationRepository.save(updatedApplication);
    }

    public CreditApplication updateCreditApplication(CreditApplication creditApplication) {
        return creditApplicationRepository.save(creditApplication);
    }

    public void updateCreditApplicationState(CreditApplication creditApplication, int state) {
        creditApplication.setApplicationState(state);
        creditApplicationRepository.save(creditApplication);
    }

    public boolean hasPendingDocuments (CreditApplication creditApplication) {
        if (creditApplication.getValuationCertificate().getPdfFiles().isEmpty() ||
                creditApplication.getIncomeProof().getPdfFiles().isEmpty()) {
            return true;
        }

        String loanTypeName = creditApplication.getLoanTypeName();

        String url = "http://register-service/api/client/" + creditApplication.getClientId();

        Client client;

        try{
            ResponseEntity<Client> response = restTemplate.getForEntity(url, Client.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                client = response.getBody();
            }
            else{
                throw new RuntimeException("Failed to fetch client " + creditApplication.getClientId());
            }
        }catch (Exception e){
            throw new RuntimeException("Error while calling ClintService: " + e.getMessage(), e);
        }

        if ("First home".equals(loanTypeName) &&
                client.getCreditHistory() == null) {
            return true;
        } else if ("Second home".equals(loanTypeName) &&
                (client.getCreditHistory() == null ||
                        creditApplication.getFirstHomeDeed().getPdfFiles().isEmpty())) {
            return true;
        } else if ("Commercial Properties".equals(loanTypeName) &&
                (creditApplication.getBusinessFinancialStatement().getPdfFiles().isEmpty() ||
                        creditApplication.getBusinessPlan().getPdfFiles().isEmpty())) {
            return true;
        } else return "Remodeling".equals(loanTypeName) &&
                creditApplication.getRenovationBudget().getPdfFiles().isEmpty();
    }

    public void checkAndUpdateDocumentationStatus(CreditApplication creditApplication, int state) {
        boolean hasMissingDocuments = hasPendingDocuments(creditApplication);
        if (hasMissingDocuments) {
            creditApplication.setComment("Falta un documento (PDF) en alguno de tus documentos requeridos.");
            updateCreditApplicationState(creditApplication, 1);
        } else {
            updateCreditApplicationState(creditApplication, state);
        }
    }

    public boolean deleteCreditApplication(Long id) throws Exception {
        if (!creditApplicationRepository.existsById(id)) {
            throw new Exception("Credit Application with ID " + id + " does not exist.");
        }
        else {
            creditApplicationRepository.deleteById(id);
            return true;
        }
    }
}
