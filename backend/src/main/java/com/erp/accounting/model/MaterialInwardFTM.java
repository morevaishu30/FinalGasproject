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
@Table(name = "material_inward_ftms")
public class MaterialInwardFTM extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String entryNo;
    private LocalDate entryDate;
    private String customerName;
    private String cylProperty;
    private String etmNo;
    private String bookName;
    private String vehicleType;
    private String contractor;
    private String vehicleRegNo;
    private Boolean replacement;
    private Boolean calculateLoadingAmt;
    private Boolean notBillable;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "material_inward_ftm_id")
    private List<MaterialInwardFTMItem> items = new ArrayList<>();
}
