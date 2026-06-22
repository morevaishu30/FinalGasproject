package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;
    
    private String referenceType; // e.g. "CUSTOMER", "SUPPLIER", "CYLINDER"
    private Long referenceId;

    @Lob
    private byte[] data;
}
