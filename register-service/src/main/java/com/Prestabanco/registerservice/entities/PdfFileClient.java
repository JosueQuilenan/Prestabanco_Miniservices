package com.Prestabanco.registerservice.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="pdf_files_client")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PdfFileClient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique=true, nullable=false)
    private Long id;

    private byte[] pdfFile;

    @JsonBackReference(value = "savings-account-pdf-files")
    @ManyToOne
    @JoinColumn(name = "savings_account_id")
    private SavingsAccount savingsAccount;
}
