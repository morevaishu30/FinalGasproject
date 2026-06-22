package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "material_inward_ftm_items")
public class MaterialInwardFTMItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cylinderNo;
    private Double capacity;
    private String itemDescription;
    private Double recQty;
    private Double gainQty;
    private String unit;
    private String propotion;
}
