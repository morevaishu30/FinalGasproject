package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "material_outward_gda_items")
public class MaterialOutwardGDAItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cylinderNo;
    private String itemDescription;
    private Double capacity;
    private Double qty;
    private Double rate;
    private Double amount;
    private String remark;
}
