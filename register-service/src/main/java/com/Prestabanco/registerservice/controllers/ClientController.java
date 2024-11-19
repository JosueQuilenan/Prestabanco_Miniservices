package com.Prestabanco.registerservice.controllers;

import com.Prestabanco.registerservice.entities.Client;
import com.Prestabanco.registerservice.models.CreditApplication;
import com.Prestabanco.registerservice.services.ClientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClient(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @GetMapping("/{id}/creditApplications")
    public ResponseEntity<List<CreditApplication>> getCreditApplications(@PathVariable Long id) {
        List<CreditApplication> applications = clientService.getCreditApplicationsByClientId(id);
        return ResponseEntity.ok(applications);
    }


    @GetMapping("/byRut")
    public ResponseEntity<Client> getClientByRut(@RequestParam String rut) {
        return ResponseEntity.ok(clientService.getClientByRut(rut));
    }

    @GetMapping("/")
    public ResponseEntity<List<Client>> getClients() {
        return ResponseEntity.ok(clientService.getClients());
    }

    @PostMapping("/add")
    public ResponseEntity<Client> addClient(@RequestBody Client client) {
        return ResponseEntity.ok(clientService.saveClient(client));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Client> updateClientById(@PathVariable Long id, @RequestBody Client client) {
        client.setId(id);
        Client updatedClient = clientService.updateClient(client);
        return ResponseEntity.ok(updatedClient);
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteClientById(@PathVariable Long id) {
        try {
            boolean isDeleted = clientService.deleteClient(id);
            if (isDeleted) {
                return ResponseEntity.ok("Client " + id + " deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete client " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting client: " + e.getMessage());
        }
    }
}