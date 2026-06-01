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
@Table(name = "cylinder_purchase_orders")
public class CylinderPurchaseOrder extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Header Left
    private String entryNo;
    private LocalDate entryDate;
    private String customerName;
    private String customerLocation;
    private String customerAddress;
    private String salesExecutive;
    private String orderType1;
    private String orderType2;
    private String orderType3;
    private Boolean ldApplicable;
    private String ldOn;
    private Double ldRate;
    
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
    @JoinColumn(name = "cylinder_purchase_order_id")
    private List<CylinderPurchaseOrderItem> items = new ArrayList<>();

    // Summary
    private Double grossTotal;
    private Double discountRate;
    private Double discount;
    private Double pf;
    private Double freight;
    private Double otherCharges;
    private Double igst;
    private Double sgst;
    private Double cgst;
    private Double noTaxDkp;
    private Double noTaxDisc;
    private Double tcsRate;
    private Double tcs;
    private Double netTotal;

    // Footer
    private String subject;
    private Boolean generateRateMaster;
    private Boolean scopeOfSupply;
}
