package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class MaterialOutwardETMItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cylProp;
    private String cylinderNo;
    private String capacity;
    private String itemDescription;
    private String propotion;
    private String unit;
    private String pressure;
    private String weight;
}
