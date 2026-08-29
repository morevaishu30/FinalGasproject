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
@Table(name = "sales_invoices")
public class SalesInvoice extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String salesAc;
    private String invoiceNo;
    private LocalDate invoiceDate;
    private String invoiceType; // REGULAR, etc.
    private String taxType; // GST LOCAL, etc.
    private String gstType; // Sales Taxable, etc.
    private String customerName;
    private String customerLocation;
    @Column(length = 500)
    private String customerAddress;
    private String customerGstNo;
    private String salesExecutive;
    @Column(length = 1000)
    private String remarks;
    private String gdaNo;
    private String vehicleNo;
    private String vendorCode;
    private String poNo;
    private LocalDate poDate;
    private String chNo;
    private LocalDate chDate;
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
    @JoinColumn(name = "sales_invoice_id")
    private List<SalesInvoiceItem> items = new ArrayList<>();
}
