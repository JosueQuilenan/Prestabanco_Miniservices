package com.Prestabanco.registerservice.repositories;

import com.Prestabanco.registerservice.entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client,Long> {
    Client findByRut(String rut);
}
