package com.erp.accounting.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "document_sequences")
public class DocumentSequence {
    @Id
    private String documentType;
    private String prefix;
    private Long nextSequence;
    private Integer padding;
}
