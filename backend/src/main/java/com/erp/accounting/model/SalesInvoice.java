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
    private String salesExecutive;
    @Column(length = 1000)
    private String remarks;
    private String drChallanNo;
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

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sales_invoice_id")
    private List<SalesInvoiceItem> items = new ArrayList<>();
}
