package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "purchase_invoices")
public class PurchaseInvoice extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String purchaseAc;
    private String invoiceNo;
    private LocalDate invoiceDate;
    private String invoiceType; // REGULAR, etc.
    private String taxType; // GST INTERSTATE, etc.
    private String gstType; // Purchase Taxable, etc.
    private String supplierName;
    private String supplierLocation;
    @Column(length = 500)
    private String supplierAddress;
    private String purchaseExecutive;
    @Column(length = 1000)
    private String remarks;
    private String ftmNo;
    private String vehicleNo;
    private String vendorCode;
    private Integer crDays;
    private LocalDate dueDate;

    // Totals
    private Double grossTotal;
    private Double discount;
    private Double pf;
    private Double freight;
    private Double other;
    private Double igst;
    private Double cgst;
    private Double sgst;
    private Double roundOff;
    private Double netTotal;
    private Double totalQty;
    
    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION DEFAULT 0.0")
    private Double paidAmount = 0.0;

    @Transient
    public Double getBalanceAmount() {
        return (netTotal != null ? netTotal : 0.0) - (paidAmount != null ? paidAmount : 0.0);
    }

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "purchase_invoice_id")
    private List<PurchaseInvoiceItem> items = new ArrayList<>();
}
