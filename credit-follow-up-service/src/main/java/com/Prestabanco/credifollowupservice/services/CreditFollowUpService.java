package com.Prestabanco.credifollowupservice.services;

import com.Prestabanco.credifollowupservice.models.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.HashMap;

@Service
public class CreditFollowUpService {

    private final RestTemplate restTemplate;

    public CreditFollowUpService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
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
        String url = "http://credit-application-service/api/application/updateState/" + applicationId;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Integer> body = new HashMap<>();
        body.put("state", state);

        HttpEntity<Map<String, Integer>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<CreditApplication> response = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, CreditApplication.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("El estado se cambió exitosamente jiji");
            } else {
                throw new RuntimeException("Fallo al cambiar el estado: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al llamar a CreditApplicationService: " + e.getMessage(), e);
        }
    }
}
