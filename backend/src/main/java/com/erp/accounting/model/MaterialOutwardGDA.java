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
@Table(name = "material_outward_gdas")
public class MaterialOutwardGDA extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gdaNo;
    private LocalDate entryDate;
    private String partyName;
    private String location;
    private String orderNo;
    private LocalDate orderDate;
    private String vehicleType;
    private String contractor;
    private String vehicleRegNo;
    @Column(length = 1000)
    private String remark;
    private String book;
    private String salesAc;
    
    // Missing GDA fields from UI layout
    private String packType;
    private String gdaType;
    private Integer noOfCaps;
    private String modeOfTransport;
    private String primaryVehicleRegNo;
    private String lrNo;
    private String reason;
    private Boolean cylinderDetailFromQrCode;
    private String cylProperty;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "material_outward_gda_id")
    private List<MaterialOutwardGDAItem> items = new ArrayList<>();
}
