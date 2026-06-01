package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "material_purchase_items")
public class MaterialPurchaseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemDescription;
    private String unit;
    private Integer partyCyl;
    private Integer ourCyl;
    private Double capacity;
    private Double qty;
    private String ratePer;
    private Double rate;
    private Double amount;
    @Column(length = 500)
    private String remark;
}
