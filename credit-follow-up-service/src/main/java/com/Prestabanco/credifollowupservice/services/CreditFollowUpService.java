package com.Prestabanco.credifollowupservice.services;

import com.Prestabanco.credifollowupservice.models.*;
import com.Prestabanco.credifollowupservice.entities.*;
import com.Prestabanco.credifollowupservice.respositories.FollowUpRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;

@Service
public class CreditFollowUpService {

    private final RestTemplate restTemplate;
    private final FollowUpRepository followUpRepository;

    public CreditFollowUpService(RestTemplate restTemplate, FollowUpRepository followUpRepository) {
        this.restTemplate = restTemplate;
        this.followUpRepository = followUpRepository;
    }

    // Cancel application
    public void cancelApplication(Long applicationId){
        changeCreditState(applicationId,7);
    }

    // Enter final Approbation Phase
    public void finalApprobation(Long applicationId){
        changeCreditState(applicationId, 4);
    }

    private void changeCreditState(Long applicationId, int state) {
        String url = "http://credit-application-service/api/application/updateState/" + applicationId + "?state=" + state;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<CreditApplication> response = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, CreditApplication.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("El estado se cambió exitosamente jiji");
                String actionDescription = "";
                if (state == 7) actionDescription = "Cancelled";
                else if (state == 4) actionDescription = "Final Approve Phase";

                FollowUp followUp = new FollowUp();
                followUp.setIdCreditApplication(applicationId);
                followUp.setAction(actionDescription);
                followUp.setActionDate(LocalDate.now());
                followUpRepository.save(followUp);
            } else {
                throw new RuntimeException("Fallo al cambiar el estado: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al llamar a CreditApplicationService: " + e.getMessage(), e);
        }
    }
}
