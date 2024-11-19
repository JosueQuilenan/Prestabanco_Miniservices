package com.Prestabanco.registerservice.services;
import com.Prestabanco.registerservice.entities.Client;
import com.Prestabanco.registerservice.entities.CreditHistory;
import com.Prestabanco.registerservice.entities.SavingsAccount;
import com.Prestabanco.registerservice.models.CreditApplication;
import com.Prestabanco.registerservice.repositories.ClientRepository;
import com.Prestabanco.registerservice.repositories.CreditHistoryRepository;
import com.Prestabanco.registerservice.repositories.SavingsAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ClientService {

    final ClientRepository clientRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    private final RestTemplate restTemplate;

    public ClientService(ClientRepository clientRepository,
                         RestTemplate restTemplate,
                         CreditHistoryRepository creditHistoryRepository,
                         SavingsAccountRepository savingsAccountRepository) {
        this.clientRepository = clientRepository;
        this.restTemplate = restTemplate;
        this.creditHistoryRepository = creditHistoryRepository;
        this.savingsAccountRepository = savingsAccountRepository;
    }

    public List<Client> getClients(){
        return clientRepository.findAll();
    }

    public Client saveClient(Client client){
        Client savedClient = clientRepository.save(client);
        CreditHistory creditHistory = new CreditHistory();
        creditHistory.setClient(savedClient);
        creditHistory.setTotalAmount(0);
        creditHistory.setPendingAmount(0);
        creditHistory.setCreditRating("A");
        creditHistory.setLastCreditDate(LocalDate.now());

        creditHistoryRepository.save(creditHistory);

        SavingsAccount savingsAccount = new SavingsAccount();
        savingsAccount.setClient(savedClient);
        savingsAccount.setAccountOpeningDate(LocalDate.now());
        savingsAccount.setBalance(0.0);

        savingsAccount.setPdfFiles(new ArrayList<>());

        savingsAccountRepository.save(savingsAccount);

        return savedClient;
    }

    public Client getClientById(Long id){
        return clientRepository.findById(id).orElse(null);
    }

    public Client getClientByRut(String rut){
        return clientRepository.findByRut(rut);
    }

    public Client updateClient(Client client) {
        return clientRepository.save(client);
    }

    public boolean deleteClient(Long id) throws Exception{
        if (!clientRepository.existsById(id)) {
            throw new Exception("Client with ID " + id + " does not exist.");
        }
        else {
            clientRepository.deleteById(id);
            return true;
        }
    }

    public List<CreditApplication> getCreditApplicationsByClientId(Long clientId) {
        String url = "http://credit-application-service/api/application/byClient/" + clientId;

        try {
            ResponseEntity<CreditApplication[]> response =
                    restTemplate.getForEntity(url, CreditApplication[].class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Arrays.asList(response.getBody());
            } else {
                throw new RuntimeException("Failed to fetch CreditApplications for client " + clientId);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while calling CreditApplicationService: " + e.getMessage(), e);
        }
    }
}
