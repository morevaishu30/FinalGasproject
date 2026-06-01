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
public class MaterialOutwardETM extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serialNo;
    private LocalDate entryDate;
    private String partyName;
    private String location;
    private String cgd;
    private String vodr;
    private String etmType;
    private Boolean calcLoadingAmt;
    private Boolean qrCodeDetail;
    private String vehicleType;
    private String contractor;
    private String vehicleRegNo;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "etm_id")
    private List<MaterialOutwardETMItem> items = new ArrayList<>();
}
