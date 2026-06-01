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
public class PurchaseOrder extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Header Left
    private String entryNo;
    private LocalDate entryDate;
    private String customerName;
    private String customerLocation;
    private String customerAddress;
    // Header Right
    private String supplierOrderNo;
    private LocalDate supplierOrderDate;
    private String consigneeName;
    private String consigneeLocation;
    private String consigneeAddress;
    private String quotationNo;
    private LocalDate quotationDate;
    private Double depositAmount;
    private Double transportationAmount;
    private String taxType;
    private Boolean importedItem;
    private Boolean closeOrder;

    // Items
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "purchase_order_id")
    private List<PurchaseOrderItem> items = new ArrayList<>();

    // Summary
    private Double grossTotal;
    private Double discount;
    private Double pf;
    private Double freight;
    private Double otherCharges;
    private Double igst;
    private Double sgst;
    private Double cgst;
    private Double noTaxDkp;
    private Double noTaxDisc;
    private Double tcs;
    private Double netTotal;

    // Footer
    private Boolean generateRateMaster;
}
