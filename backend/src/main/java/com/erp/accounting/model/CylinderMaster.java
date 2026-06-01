package com.erp.accounting.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class CylinderMaster extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Main Details
    private String cylinderOriginalNo;
    private String cylinderOwnership;
    private String cylRotationNo;
    private String make;
    private String itemGrade;
    private String cylinderType;
    private String bodyType;
    private String capacity;
    private String useIn;
    private Boolean importedCylinder;
    private String cylinderStatus;

    // Purchase Details
    private String pBillNo;
    private LocalDate pBillDate;
    private String pSupplierName;
    private String pEcrNo;
    private Double pRate;
}
