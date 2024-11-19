package com.Prestabanco.registerservice.repositories;

import com.Prestabanco.registerservice.entities.PdfFileClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PdfFileClientRepository extends JpaRepository<PdfFileClient, Long> {
}
