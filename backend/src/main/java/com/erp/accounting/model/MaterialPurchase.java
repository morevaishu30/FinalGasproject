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
@Table(name = "material_purchases")
public class MaterialPurchase extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String purchaseAc;
    private String entryNo;
    private LocalDate entryDate;
    private String supplierName;
    private String supplierLocation;
    @Column(length = 500)
    private String supplierAddress;
    private String consigneeName;
    private String invoiceType;
    private String taxType;
    private String gstType;
    private Integer crDays;
    private LocalDate dueDate;
    private String salesExecutive;
    @Column(length = 1000)
    private String remarks;
    private String billNo;
    private LocalDate billDate;

    // Totals
    private Double grossTotal;
    private Double discount;
    private Double pf;
    private Double freight;
    private Double igst;
    private Double cgst;
    private Double sgst;
    private Double tcs;
    private Double netTotal;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION DEFAULT 0.0")
    private Double paidAmount = 0.0;

    @Transient
    public Double getBalanceAmount() {
        return (netTotal != null ? netTotal : 0.0) - (paidAmount != null ? paidAmount : 0.0);
    }

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "material_purchase_id")
    private List<MaterialPurchaseItem> items = new ArrayList<>();
}
