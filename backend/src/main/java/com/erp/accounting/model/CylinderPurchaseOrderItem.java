package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "cylinder_purchase_order_items")
public class CylinderPurchaseOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemDescription;
    private String unit;
    private Double capacity;
    private Integer noOfCyl;
    private Double gasQty;
    private Double ratePer;
    private Double rate;
    private Double amount;
    private String partyItemCode;
    private LocalDate deliveryDate;
    private String outright;
}
