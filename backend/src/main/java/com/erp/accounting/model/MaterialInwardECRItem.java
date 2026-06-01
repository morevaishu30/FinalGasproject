package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "material_inward_ecr_items")
public class MaterialInwardECRItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cylinderNo;
    private Double capacity;
    private String itemDescription;
    private String damage;
    private LocalDate supplyDt;
    private String gdaNo;
    private String propotion;
}
