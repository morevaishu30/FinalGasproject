package com.erp.accounting.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
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
    private String mode; // Cylinder or SKID
    private String customerPrefix;
    private String cylRotationNo;
    private String make;
    private String itemGrade;
    private String cylinderType;
    private String bodyType;
    private String wcType;
    private String capacity;
    private String useIn;
    private Boolean importedCylinder;
    private String hydroTestDays;
    private LocalDate lastHdDate;
    private String hdReminderDays;
    private String cylinderStatus;
    private String tareWeight;

    // Purchase Details
    private String pBillNo;
    private LocalDate pBillDate;
    private String pSupplierName;
    private String pEcrNo;
    private Double pRate;

    // Sales Details
    private String sBillNo;
    private LocalDate sBillDate;
    private String sCustomerName;
    private String sGdaNo;
    private Double sRate;

    // SKID Details
    @Column(columnDefinition = "TEXT")
    private String skidCylinderNoUse;
    private Boolean skidReCheck;
    private LocalDate skidCheckDate;
    private LocalDate lastHeatDate;
    private LocalDate lastPaintDate;
}
