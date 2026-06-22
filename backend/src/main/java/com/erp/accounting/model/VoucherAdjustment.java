package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "voucher_adjustments")
public class VoucherAdjustment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String type;
    private String book;
    private String docNo;
    private String refNo;
    private Double orgAmount;
    private Double dueAmount;
    private Double recAmount; // Amount received/paid against this document
    private String other;
    
    // Link to the actual invoice ID
    private Long invoiceId;
}
