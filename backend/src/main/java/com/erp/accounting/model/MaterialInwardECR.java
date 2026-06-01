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
@Table(name = "material_inward_ecrs")
public class MaterialInwardECR extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ecrNo;
    private LocalDate entryDate;
    private String partyName;
    private String location;
    private String cylProperty;
    private String ckd;
    private Integer noOfCaps;
    @Column(length = 1000)
    private String remark;
    private Boolean returnFromEtm;
    private Boolean receiveForHydroTest;
    private String challanNo;
    private LocalDate challanDate;
    private String vehicleType;
    private String contractor;
    private String vehicleRegNo;
    private String book;
    private LocalDate billDate;
    private String salesAc;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "material_inward_ecr_id")
    private List<MaterialInwardECRItem> items = new ArrayList<>();
}
