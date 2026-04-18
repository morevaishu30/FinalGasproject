package com.erp.accounting.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class CustomerLedger extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Top Panel Fields
    private String customerName;
    private String printName;
    private String accountType;
    private String underGroup;
    private String alternateUnderGroup;
    private String diaryName;
    
    private Boolean vehicleQa;
    private Boolean qrCodePrint;
    private Boolean inactiveAc;
    private Boolean legalCase;

    // Tab 1: Accounting Detail
    private String terms;
    private Integer termsDays;
    private Double creditLimit;
    private Integer holdingQty;
    private Integer creditDays;
    private Double debitInterest;
    private Double creditInterest;
    private String operatingType; // "Bill To Bill Payment" or "Balance Only"

    // Tab 2: Address Detail
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String phone;

    // Tab 3: Registration Detail
    private String gstin;
    private String pan;
    private String registrationType;

    // Tab 4: Tax/Item/Sector Detail
    private Double taxPercentage;
    private String sector;
    private String itemCategory;
}
